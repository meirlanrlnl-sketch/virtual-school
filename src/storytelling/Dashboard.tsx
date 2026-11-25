import { useEffect, useState, type FormEvent } from "react";
import { Download, Film, GraduationCap, Search } from "lucide-react";
import {
  ApiError,
  configured,
  emailStatus,
  signIn,
  signOut,
  storyApi,
  type Receipt,
  type SubmissionRecord,
} from "./api";
import { rubric } from "./content";

const initialFilters = { student: "", group: "", date: "", status: "" };
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The request stopped. Please try again.";
const formatDate = (date: string) =>
  new Date(date).toISOString().replace("T", " ").slice(0, 16) + " UTC";
const labelStatus = (status: string) =>
  ({
    submitted: "Submitted",
    assessed: "Assessed",
    deleting: "Deletion pending",
  })[status] ?? status;

function Project({
  record,
  token,
  update,
  remove,
  invalid,
}: {
  record: SubmissionRecord;
  token: string;
  update: (record: SubmissionRecord) => void;
  remove: (id: string) => void;
  invalid: (error: unknown) => void;
}) {
  const [scores, setScores] = useState<string[]>(
    record.scores?.map(String) ?? rubric.map(() => ""),
  );
  const [feedback, setFeedback] = useState(record.feedback);
  const [video, setVideo] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function perform(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (failure) {
      invalid(failure);
      setError(message(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="story-card story-stack">
      <header>
        <h2>{record.story_title}</h2>
        <p>
          {record.student_name} · {record.class_group} ·{" "}
          {formatDate(record.submitted_at)}
        </p>
        <p>
          {labelStatus(record.status)} · Email{" "}
          {emailStatus[record.email_status]}
        </p>
      </header>
      <p>{record.description}</p>
      {record.message && <blockquote>{record.message}</blockquote>}
      <small>
        {record.filename} · {(record.size_bytes / 1_000_000).toFixed(2)} MB ·{" "}
        {record.id}
      </small>
      {record.status !== "deleting" && (
        <>
          {video && (
            <video
              className="story-video"
              controls
              playsInline
              preload="metadata"
              src={video}
              onError={() => {
                setError(
                  "Preview could not play. Reopen the preview or download the video.",
                );
              }}
            />
          )}
          <div className="story-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  setVideo(
                    (
                      await storyApi<{ url: string }>(
                        "video",
                        { id: record.id },
                        token,
                      )
                    ).url,
                  );
                })
              }
            >
              <Film size={17} />
              {video ? "Refresh preview" : "Watch video"}
            </button>
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  const response = await storyApi<{ url: string }>(
                    "video",
                    { id: record.id, download: true },
                    token,
                  );
                  const link = document.createElement("a");
                  link.href = response.url;
                  link.referrerPolicy = "no-referrer";
                  link.click();
                })
              }
            >
              <Download size={17} />
              Download
            </button>
            {["pending", "failed", "sending"].includes(record.email_status) && (
              <button
                className="secondary"
                disabled={busy}
                onClick={() =>
                  void perform(async () => {
                    const response = await storyApi<{
                      email_status: Receipt["email_status"];
                    }>("retry-email", { id: record.id }, token);
                    update({ ...record, ...response });
                    setNotice(
                      `Email status · ${emailStatus[response.email_status]}`,
                    );
                  })
                }
              >
                Retry email
              </button>
            )}
          </div>
          <form
            className="story-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void perform(async () => {
                const assessed = await storyApi<SubmissionRecord>(
                  "assess",
                  { id: record.id, scores: scores.map(Number), feedback },
                  token,
                );
                update(assessed);
                setNotice("Assessment saved.");
              });
            }}
          >
            <h3>
              Assessment{" "}
              {record.scores
                ? `· ${record.scores.reduce((total, score) => total + score, 0)}/100 saved`
                : "· awaiting score"}
            </h3>
            <div className="story-fields">
              {rubric.map(([name, description], i) => (
                <label key={name}>
                  {name} / 20 <small>{description}</small>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={20}
                    required
                    value={scores[i]}
                    onChange={(event) =>
                      setScores(
                        scores.map((value, j) =>
                          j === i ? event.target.value : value,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <label>
              Teacher feedback
              <textarea
                rows={3}
                maxLength={2500}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
              />
            </label>
            <button className="primary" disabled={busy}>
              Save assessment
            </button>
          </form>
        </>
      )}
      {confirm ? (
        <div className="story-card story-stack">
          <strong>Permanently delete this submission and its video?</strong>
          <div className="story-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="secondary story-danger"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await storyApi("delete", { id: record.id }, token);
                  remove(record.id);
                })
              }
            >
              Delete permanently
            </button>
          </div>
        </div>
      ) : (
        <button
          className="secondary story-danger"
          disabled={busy}
          onClick={() => setConfirm(true)}
        >
          {record.status === "deleting"
            ? "Finish deletion"
            : "Delete submission"}
        </button>
      )}
      {error && (
        <p role="alert" className="story-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </article>
  );
}

export default function Dashboard() {
  const [token, setToken] = useState("");
  const [requested, setRequested] = useState(
    window.location.hash.split("/")[1] ?? "",
  );
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<SubmissionRecord[]>([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [sync, setSync] = useState(0);

  function invalidate(problem: unknown) {
    if (problem instanceof ApiError && [401, 403].includes(problem.status)) {
      setToken("");
      setRows([]);
      setError(problem.message);
    }
  }
  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError("");
    storyApi<{ rows: SubmissionRecord[]; count: number; total: number }>(
      "list",
      { ...applied, page, ...(requested ? { id: requested } : {}) },
      token,
    )
      .then((data) => {
        if (!active) return;
        setRows(data.rows);
        setTotal(data.total);
        setCount(data.count);
        if (!data.rows.length && page > 0) setPage((current) => current - 1);
      })
      .catch((problem) => {
        if (active) {
          setRows([]);
          setError(message(problem));
          invalidate(problem);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, requested, applied, page, sync]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signing) return;
    setSigning(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const auth = await signIn(
        String(data.get("email")),
        String(data.get("password")),
      );
      if (!auth.access_token)
        throw new Error("Sign-in did not return an account session.");
      setToken(auth.access_token);
    } catch (problem) {
      setError(message(problem));
    } finally {
      setSigning(false);
    }
  }
  return (
    <main className="story-dashboard" lang="en">
      <header className="story-dashboard-header">
        <GraduationCap size={28} />
        <h1>Digital Storytelling · Teacher Dashboard</h1>
        <a className="secondary" href="#">
          Virtual School
        </a>
        {token && (
          <button
            className="secondary"
            onClick={() => {
              const old = token;
              setToken("");
              setRows([]);
              setNotice("");
              setError("");
              void signOut(old).catch(() => undefined);
            }}
          >
            Sign out
          </button>
        )}
      </header>
      {!configured && (
        <p className="story-card">
          The teacher dashboard needs the school’s Supabase configuration.
        </p>
      )}
      {configured && !token && (
        <form onSubmit={login} className="story-card story-stack story-login">
          <h2>Teacher sign-in</h2>
          <label>
            Email
            <input name="email" autoComplete="username" type="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              autoComplete="current-password"
              type="password"
              required
            />
          </label>
          <button className="primary" disabled={signing}>
            {signing ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}
      {token && (
        <>
          <p role="status">
            {loading
              ? "Loading submissions…"
              : `${total} total submissions · ${count} matching`}
          </p>
          {requested ? (
            <div className="story-actions">
              <button
                className="secondary"
                onClick={() => {
                  history.replaceState(null, "", "#teacher");
                  setRequested("");
                }}
              >
                Show all submissions
              </button>
            </div>
          ) : (
            <form
              className="story-card story-fields"
              onSubmit={(event) => {
                event.preventDefault();
                setPage(0);
                setApplied({ ...filters });
              }}
            >
              <label>
                Student
                <input
                  maxLength={120}
                  value={filters.student}
                  onChange={(e) =>
                    setFilters({ ...filters, student: e.target.value })
                  }
                />
              </label>
              <label>
                Class or group
                <input
                  maxLength={100}
                  value={filters.group}
                  onChange={(e) =>
                    setFilters({ ...filters, group: e.target.value })
                  }
                />
              </label>
              <label>
                Submission date (UTC)
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="assessed">Assessed</option>
                  <option value="deleting">Deletion pending</option>
                </select>
              </label>
              <button className="primary" disabled={loading}>
                <Search size={17} /> Search
              </button>
              <button
                type="button"
                className="secondary"
                disabled={loading}
                onClick={() => {
                  setPage(0);
                  setFilters(initialFilters);
                  setApplied({ ...initialFilters });
                }}
              >
                Clear filters
              </button>
            </form>
          )}
          <div className="story-actions">
            <button
              className="secondary"
              disabled={loading}
              onClick={async () => {
                setNotice("");
                setError("");
                try {
                  const result = await storyApi<{
                    checked: number;
                    cleaned: number;
                    errors: number;
                  }>("maintenance", {}, token);
                  setNotice(
                    `Checked ${result.checked} email notifications and cleared ${result.cleaned} old uploads.${result.errors ? ` ${result.errors} operations need another try.` : ""}`,
                  );
                  setSync(sync + 1);
                } catch (problem) {
                  invalidate(problem);
                  setError(message(problem));
                }
              }}
            >
              Check pending email and uploads
            </button>
          </div>
          {rows.map((record) => (
            <Project
              key={record.id}
              record={record}
              token={token}
              invalid={invalidate}
              update={(value) =>
                setRows((current) =>
                  current.map((item) => (item.id === value.id ? value : item)),
                )
              }
              remove={(id) => {
                setRows((current) => current.filter((item) => item.id !== id));
                setSync((current) => current + 1);
              }}
            />
          ))}
          {!loading && !error && rows.length === 0 && (
            <p>No submissions match.</p>
          )}
          {(page > 0 || count > 20) && (
            <nav className="story-actions" aria-label="Submission pages">
              <button
                className="secondary"
                disabled={loading || page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous page
              </button>
              <span>Page {page + 1}</span>
              <button
                className="secondary"
                disabled={loading || (page + 1) * 20 >= count}
                onClick={() => setPage(page + 1)}
              >
                Next page
              </button>
            </nav>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="story-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
    </main>
  );
}
