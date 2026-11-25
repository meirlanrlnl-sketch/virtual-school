import { useEffect, useRef, useState, type FormEvent } from "react";
import { UploadCloud } from "lucide-react";
import {
  defaultMaxBytes,
  formats,
  matchesVideoHeader,
  videoFormat,
} from "../../supabase/functions/storytelling/video";
import { configured, emailStatus, storyApi, type Receipt } from "./api";
import { uploadVideo, type UploadSession, type UploadTicket } from "./upload";

const empty = {
  studentName: "",
  classGroup: "",
  storyTitle: "",
  description: "",
  message: "",
  consent: false,
};
const inputs = [
  ["studentName", "Student full name", 120],
  ["classGroup", "Class or group", 100],
  ["storyTitle", "Story title", 160],
  ["description", "Short story description", 1200],
  ["message", "Message to your teacher (optional)", 1000],
] as const;

export default function Submission({ close }: { close: () => void }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");
  const [previewBroken, setPreviewBroken] = useState(false);
  const [max, setMax] = useState(defaultMaxBytes);
  const [ready, setReady] = useState(false);
  const [setupFailed, setSetupFailed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [percent, setPercent] = useState(0);
  const [result, setResult] = useState<Receipt>();
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const formElement = useRef<HTMLFormElement>(null);
  const locked = useRef(false);
  const attempt = useRef<UploadSession>();
  const fileChoice = useRef(0);
  const [retrySetup, setRetrySetup] = useState(0);
  useEffect(() => {
    if (!configured) return;
    let active = true;
    storyApi<{ maxBytes: number }>("config")
      .then((data) => {
        if (active) {
          setMax(data.maxBytes);
          setReady(true);
          setSetupFailed(false);
        }
      })
      .catch(() => {
        if (active) setSetupFailed(true);
      });
    return () => {
      active = false;
    };
  }, [retrySetup]);
  useEffect(() => {
    if (!file || !ready) return;
    if (file.size > max) {
      setFile(undefined);
      setError("This video is larger than the school's upload limit.");
    }
  }, [file, max, ready]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPreviewBroken(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!busy) return;
    const dialog = formElement.current?.closest("dialog");
    if (!dialog) return;
    const guard = (event: Event) => {
      const target = event.target;
      if (
        event.type === "cancel" ||
        target === dialog ||
        (target instanceof Element && target.closest(".modal-head button"))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    dialog.addEventListener("click", guard, true);
    dialog.addEventListener("cancel", guard, true);
    return () => {
      dialog.removeEventListener("click", guard, true);
      dialog.removeEventListener("cancel", guard, true);
    };
  }, [busy]);
  function remove() {
    fileChoice.current++;
    attempt.current = undefined;
    setChecking(false);
    setFile(undefined);
    setPercent(0);
    if (input.current) input.current.value = "";
  }
  async function select(next?: File) {
    if (!next || locked.current) return;
    remove();
    setError("");
    const id = fileChoice.current;
    const format = videoFormat(next.name);
    if (
      !format ||
      (next.type &&
        next.type !== "application/octet-stream" &&
        next.type !== formats[format])
    ) {
      setError("Choose an MP4, MOV, or WebM video.");
      return;
    }
    if (!next.size || next.size > max) {
      setError(
        `Choose a video between 1 byte and ${(max / 1_000_000).toFixed(1).replace(/\.0$/, "")} MB.`,
      );
      return;
    }
    setChecking(true);
    try {
      const header = new Uint8Array(await next.slice(0, 4096).arrayBuffer());
      if (id !== fileChoice.current) return;
      if (!matchesVideoHeader(format, header))
        setError("The file does not match its video type.");
      else setFile(next);
    } catch {
      if (id === fileChoice.current)
        setError("The browser could not read this file.");
    } finally {
      if (id === fileChoice.current) setChecking(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current || !ready || checking) return;
    if (!file) {
      setError("Choose your storytelling video first.");
      return;
    }
    if (
      inputs.some(([key]) => key !== "message" && !form[key].trim()) ||
      !form.consent
    ) {
      setError(
        "Complete all required fields and confirm you have permission to share.",
      );
      return;
    }
    const format = videoFormat(file.name);
    if (!format) return;
    locked.current = true;
    setBusy(true);
    setError("");
    const session = (attempt.current ??= {
      id: crypto.randomUUID(),
      secret: crypto.randomUUID() + crypto.randomUUID(),
    });
    const ownership = { id: session.id, secret: session.secret };
    try {
      const ticket = await storyApi<UploadTicket>("start", {
        ...ownership,
        ...form,
        filename: file.name,
        size: file.size,
      });
      if (ticket.receipt) {
        setResult(ticket.receipt);
        return;
      }
      if (!session.finished) {
        try {
          await uploadVideo(ticket, session, file, format, setPercent);
        } catch (uploadError) {
          const recorded = await storyApi<Receipt>("finish", ownership).catch(
            () => null,
          );
          if (recorded) {
            setResult(recorded);
            return;
          }
          throw uploadError;
        }
      }
      setResult(await storyApi<Receipt>("finish", ownership));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The upload stopped. Please retry.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  if (result)
    return (
      <div className="story-card story-stack" role="status">
        <h3>
          Congratulations! Your digital story has been submitted successfully.
        </h3>
        <p>Your teacher will review your project.</p>
        <dl>
          <dt>Student name</dt>
          <dd>{result.student_name}</dd>
          <dt>Story title</dt>
          <dd>{result.story_title}</dd>
          <dt>Submission date</dt>
          <dd>{new Date(result.submitted_at).toLocaleString()}</dd>
          <dt>Submission ID</dt>
          <dd>{result.id}</dd>
          <dt>Upload status</dt>
          <dd>Video and submission saved</dd>
          <dt>Email notification status</dt>
          <dd>{emailStatus[result.email_status]}</dd>
        </dl>
        <button className="primary" onClick={close}>
          Return to Classroom
        </button>
      </div>
    );
  return (
    <form ref={formElement} onSubmit={submit} className="story-stack">
      {!ready && (
        <p role="status" className="story-card">
          {!configured || setupFailed
            ? "You can complete the form and choose your video now. Online sending will open after your teacher configures the upload service."
            : "Checking whether online uploads are ready…"}
          {configured && setupFailed && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSetupFailed(false);
                setRetrySetup((x) => x + 1);
              }}
            >
              Check again
            </button>
          )}
        </p>
      )}
      <fieldset
        className="story-fields"
        disabled={busy || Boolean(attempt.current)}
      >
        {inputs.map(([key, label, maxLength]) => (
          <label key={key}>
            {label}
            {key === "description" || key === "message" ? (
              <textarea
                required={key !== "message"}
                rows={3}
                maxLength={maxLength}
                value={form[key]}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            ) : (
              <input
                required
                maxLength={maxLength}
                value={form[key]}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            )}
          </label>
        ))}
        <label className="story-check story-wide">
          <input
            type="checkbox"
            required
            checked={form.consent}
            onChange={(event) =>
              setForm({ ...form, consent: event.target.checked })
            }
          />
          I have permission to share everything in this video.
        </label>
      </fieldset>
      <div
        className={`story-drop ${drag ? "drag" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy && !attempt.current) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          if (!busy && !attempt.current)
            void select(event.dataTransfer.files[0]);
        }}
      >
        <label>
          <UploadCloud size={24} /> Drop or choose a video
          <input
            ref={input}
            type="file"
            disabled={busy || Boolean(attempt.current)}
            accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
            onChange={(event) => void select(event.target.files?.[0])}
          />
        </label>
        <small>MP4, MOV, or WebM · up to {max / 1_000_000} MB</small>
      </div>
      {file && (
        <div className="story-card story-stack">
          <strong>
            {file.name} · {(file.size / 1_000_000).toFixed(2)} MB
          </strong>
          {preview && !previewBroken && (
            <video
              className="story-video"
              src={preview}
              controls
              playsInline
              preload="metadata"
              onError={() => setPreviewBroken(true)}
            />
          )}
          {previewBroken && (
            <p>This browser cannot preview the chosen video.</p>
          )}
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => {
              remove();
              setError("");
            }}
          >
            Remove file
          </button>
        </div>
      )}
      {busy && (
        <p>Keep this panel open while your video and submission are saved.</p>
      )}
      {(busy || percent > 0) && (
        <div className="story-progress" role="status">
          <label htmlFor="upload-progress">
            {error
              ? "Upload paused"
              : percent === 100
                ? "Saving your submission"
                : "Video upload"}
          </label>
          <strong>{percent}%</strong>
          <progress id="upload-progress" value={percent} max={100} />
        </div>
      )}
      {error && (
        <p role="alert" className="story-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="primary"
        disabled={!ready || busy || checking}
      >
        {checking
          ? "Checking video…"
          : busy
            ? "Submitting…"
            : !ready
              ? "Online sending is not ready"
              : error && attempt.current
                ? "Retry upload"
                : "Submit Project"}
      </button>
    </form>
  );
}
