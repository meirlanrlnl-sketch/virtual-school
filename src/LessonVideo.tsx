import { useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";
import { translate, type Lang } from "./data";
import type { RoomVideo } from "./roomVideos";

type Props = {
  video: RoomVideo;
  watched: boolean;
  assignment?: string;
  onEnded: () => void;
  lang: Lang;
  onTask: () => void;
};

export default function LessonVideo({
  video,
  watched,
  assignment,
  onEnded,
  lang,
  onTask,
}: Props) {
  const player = useRef<HTMLVideoElement>(null);
  const taskHeading = useRef<HTMLHeadingElement>(null);
  const [error, setError] = useState(false);
  const [playingWithSound, setPlayingWithSound] = useState(false);
  const taskLocked = video.requiresCompletion && !watched && !error;
  function syncPlayback() {
    const media = player.current;
    setPlayingWithSound(
      !!media && !media.paused && !media.muted && media.volume > 0,
    );
  }
  function togglePlayback() {
    const media = player.current;
    if (!media) return;
    if (!media.paused && !media.muted && media.volume > 0) {
      media.pause();
      return;
    }
    media.muted = false;
    if (media.volume === 0) media.volume = 1;
    void media.play().catch((reason) => {
      if (reason.name !== "AbortError") setError(true);
    });
  }
  return (
    <div className="story-stack story-lesson">
      <h3>{translate(video.heading, lang)}</h3>
      <p lang="en">{video.instruction}</p>
      <video
        ref={player}
        className="story-video"
        aria-label={video.title}
        src={video.src}
        poster={video.poster}
        preload="metadata"
        controls
        playsInline
        onPlay={syncPlayback}
        onPause={syncPlayback}
        onVolumeChange={syncPlayback}
        onEnded={() => {
          onEnded();
          if (assignment) requestAnimationFrame(() => taskHeading.current?.focus());
        }}
        onError={() => setError(true)}
        onLoadedMetadata={() => setError(false)}
      />
      {error && (
        <p role="alert">
          The video could not play. Check your connection or open the MP4 in
          your video player.{" "}
          <a className="secondary" href={video.src}>
            Open video
          </a>
        </p>
      )}
      {video.requiresCompletion && (taskLocked || error) && (
        <p role="status" lang="en">
          {error
            ? "The explanation video is unavailable. You can continue with the lesson."
            : video.nextIsExample ? "Watch the video to unlock the storyboard example." : "Watch the video to unlock your task."}
        </p>
      )}
      {assignment && !taskLocked && (
        <section className="story-card story-stack" lang="en">
          <h3 ref={taskHeading} tabIndex={-1}>Your task — Movie Dubbing Challenge</h3>
          <p>{assignment}</p>
          <button className="primary" onClick={onTask}>
            {translate(["Open project guide", "Нұсқаулықты ашу", "Открыть инструкцию"], lang)}
          </button>
        </section>
      )}
      <div className="story-actions">
        <button className="primary" disabled={error} onClick={togglePlayback}>
          {playingWithSound ? <Pause size={16} /> : <Volume2 size={16} />}
          {playingWithSound
            ? translate(["Pause", "Кідірту", "Приостановить"], lang)
            : translate(
                [
                  "Play with sound",
                  "Дыбыспен ойнату",
                  "Воспроизвести со звуком",
                ],
                lang,
              )}
        </button>
        <button
          className="secondary"
          disabled={error}
          onClick={() => {
            if (!player.current) return;
            player.current.currentTime = 0;
            void player.current.play().catch(() => setError(true));
          }}
        >
          Replay
        </button>
        <label>
          Playback speed{" "}
          <select
            defaultValue="1"
            onChange={(event) => {
              if (player.current)
                player.current.playbackRate = Number(event.target.value);
            }}
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
        </label>
        {(!assignment || taskLocked) && <button className="secondary" disabled={taskLocked} onClick={onTask}>
          {video.nextIsExample ? translate(["View Example", "Үлгіні көру", "Посмотреть пример"], lang) : video.requiresCompletion
            ? translate(["Open Task", "Тапсырманы ашу", "Открыть задание"], lang)
            : translate(["Continue to Task", "Тапсырмаға өту", "Перейти к заданию"], lang)}
        </button>}
      </div>
    </div>
  );
}
