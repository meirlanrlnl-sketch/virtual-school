import { useState } from "react";
import { translate, type Lang } from "./data";

import type { RoomPosters } from "./roomPosters";

export function PosterLesson({ posters, lang, assignment }: { posters: RoomPosters; lang: Lang; assignment: string }) {
  const [index, setIndex] = useState(0);
  const { src, alt } = posters[index];
  const label = translate(["Poster", "Постер", "Плакат"], lang);
  return (
    <section className="story-stack story-lesson">
      <h3 aria-live="polite">{label}{posters.length > 1 && ` ${index + 1} / ${posters.length}`}</h3>
      <a href={src} target="_blank" rel="noreferrer">
        <img className="disaster-poster" src={src}
          alt={alt} />
      </a>
      {index === posters.length - 1 && (
        <section className="story-card story-stack">
          <h3>{translate(["Your task", "Тапсырма", "Задание"], lang)}</h3>
          <p lang="en">{assignment}</p>
        </section>
      )}
      <div className="story-actions">
        {posters.length > 1 && <button className={index === 0 ? "primary" : "secondary"} onClick={() => setIndex(1 - index)}>
          {index === 0
            ? translate(["Next poster", "Келесі постер", "Следующий плакат"], lang)
            : translate(["Previous poster", "Алдыңғы постер", "Предыдущий плакат"], lang)}
        </button>}
        <a className="secondary" href={src} target="_blank" rel="noreferrer">
          {translate(["View full size", "Толық өлшемде көру", "Открыть в полном размере"], lang)}
        </a>
      </div>
    </section>
  );
}
