import { useEffect, useRef, useState, type ReactNode } from "react";
import { Clapperboard, MonitorPlay } from "lucide-react";
import {
  media,
  poster,
  questions,
  requirements,
  rubric,
  steps,
  structure,
  teacherLines,
  type Zone,
} from "./content";
import Submission from "./Submission";

declare const __STORY_VIDEO__: string;
declare const __STORY_CAPTIONS__: boolean;

function useDraft<T>(key: string, initial: T) {
  const storageKey = "storytelling-" + key;
  const [value, setValue] = useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "null") ?? initial;
    } catch {
      return initial;
    }
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [value, storageKey]);
  return [value, setValue, saved] as const;
}

export function Rubric() {
  return (
    <details className="story-card">
      <summary>How Your Digital Story Will Be Assessed</summary>
      <dl>
        {rubric.map(([name, text]) => (
          <div key={name}>
            <dt>{name} · 20 points</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <p>
        <strong>Total · 100 points</strong>. Your teacher will watch and assess
        your video.
      </p>
    </details>
  );
}
function Teacher({
  open,
  close,
  sound,
  talking,
}: {
  open: (zone: Zone) => void;
  close: () => void;
  sound: boolean;
  talking: (active: boolean) => void;
}) {
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState("");
  const token = useRef(0);
  function stop() {
    token.current++;
    window.speechSynthesis?.cancel();
    talking(false);
  }
  useEffect(
    () => () => {
      token.current++;
      window.speechSynthesis?.cancel();
    },
    [],
  );
  function listen(index: number) {
    stop();
    if (!sound || !window.speechSynthesis) {
      setNotice(
        sound ? "Speech is unavailable on this device." : "Sound is muted.",
      );
      return;
    }
    setNotice("");
    const id = token.current;
    const line = new SpeechSynthesisUtterance(teacherLines[index]);
    line.lang = "en-GB";
    line.rate = 0.88;
    line.onstart = () => {
      if (id === token.current) talking(true);
    };
    line.onend = () => {
      if (id === token.current) talking(false);
    };
    line.onerror = () => {
      if (id === token.current) {
        talking(false);
        setNotice("Speech is unavailable on this device.");
      }
    };
    speechSynthesis.speak(line);
  }
  return (
    <>
      <span className="story-kicker">
        English teacher · {page + 1} / {teacherLines.length}
      </span>
      <blockquote>{teacherLines[page]}</blockquote>
      <div className="story-actions">
        <button className="secondary" onClick={() => listen(page)}>
          Listen
        </button>
        <button
          className="secondary"
          onClick={() => {
            setPage(0);
            listen(0);
          }}
        >
          Replay
        </button>
        <button
          className="primary"
          onClick={() => {
            stop();
            setNotice("");
            if (page === teacherLines.length - 1) open("steps");
            else setPage(page + 1);
          }}
        >
          {page === teacherLines.length - 1 ? "Open guide" : "Next"}
        </button>
        <button className="secondary" onClick={close}>
          Close
        </button>
      </div>
      {notice && <p role="status">{notice}</p>}
    </>
  );
}
function Intro() {
  const [part, setPart] = useState(0);
  const [name, description, example] = structure[part];
  return (
    <>
      <p>
        Digital storytelling is a way of telling a story using digital
        technology. It combines words, images, videos, voice narration, music,
        and sound effects to communicate a meaningful message.
      </p>
      <div className="story-media">
        {media.map(([label, Icon]) => (
          <div key={label}>
            <Icon size={23} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <h3>Beginning, middle, and ending</h3>
      <p>
        A good digital story has a clear beginning, middle, and ending. Pick a
        story part to see how it works in the sample storyboard about Mia.
      </p>
      <div className="story-actions">
        {structure.map(([label], i) => (
          <button
            type="button"
            className={i === part ? "primary" : "secondary"}
            aria-pressed={i === part}
            key={label}
            onClick={() => setPart(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <article className="story-card" key={name}>
        <h4>{name}</h4>
        <p>{description}</p>
        <p>
          <strong>Example</strong> · {example}
        </p>
      </article>
    </>
  );
}
const fields = ["What happens", "What we see", "Narration", "Music or sound"];
function Storyboard() {
  const [scenes, setScenes, saved] = useDraft(
    "scenes",
    Array.from({ length: 6 }, () => ["", "", "", ""]),
  );
  function download() {
    const body = scenes
      .map(
        (scene, i) =>
          "Scene " +
          (i + 1) +
          "\n" +
          scene
            .map((value, field) => fields[field] + "\n" + value)
            .join("\n\n"),
      )
      .join("\n\n----------------\n\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-storyboard.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="story-stack">
      <h4>My storyboard</h4>
      <details className="story-card">
        <summary>View the “You’re Not Alone” storyboard</summary>
        <a
          href={poster}
          target="_blank"
          rel="noreferrer"
          aria-label="Open the full-size You’re Not Alone storyboard"
        >
          <img
            className="story-poster"
            src={poster}
            alt="Nine framed scenes show Mia facing cyberbullying, getting help from her teacher, and encouraging others to speak up."
          />
        </a>
      </details>
      <p>
        {saved
          ? "Your storyboard is saved in this browser as you work."
          : "Browser saving is unavailable. Download your work before closing."}
      </p>
      {scenes.map((scene, i) => (
        <details
          className="story-card"
          key={i}
          open={i === 0 ? true : undefined}
        >
          <summary>Scene {i + 1}</summary>
          <div className="story-fields">
            {fields.map((field, j) => (
              <label key={field}>
                {field}
                <textarea
                  rows={2}
                  maxLength={1200}
                  value={scene[j]}
                  onChange={(e) =>
                    setScenes(
                      scenes.map((values, index) =>
                        index === i
                          ? values.map((value, k) =>
                              k === j ? e.target.value : value,
                            )
                          : values,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </details>
      ))}
      <div className="story-actions">
        <button
          className="secondary"
          disabled={scenes.length >= 8}
          onClick={() => setScenes([...scenes, ["", "", "", ""]])}
        >
          Add scene
        </button>
        <button className="secondary" onClick={download}>
          Download storyboard
        </button>
      </div>
    </div>
  );
}
function Guide({ open }: { open: (zone: Zone) => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useDraft<number[]>("steps", []);
  const { title, text, example, prompts, icon: Icon } = steps[step];
  const percent = Math.round((done.length / steps.length) * 100);
  return (
    <>
      <div className="story-progress">
        <label htmlFor="guide-progress">Guide progress</label>
        <strong>{percent}%</strong>
        <progress id="guide-progress" value={done.length} max={steps.length} />
      </div>
      <nav className="story-actions" aria-label="Guide steps">
        {steps.map((item, i) => (
          <button
            key={item.title}
            className={i === step ? "primary" : "secondary"}
            aria-current={i === step ? "step" : undefined}
            aria-label={`Step ${i + 1}. ${item.title}${done.includes(i) ? ", complete" : ""}`}
            onClick={() => setStep(i)}
          >
            {i + 1}
            {done.includes(i) && " ✓"}
          </button>
        ))}
      </nav>
      <article className="story-card" key={title}>
        <span className="story-kicker">
          <Icon size={21} /> Step {step + 1} of {steps.length}
        </span>
        <h3>{title}</h3>
        <p>{text}</p>
        {prompts && (
          <ul>
            {prompts.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )}
        <p>
          <strong>Example</strong> · {example}
        </p>
      </article>
      <div className="story-actions">
        <button
          className="secondary"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Previous
        </button>
        <button
          className="primary"
          disabled={done.includes(step)}
          onClick={() => setDone([...done, step])}
        >
          {done.includes(step) ? "Completed ✓" : "Mark as Completed"}
        </button>
        <button
          className="secondary"
          disabled={step === 7}
          onClick={() => setStep(step + 1)}
        >
          Next
        </button>
        {step === 7 && (
          <button className="secondary" onClick={() => open("submit")}>
            Open submission
          </button>
        )}
      </div>
      {step === 3 && <Storyboard />}
    </>
  );
}
function Screening() {
  const video = useRef<HTMLVideoElement>(null);
  const [broken, setBroken] = useState(false);
  const [answers, setAnswers, saved] = useDraft<string[]>(
    "reflection",
    questions.map(() => ""),
  );
  return (
    <>
      {__STORY_VIDEO__ && !broken ? (
        <>
          <video
            ref={video}
            className="story-video"
            controls
            playsInline
            preload="metadata"
            src={import.meta.env.BASE_URL + __STORY_VIDEO__}
            onError={() => setBroken(true)}
          >
            {__STORY_CAPTIONS__ && (
              <track
                kind="captions"
                srcLang="en"
                label="English"
                src={
                  import.meta.env.BASE_URL + "videos/storytelling-example.vtt"
                }
              />
            )}
          </video>
          <div className="story-actions">
            <button
              className="secondary"
              onClick={() => {
                if (video.current) {
                  video.current.currentTime = 0;
                  void video.current.play().catch(() => undefined);
                }
              }}
            >
              Replay
            </button>
            <label>
              Speed{" "}
              <select
                defaultValue="1"
                onChange={(e) => {
                  if (video.current)
                    video.current.playbackRate = Number(e.target.value);
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}×
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      ) : (
        <div className="story-screen-placeholder">
          <MonitorPlay size={36} />
          <strong>
            {broken
              ? "This video could not play on this device."
              : "The example video is waiting to be added."}
          </strong>
          <p>
            Add <code>storytelling-example.mp4</code> to{" "}
            <code>public/videos</code> and rebuild the school. MP4 works on most
            devices.
          </p>
        </div>
      )}
      <h3>Think About the Story</h3>
      <p>
        {saved
          ? "Your answers are saved in this browser."
          : "This browser could not save your answers."}
      </p>
      {questions.map((question, i) => (
        <label key={question}>
          {question}
          <textarea
            rows={2}
            maxLength={1500}
            value={answers[i]}
            onChange={(e) =>
              setAnswers(
                answers.map((answer, j) => (i === j ? e.target.value : answer)),
              )
            }
          />
        </label>
      ))}
    </>
  );
}
function Assignment({ open }: { open: (zone: Zone) => void }) {
  const [checked, setChecked] = useDraft<number[]>("checklist", []);
  return (
    <>
      <p>
        Create a{" "}
        <strong>2–3-minute digital storytelling video in English</strong>.
        Background music is optional.
      </p>
      <h3>
        Project checklist · {checked.length}/{requirements.length}
      </h3>
      <progress
        aria-label="Assignment checklist"
        max={requirements.length}
        value={checked.length}
      />
      <div className="story-fields">
        {requirements.map((item, i) => (
          <label className="story-check" key={item}>
            <input
              type="checkbox"
              checked={checked.includes(i)}
              onChange={(e) =>
                setChecked(
                  e.target.checked
                    ? [...checked, i]
                    : checked.filter((n) => n !== i),
                )
              }
            />
            {item}
          </label>
        ))}
      </div>
      <Rubric />
      <div className="story-actions">
        <button className="secondary" onClick={() => open("steps")}>
          Open guide
        </button>
        <button className="primary" onClick={() => open("submit")}>
          Open submission
        </button>
      </div>
    </>
  );
}
export default function Lesson({
  zone,
  title,
  open,
  close,
  sound,
  talking,
}: {
  zone: Zone;
  title?: string;
  open: (zone: Zone) => void;
  close: () => void;
  sound: boolean;
  talking: (active: boolean) => void;
}) {
  const content: Record<Zone, ReactNode> = {
    teacher: <Teacher {...{ open, close, sound, talking }} />,
    intro: <Intro />,
    steps: <Guide open={open} />,
    video: <Screening />,
    create: <Assignment open={open} />,
    submit: (
      <>
        <Rubric />
        <Submission close={close} />
      </>
    ),
  };
  return (
    <section className="story-stack story-lesson" lang="en">
      {title && (
        <h3 className="story-title">
          <Clapperboard size={20} />
          {title}
        </h3>
      )}
      {content[zone]}
    </section>
  );
}
