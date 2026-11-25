import { createClient } from "npm:@supabase/supabase-js@2.89.0";
import {
  bucket,
  defaultMaxBytes,
  formats,
  matchesVideoHeader,
  videoFormat,
} from "./video.ts";

const env = (name: string) => Deno.env.get(name)?.trim() ?? "";
const url = env("SUPABASE_URL");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
const recipient = "meirlanrlnl@gmail.com";
const teacherId = env("STORY_TEACHER_USER_ID").toLowerCase();
const allowedOrigins = env("STORY_ALLOWED_ORIGINS")
  .split(",")
  .map((s) => s.trim());
const maxBytes = Number(env("STORY_MAX_VIDEO_BYTES") || defaultMaxBytes);
const sender = env("STORY_EMAIL_FROM");
const resendKey = env("RESEND_API_KEY");
const dashboardUrl = env("STORY_FRONTEND_URL").replace(/#.*$/, "");
const signingSalt = env("STORY_RATE_LIMIT_SALT");
const maintenanceKey = env("STORY_MAINTENANCE_KEY");
const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/;
const teacherAuthReady = /^[\da-f-]{36}$/.test(teacherId);
const ready = Boolean(
  url && serviceKey && allowedOrigins.some(Boolean),
);
const notificationsReady = Boolean(
  sender &&
  resendKey &&
  (dashboardUrl.startsWith("https://") || local.test(dashboardUrl)),
);
const uploadsReady = Boolean(
  notificationsReady &&
  signingSalt.length >= 32 &&
  Number.isSafeInteger(maxBytes) &&
  maxBytes > 0,
);
const storageHost =
  env("STORY_STORAGE_URL") ||
  url.replace(/\.supabase\.co$/, ".storage.supabase.co");
const db = createClient(
  url || "http://127.0.0.1:54321",
  serviceKey || "unconfigured",
  { auth: { persistSession: false } },
);
const table = () => db.from("storytelling_submissions");
const store = db.storage.from(bucket);
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const dashboardFields =
  "id,student_name,class_group,story_title,description,filename,size_bytes,message,submitted_at,status,email_status,scores,feedback";
const submitted = ["submitted", "assessed"];
type Body = Record<string, unknown>;
type Project = {
  id: string;
  secret_hash: string;
  source_hash: string;
  student_name: string;
  class_group: string;
  story_title: string;
  description: string;
  message: string;
  filename: string;
  size_bytes: number;
  mime: string;
  object_path: string;
  created_at: string;
  submitted_at: string;
  status: string;
  email_status: string;
  email_first_attempt_at: string | null;
  email_last_attempt_at: string | null;
};
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const failure = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
function text(body: Body, key: string, max: number, optional = false) {
  const value = body[key];
  if (optional && value === undefined) return "";
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!optional && !value.trim()) ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)
  ) {
    return failure(400, "Check the required fields and their length.");
  }
  return value.trim();
}
const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, " ");
function idOf(body: Body) {
  const id = text(body, "id", 36);
  if (!uuid.test(id)) failure(400, "This submission ID is invalid.");
  return id;
}
async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
async function secretHash(body: Body) {
  const secret = text(body, "secret", 72);
  if (
    secret.length !== 72 ||
    !uuid.test(secret.slice(0, 36)) ||
    !uuid.test(secret.slice(36))
  )
    failure(400, "This upload session is invalid.");
  return await hash(secret);
}
const same = (a: string, b: string) =>
  a.length === b.length &&
  [...a].reduce(
    (diff, char, i) => diff | (char.charCodeAt(0) ^ b.charCodeAt(i)),
    0,
  ) === 0;
async function find(id: string): Promise<Project | null> {
  const { data, error } = await table().select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
function own(project: Project | null, secret: string): Project {
  if (!project || !same(project.secret_hash, secret))
    return failure(404, "This upload session was not found.");
  return project;
}
function receipt(p: Project) {
  return {
    id: p.id,
    student_name: p.student_name,
    story_title: p.story_title,
    submitted_at: p.submitted_at,
    email_status: p.email_status,
  };
}
const hour = 3_600_000;
const minutes = (n: number) => n * 60_000;
const now = () => new Date().toISOString();

async function start(body: Body, request: Request) {
  const id = idOf(body);
  const secret = await secretHash(body);
  let project = await find(id);
  if (project) {
    own(project, secret);
    if (submitted.includes(project.status))
      return { receipt: receipt(project) };
  }
  const filename = oneLine(text(body, "filename", 240));
  const format = videoFormat(filename);
  const size = body.size;
  if (!format || /[/\\]/.test(filename))
    return failure(400, "Choose an MP4, MOV, or WebM video.");
  if (
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    size < 1 ||
    size > maxBytes
  )
    return failure(400, "The video is larger than allowed or is empty.");
  if (body.consent !== true)
    failure(400, "Confirm that you have permission to share the video.");
  const fields = {
    student_name: oneLine(text(body, "studentName", 120)),
    class_group: oneLine(text(body, "classGroup", 100)),
    story_title: oneLine(text(body, "storyTitle", 160)),
    description: text(body, "description", 1200),
    message: text(body, "message", 1000, true),
    filename,
    size_bytes: size,
    mime: formats[format],
  };
  if (!project) {
    // The gateway appends the connecting proxy/client address to X-Forwarded-For.
    // The independent database-wide limit still applies if this header is missing.
    const address =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      "unknown";
    const { error } = await db.rpc("reserve_storytelling_submission", {
      project: {
        ...fields,
        id,
        secret_hash: secret,
        source_hash: await hash(signingSalt + ":" + address.slice(0, 128)),
        object_path: `${id}/video.${format}`,
      },
    });
    if (error?.message === "storytelling_rate_limit")
      failure(429, "Too many upload requests. Please try again later.");
    if (error) throw error;
    project = own(await find(id), secret);
    if (submitted.includes(project.status))
      return { receipt: receipt(project) };
  }
  if (
    project.status !== "uploading" ||
    Date.now() - Date.parse(project.created_at) > 24 * hour
  ) {
    failure(
      409,
      "This upload session has closed. Choose your file again to start a new session.",
    );
  }
  const existing = await store.info(project.object_path);
  if (existing.data) return { receipt: receipt(await finish(body)) };
  if (
    (Object.keys(fields) as (keyof typeof fields)[]).some(
      (key) => fields[key] !== project[key],
    )
  ) {
    failure(
      409,
      "These details changed. Choose your video again to start a new upload.",
    );
  }
  const { data, error } = await store.createSignedUploadUrl(
    project.object_path,
    { upsert: false },
  );
  if (error) throw error;
  return {
    endpoint: storageHost + "/storage/v1/upload/resumable/sign",
    path: project.object_path,
    token: data.token,
  };
}

async function verify(project: Project) {
  const { data: item, error } = await store.info(project.object_path);
  if (error || !item)
    failure(409, "Your video has not finished uploading. Retry to continue.");
  const format = videoFormat(project.filename)!;
  if (
    Number(item?.size) !== project.size_bytes ||
    Number(item?.size) > maxBytes ||
    item?.contentType !== formats[format]
  ) {
    failure(
      400,
      "The saved video does not match its file size or type. Choose the correct video and try again.",
    );
  }
  const signed = await store.createSignedUrl(project.object_path, 60);
  if (signed.error) throw signed.error;
  const video = await fetch(signed.data.signedUrl, {
    headers: { Range: "bytes=0-4095" },
    signal: AbortSignal.timeout(10000),
  });
  // Small files may be returned whole. Stream only enough bytes to verify the container.
  if (!video.ok || !video.body) throw new Error("Storage header check failed");
  const reader = video.body.getReader();
  const bytes = new Uint8Array(4096);
  let size = 0;
  try {
    while (size < bytes.length) {
      const next = await reader.read();
      if (next.done) break;
      const chunk = next.value.subarray(0, bytes.length - size);
      bytes.set(chunk, size);
      size += chunk.length;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (!matchesVideoHeader(format, bytes.subarray(0, size))) {
    failure(
      400,
      "The stored file does not match its video type. Choose a valid video and try again.",
    );
  }
}
async function finish(body: Body) {
  const id = idOf(body);
  let project = own(await find(id), await secretHash(body));
  if (submitted.includes(project.status)) return project;
  if (
    project.status !== "uploading" ||
    Date.now() - Date.parse(project.created_at) > 24 * hour
  ) {
    failure(409, "This upload session has closed. Choose your file again.");
  }
  await verify(project);
  const { data, error } = await table()
    .update({ status: "submitted", submitted_at: now() })
    .eq("id", id)
    .eq("status", "uploading")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  project = data ?? own(await find(id), project.secret_hash);
  if (!submitted.includes(project.status))
    failure(409, "This submission is no longer available.");
  try {
    await notify(project);
  } catch {
    console.error("Storytelling notification state could not be updated", id);
  }
  return (await find(id)) ?? project;
}

async function notify(project: Project) {
  if (
    !submitted.includes(project.status) ||
    ["sent", "review"].includes(project.email_status)
  )
    return;
  const firstAt = project.email_first_attempt_at;
  const lastAt = project.email_last_attempt_at;
  if (lastAt && Date.now() - Date.parse(lastAt) < minutes(2)) return;
  if (!notificationsReady) {
    const { error } = await table()
      .update({
        email_status: "failed",
        email_error: "Email provider is unconfigured",
      })
      .eq("id", project.id)
      .in("status", submitted)
      .eq("email_status", project.email_status);
    if (error) throw error;
    return;
  }
  let update = table()
    .update({
      email_status:
        firstAt && Date.now() - Date.parse(firstAt) > 23 * hour
          ? "review"
          : "sending",
      email_first_attempt_at: firstAt ?? now(),
      email_last_attempt_at: now(),
    })
    .eq("id", project.id)
    .in("status", submitted)
    .eq("email_status", project.email_status);
  update = lastAt
    ? update.eq("email_last_attempt_at", lastAt)
    : update.is("email_last_attempt_at", null);
  const { data: claim, error } = await update
    .select("email_last_attempt_at,email_status")
    .maybeSingle();
  if (error) throw error;
  if (!claim || claim.email_status !== "sending") return;
  let outcome: Body;
  const link = teacherAuthReady
    ? `${dashboardUrl}#teacher/${project.id}`
    : await submissionDownloadLink(project);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `storytelling/${project.id}`,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: `New Digital Storytelling Submission — ${project.student_name}`,
        text: [
          "Hello, Teacher!",
          "",
          "A student has submitted a new digital storytelling project.",
          "",
          `Student Name: ${project.student_name}`,
          `Class / Group: ${project.class_group}`,
          `Story Title: ${project.story_title}`,
          `Description: ${project.description}`,
          `Submitted At: ${new Date(project.submitted_at).toISOString()}`,
          `Video Filename: ${project.filename}`,
          `Video Size: ${(project.size_bytes / 1_000_000).toFixed(2)} MB`,
          `Student Message: ${project.message || "None"}`,
          `Submission ID: ${project.id}`,
          `Watch or Download Video: ${link}`,
          ...(teacherAuthReady
            ? []
            : ["This private link expires 24 hours after submission."]),
          "",
          "Thank you!",
          "",
          "Digital Storytelling Classroom",
        ].join("\n"),
      }),
    });
    const body = await response.json();
    outcome =
      response.ok && typeof body.id === "string"
        ? {
            email_status: "sent",
            email_provider_id: body.id,
            email_error: null,
          }
        : {
            email_status: "failed",
            email_error: `Resend HTTP ${response.status}`,
          };
  } catch {
    outcome = {
      email_status: "failed",
      email_error: "Resend unavailable or response uncertain",
    };
  }
  const saved = await table()
    .update(outcome)
    .eq("id", project.id)
    .eq("email_last_attempt_at", claim.email_last_attempt_at);
  if (saved.error) throw saved.error;
}

async function requireTeacher(request: Request) {
  if (!teacherAuthReady)
    failure(503, "Teacher dashboard access has not been configured.");
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return failure(401, "Sign in to the teacher dashboard.");
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) failure(401, "Sign in again to continue.");
  if (data.user?.id.toLowerCase() !== teacherId)
    failure(403, "This account cannot open student submissions.");
}

async function downloadSignature(id: string, expires: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSalt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${id}:${expires}`),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function submissionDownloadLink(project: Project) {
  const expires = Date.parse(project.submitted_at) + 24 * hour;
  const signature = await downloadSignature(project.id, expires);
  const query = new URLSearchParams({
    download: project.id,
    expires: String(expires),
    signature,
  });
  return `${url}/functions/v1/storytelling?${query}`;
}

async function downloadSubmission(request: Request) {
  const query = new URL(request.url).searchParams;
  const id = query.get("download") ?? "";
  const expires = Number(query.get("expires"));
  const signature = query.get("signature") ?? "";
  if (
    !uuid.test(id) ||
    !Number.isSafeInteger(expires) ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    failure(400, "This download link is invalid.");
  const project = await find(id);
  if (!project) throw new HttpError(404, "This submission is unavailable.");
  if (!submitted.includes(project.status))
    failure(404, "This submission is unavailable.");
  const expectedExpires = Date.parse(project.submitted_at) + 24 * hour;
  if (expires !== expectedExpires || expires <= Date.now())
    failure(410, "This private download link has expired.");
  const expected = await downloadSignature(id, expires);
  if (!same(expected, signature))
    failure(403, "This download link is invalid.");
  const { data, error } = await store.createSignedUrl(project.object_path, 60, {
    download: project.filename,
  });
  if (error) throw error;
  return Response.redirect(data.signedUrl, 303);
}

async function remove(project: Project) {
  const { error } = await store.remove([project.object_path]);
  if (error) throw error;
  // These empty tombstones allow maintenance to remove an object recreated using an old signed upload URL.
  const result = await table()
    .update({
      status: "deleted",
      student_name: "",
      class_group: "",
      story_title: "",
      description: "",
      message: "",
      feedback: "",
      scores: null,
      filename: "",
      secret_hash: "",
    })
    .eq("id", project.id)
    .eq("status", "deleting");
  if (result.error) throw result.error;
}

async function maintenance() {
  const queue = await table()
    .select("*")
    .in("status", submitted)
    .in("email_status", ["pending", "failed", "sending"])
    .or(
      `email_last_attempt_at.is.null,email_last_attempt_at.lt.${new Date(Date.now() - minutes(2)).toISOString()}`,
    )
    .order("email_last_attempt_at", { ascending: true, nullsFirst: true })
    .limit(10);
  if (queue.error) throw queue.error;
  const retryResults = await Promise.allSettled((queue.data ?? []).map(notify));
  const stale = await table()
    .select("*")
    .in("status", ["uploading", "deleting", "deleted"])
    .lt("created_at", new Date(Date.now() - 51 * hour).toISOString())
    .limit(25);
  if (stale.error) throw stale.error;
  const cleanupResults = await Promise.allSettled(
    (stale.data ?? []).map(async (p: Project) => {
      const object = await store.remove([p.object_path]);
      if (object.error) throw object.error;
      const record = await table()
        .delete()
        .eq("id", p.id)
        .eq("status", p.status);
      if (record.error) throw record.error;
    }),
  );
  return {
    checked: queue.data?.length ?? 0,
    cleaned: cleanupResults.filter((r) => r.status === "fulfilled").length,
    errors: [...retryResults, ...cleanupResults].filter(
      (r) => r.status === "rejected",
    ).length,
  };
}

async function teacherAction(action: string, body: Body) {
  if (action === "list") {
    const page =
      typeof body.page === "number" && Number.isInteger(body.page)
        ? Math.min(2000, Math.max(0, body.page))
        : 0;
    let query = table()
      .select(dashboardFields, { count: "exact" })
      .in("status", [...submitted, "deleting"]);
    const student = text(body, "student", 120, true).replace(/[%_\\]/g, "");
    const group = text(body, "group", 100, true).replace(/[%_\\]/g, "");
    const day = text(body, "date", 10, true);
    const status = text(body, "status", 12, true);
    if (body.id) query = query.eq("id", idOf(body));
    if (student) query = query.ilike("student_name", `%${student}%`);
    if (group) query = query.ilike("class_group", `%${group}%`);
    if ([...submitted, "deleting"].includes(status))
      query = query.eq("status", status);
    if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const time = Date.parse(day + "T00:00:00Z");
      if (!Number.isFinite(time)) failure(400, "Choose a valid date.");
      query = query
        .gte("submitted_at", new Date(time).toISOString())
        .lt("submitted_at", new Date(time + 24 * hour).toISOString());
    }
    const [result, total] = await Promise.all([
      query
        .order("submitted_at", { ascending: false })
        .order("id")
        .range(page * 20, page * 20 + 19),
      table()
        .select("id", { count: "exact", head: true })
        .in("status", [...submitted, "deleting"]),
    ]);
    if (result.error || total.error) throw result.error ?? total.error;
    return { rows: result.data, count: result.count, total: total.count };
  }
  const id = idOf(body);
  const project = await find(id);
  if (!project || ![...submitted, "deleting"].includes(project.status))
    return failure(404, "This submission is unavailable.");
  if (action === "delete") {
    const result = await table()
      .update({ status: "deleting" })
      .eq("id", id)
      .in("status", [...submitted, "deleting"]);
    if (result.error) throw result.error;
    await remove(project);
    return { deleted: true };
  }
  if (!submitted.includes(project.status))
    failure(409, "This submission is being deleted.");
  if (action === "video") {
    const { data, error } = await store.createSignedUrl(
      project.object_path,
      300,
      body.download === true ? { download: project.filename } : {},
    );
    if (error) throw error;
    return { url: data.signedUrl };
  }
  if (action === "assess") {
    const scores = body.scores;
    if (
      !Array.isArray(scores) ||
      scores.length !== 5 ||
      scores.some((n) => !Number.isInteger(n) || n < 0 || n > 20)
    ) {
      return failure(400, "Enter five whole scores between 0 and 20.");
    }
    const { error, data } = await table()
      .update({
        scores,
        feedback: text(body, "feedback", 2500, true),
        status: "assessed",
      })
      .eq("id", id)
      .in("status", submitted)
      .select(dashboardFields)
      .single();
    if (error) throw error;
    return data;
  }
  if (action === "retry-email") {
    await notify(project);
    return { email_status: (await find(id))?.email_status };
  }
  return failure(400, "This action is not available.");
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  });
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Headers",
      "authorization, apikey, content-type, x-client-info",
    );
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  const reply = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), { status, headers });
  if (origin && !allowedOrigins.includes(origin))
    return reply({ error: "This school website is not approved." }, 403);
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "GET" && request.method !== "POST")
    return reply({ error: "Use GET or POST." }, 405);
  if (!ready)
    return reply(
      { error: "Online submissions have not been configured." },
      503,
    );
  try {
    if (request.method === "GET") return await downloadSubmission(request);
    // Limit streamed JSON too, regardless of whether the client supplied Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return failure(400, "Send a JSON request.");
    let size = 0;
    let input = "";
    const decoder = new TextDecoder();
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.length;
        if (size > 20_000) {
          await reader.cancel();
          return failure(413, "This request is too large.");
        }
        input += decoder.decode(chunk.value, { stream: true });
      }
      input += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    let body: Body;
    try {
      body = JSON.parse(input);
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw new Error();
    } catch {
      return failure(400, "Send a JSON request.");
    }
    switch (body.action) {
      case "config":
      case "start":
        if (!uploadsReady)
          return reply(
            { error: "Online submissions have not been configured." },
            503,
          );
        if (body.action === "config") return reply({ maxBytes });
        return reply(await start(body, request));
      case "finish":
        return reply(receipt(await finish(body)));
      case "maintenance": {
        if (
          maintenanceKey.length < 32 ||
          !same(
            request.headers.get("x-story-maintenance") ?? "",
            maintenanceKey,
          )
        ) {
          await requireTeacher(request);
        }
        return reply(await maintenance());
      }
      case "list":
      case "video":
      case "assess":
      case "delete":
      case "retry-email":
        await requireTeacher(request);
        return reply(await teacherAction(body.action, body));
      default:
        return reply({ error: "This action is not available." }, 400);
    }
  } catch (error) {
    if (error instanceof HttpError)
      return reply({ error: error.message }, error.status);
    console.error(
      "Storytelling operation failed",
      error instanceof Error ? error.name : "provider error",
    );
    return reply(
      {
        error:
          "The school server could not complete this request. Please try again.",
      },
      500,
    );
  }
});
