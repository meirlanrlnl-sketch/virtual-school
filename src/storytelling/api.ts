const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
export const projectUrl = configuredUrl ? new URL(configuredUrl).origin : "";
export const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
export const configured = Boolean(projectUrl && publicKey);

export type Receipt = {
  id: string;
  student_name: string;
  story_title: string;
  submitted_at: string;
  email_status: "pending" | "sending" | "sent" | "failed" | "review";
};
export type SubmissionRecord = Receipt & {
  class_group: string;
  description: string;
  filename: string;
  size_bytes: number;
  message: string;
  status: "submitted" | "assessed" | "deleting";
  scores: number[] | null;
  feedback: string;
};
export const emailStatus: Record<Receipt["email_status"], string> = {
  pending: "Pending",
  sending: "Pending",
  sent: "Accepted by email provider",
  failed: "Failed. Your teacher can retry.",
  review: "Needs teacher review",
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  body: object,
  token?: string,
): Promise<T> {
  if (!configured)
    throw new ApiError(
      "The school has not set up online submissions yet.",
      503,
    );
  const response = await fetch(projectUrl + path, {
    method: "POST",
    headers: {
      apikey: publicKey,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(35000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      data.error ||
        data.msg ||
        data.message ||
        "The school server could not complete this request.",
      response.status,
    );
  return data as T;
}
export const storyApi = <T>(
  action: string,
  body: object = {},
  token?: string,
) => request<T>("/functions/v1/storytelling", { action, ...body }, token);
export const signIn = (email: string, password: string) =>
  request<{ access_token: string }>("/auth/v1/token?grant_type=password", {
    email,
    password,
  });
export const signOut = (token: string) =>
  request("/auth/v1/logout?scope=local", {}, token);
