import { publicKey } from "./api";
import {
  bucket,
  formats,
  type Format,
} from "../../supabase/functions/storytelling/video";

export type UploadTicket =
  | { endpoint: string; token: string; path: string; receipt?: never }
  | { receipt: import("./api").Receipt };
export type UploadSession = {
  id: string;
  secret: string;
  url?: string;
  finished?: boolean;
};

function sendChunk(
  url: string,
  token: string,
  offset: number,
  chunk: Blob,
  onBytes: (bytes: number) => void,
) {
  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PATCH", url);
    xhr.timeout = 120000;
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("apikey", publicKey);
    xhr.setRequestHeader("x-signature", token);
    xhr.setRequestHeader("Upload-Offset", String(offset));
    xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");
    xhr.upload.onprogress = (event) => onBytes(offset + event.loaded);
    xhr.onerror = xhr.ontimeout = () =>
      reject(
        new Error("The connection stopped. Retry to continue your upload."),
      );
    xhr.onload = () =>
      resolve(
        new Response(null, {
          status: xhr.status,
          headers: {
            "Upload-Offset": xhr.getResponseHeader("Upload-Offset") ?? "",
          },
        }),
      );
    xhr.send(chunk);
  });
}
export async function uploadVideo(
  ticket: Exclude<UploadTicket, { receipt: unknown }>,
  session: UploadSession,
  file: File,
  format: Format,
  onPercent: (percent: number) => void,
) {
  const headers = {
    apikey: publicKey,
    "Tus-Resumable": "1.0.0",
    "x-signature": ticket.token,
  };
  const onBytes = (bytes: number) =>
    onPercent(Math.min(100, Math.floor((bytes / file.size) * 100)));
  let offset = 0;
  if (session.url) {
    const status = await fetch(session.url, {
      method: "HEAD",
      headers,
      signal: AbortSignal.timeout(30000),
    });
    if (status.status === 404 || status.status === 410) session.url = undefined;
    else if (status.ok) {
      const remoteOffset = status.headers.get("Upload-Offset");
      offset = remoteOffset === null ? NaN : Number(remoteOffset);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > file.size)
        throw new Error("Storage returned an invalid upload position.");
    } else
      throw new Error("Storage could not resume the upload. Please retry.");
  }
  if (!session.url) {
    const metadata = Object.entries({
      bucketName: bucket,
      objectName: ticket.path,
      contentType: formats[format],
      cacheControl: "0",
    })
      .map(([name, value]) => name + " " + btoa(value))
      .join(",");
    const response = await fetch(ticket.endpoint, {
      method: "POST",
      headers: {
        ...headers,
        "Upload-Length": String(file.size),
        "Upload-Metadata": metadata,
      },
      signal: AbortSignal.timeout(30000),
    });
    const location = response.headers.get("Location");
    if (!response.ok || !location)
      throw new Error("Storage could not start the upload. Please retry.");
    const upload = new URL(location, ticket.endpoint);
    if (upload.origin !== new URL(ticket.endpoint).origin)
      throw new Error("Storage returned an unexpected upload address.");
    session.url = upload.href;
  }
  onBytes(offset);
  while (offset < file.size) {
    const next = Math.min(file.size, offset + 6 * 1024 * 1024);
    const response = await sendChunk(
      session.url,
      ticket.token,
      offset,
      file.slice(offset, next),
      onBytes,
    );
    if (
      response.status !== 204 ||
      Number(response.headers.get("Upload-Offset")) !== next
    ) {
      throw new Error(
        "Storage could not save part of the video. Retry to continue.",
      );
    }
    offset = next;
    onBytes(offset);
  }
  session.finished = true;
}
