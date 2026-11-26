import { useState } from "react";
import { translate, type Lang } from "./data";

const pdf = import.meta.env.BASE_URL + "documents/door-3-storyboard-example.pdf";
const preview = import.meta.env.BASE_URL + "documents/reading-room/page-1.jpg";

export function StoryboardExample({ lang, replay, openTask }: {
  lang: Lang;
  replay: () => void;
  openTask: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [broken, setBroken] = useState(false);
  return (
    <section className="story-stack story-lesson">
      <h3>{translate(["Explore the Storyboard Example", "Сториборд үлгісін қарау", "Пример раскадровки"], lang)}</h3>
      <p lang="en">Study the example, then open your task.</p>
      {broken ? <p lang="en">Open the original PDF below to view the example.</p> : (
        <div className="storyboard-preview" tabIndex={0} aria-label="Yerkebulan Madiyar Storyboard">
          <img src={preview} alt="Yerkebulan Madiyar Storyboard, page 1 of 1"
            style={{ width: zoomed ? "200%" : "100%" }} onError={() => setBroken(true)} />
        </div>
      )}
      <div className="story-actions">
        {!broken && <button className="secondary" aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>
          {zoomed ? translate(["Fit to width", "Еніне сыйғызу", "По ширине"], lang) : translate(["Zoom in", "Үлкейту", "Увеличить"], lang)}
        </button>}
        <a className="secondary" href={pdf} target="_blank" rel="noreferrer">
          {translate(["Open original PDF", "Түпнұсқа PDF файлын ашу", "Открыть оригинал PDF"], lang)}
        </a>
        <a className="secondary" href={pdf} download="Yerkebulan Madiyar Storyboard.pdf">
          {translate(["Download PDF", "PDF жүктеу", "Скачать PDF"], lang)}
        </a>
      </div>
      <div className="story-actions">
        <button className="primary" onClick={openTask}>{translate(["Open Task", "Тапсырманы ашу", "Открыть задание"], lang)}</button>
        <button className="secondary" onClick={replay}>{translate(["Watch again", "Видеоны қайта көру", "Посмотреть видео снова"], lang)}</button>
      </div>
    </section>
  );
}
