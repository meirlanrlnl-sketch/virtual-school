import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  Expand,
  Footprints,
  Globe2,
  GraduationCap,
  House,
  Map,
  MapPin,
  Menu,
  Pause,
  Play,
  Settings2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  orderedAnswers,
  rooms,
  storytellingRoom,
  translate,
  type Lang,
  type Translation,
} from "./data";
import { panoramas } from "./panoramas";
import type { Mode, Motion } from "./World";
import "./style.css";
import { zones, type Zone } from "./storytelling/content";
import "./storytelling/storytelling.css";
const StoryLesson = lazy(() => import("./storytelling/Lesson"));
const TeacherDashboard = lazy(() => import("./storytelling/Dashboard"));
const World = lazy(() => import("./World"));
type Panel =
  | "help"
  | "settings"
  | "pause"
  | "map"
  | "mission"
  | "guide"
  | "word"
  | "quiz"
  | "info"
  | "story";
type Progress = {
  visited: number[];
  guides: number[];
  words: number[];
  quizzes: number[];
  presentation: string;
  lastRoom: number;
};
const blank: Progress = {
  visited: [],
  guides: [],
  words: [],
  quizzes: [],
  presentation: "",
  lastRoom: 0,
};
const storage = "virtual-school-progress-v1";
const intersects = (list: number[], id: number) =>
  list.includes(id) ? list : [...list, id];
function loadProgress(): Progress {
  try {
    const data = JSON.parse(localStorage.getItem(storage) ?? "null");
    if (!data) return blank;
    const ids = (value: unknown) =>
      Array.isArray(value)
        ? [
            ...new Set(
              value.filter(
                (n) => Number.isInteger(n) && n >= 0 && n < rooms.length,
              ),
            ),
          ]
        : [];
    return {
      visited: ids(data.visited),
      guides: ids(data.guides),
      words: ids(data.words),
      quizzes: ids(data.quizzes),
      presentation:
        typeof data.presentation === "string" ? data.presentation : "",
      lastRoom: ids([data.lastRoom])[0] ?? ids(data.visited).at(-1) ?? 0,
    };
  } catch {
    return blank;
  }
}
function Modal({
  title,
  close,
  children,
  dialogue = false,
  storytelling = false,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  dialogue?: boolean;
  storytelling?: boolean;
}) {
  const modal = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    modal.current?.showModal();
  }, []);
  return (
    <dialog
      ref={modal}
      className={`modal${dialogue ? " dialogue" : ""}${storytelling ? " story-modal" : ""}`}
      aria-labelledby="panel-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-body">
        <div className="modal-head">
          <h2 id="panel-title">{title}</h2>
          <button className="icon" aria-label="Close" onClick={close}>
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
function Joystick({ motion }: { motion: { current: Motion } }) {
  const [point, setPoint] = useState<Motion>({ x: 0, y: 0 });
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    let x = (event.clientX - rect.left - rect.width / 2) / 32,
      y = (event.clientY - rect.top - rect.height / 2) / 32;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }
    motion.current = { x, y };
    setPoint({ x, y });
  };
  const reset = () => {
    motion.current = { x: 0, y: 0 };
    setPoint(motion.current);
  };
  useEffect(
    () => () => {
      motion.current = { x: 0, y: 0 };
    },
    [motion],
  );
  return (
    <div
      className="joystick"
      aria-label="Movement joystick"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) update(e);
      }}
      onLostPointerCapture={reset}
    >
      <span
        style={{
          transform: "translate(" + point.x * 28 + "px," + point.y * 28 + "px)",
        }}
      />
    </div>
  );
}
function App() {
  const [menu, setMenu] = useState(true),
    [panel, setPanel] = useState<Panel>(),
    [room, setRoom] = useState(0),
    [mode, setMode] = useState<Mode>("tour"),
    [lang, setLang] = useState<Lang>("en");
  const [sound, setSound] = useState(true),
    [low, setLow] = useState(
      () => window.matchMedia("(pointer: coarse)").matches,
    ),
    [progress, setProgress] = useState(loadProgress);
  const [answer, setAnswer] = useState<"correct" | "retry">(),
    [page, setPage] = useState(0),
    [pano, setPano] = useState(0),
    [info, setInfo] = useState(""),
    [status, setStatus] = useState("");
  const [zone, setZone] = useState<Zone>("intro");
  const [storyTalking, setStoryTalking] = useState(false);
  const joystick = useRef<Motion>({ x: 0, y: 0 });
  const L = (en: string, kk: string, ru: string) =>
    translate([en, kk, ru], lang);
  const roomName = (n: number) => translate(rooms[n].name, lang);
  const current = rooms[room],
    started = progress.visited.length > 0;
  const points =
    progress.visited.length * 5 +
    progress.guides.length * 5 +
    progress.words.length * 10 +
    progress.quizzes.length * 20;
  const checks = [
    progress.visited.filter((id) => id >= 3).length >= 4,
    progress.guides.length >= 3,
    progress.words.length >= 4,
    progress.quizzes.length >= 3,
    progress.presentation.trim().split(/\s+/).filter(Boolean).length >= 25,
  ];
  const total = checks.filter(Boolean).length;
  useEffect(() => {
    try {
      localStorage.setItem(storage, JSON.stringify(progress));
    } catch {
      /* Browsing session remains usable without storage. */
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !menu && !panel) setPanel("pause");
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [menu, panel]);
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(""), 2900);
    return () => clearTimeout(timer);
  }, [status]);
  function changePanel(next?: Panel) {
    window.speechSynthesis?.cancel();
    setPanel(next);
    setStoryTalking(false);
    setAnswer(undefined);
    setPage(0);
  }
  function go(next: number) {
    if (next < 0 || next >= rooms.length) return;
    if (mode === "panorama") setMode("tour");
    setRoom(next);
    changePanel();
    setMenu(false);
    setProgress((p) => ({
      ...p,
      visited: intersects(p.visited, next),
      lastRoom: next,
    }));
  }
  function openStory(next: Zone) {
    changePanel("story");
    setZone(next);
  }
  function interact(kind: "guide" | "word") {
    if (room === storytellingRoom) {
      openStory(kind === "guide" ? "teacher" : "intro");
      return;
    }
    changePanel(kind);
    if (kind === "guide")
      setProgress((p) => ({ ...p, guides: intersects(p.guides, room) }));
  }
  function speak(text: string, locale = "en-GB") {
    if (!sound) {
      setStatus(L("Sound is muted.", "Дыбыс өшірулі.", "Звук выключен."));
      return;
    }
    if (!("speechSynthesis" in window)) {
      setStatus("Speech playback is unavailable in this browser.");
      return;
    }
    speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(text);
    message.lang = locale;
    message.rate = 0.89;
    message.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled")
        setStatus("Speech playback is unavailable on this device.");
    };
    speechSynthesis.speak(message);
  }
  function toggleSound() {
    if (sound) window.speechSynthesis?.cancel();
    setSound(!sound);
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setStatus(
        L(
          "Fullscreen is unavailable on this device.",
          "Толық экран қолжетімсіз.",
          "Полноэкранный режим недоступен.",
        ),
      );
    }
  }
  const brand = (
    <span className="brand">
      <span className="brand-icon">
        <GraduationCap size={23} />
      </span>
      <span>
        Virtual School<small>CAMPUS EXPLORER</small>
      </span>
    </span>
  );
  const langControl = (
    <label className="language">
      <Globe2 size={16} />
      <select
        aria-label="Language"
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
      >
        <option value="en">English</option>
        <option value="kk">Қазақша</option>
        <option value="ru">Русский</option>
      </select>
    </label>
  );
  const guideLine =
    page === 0
      ? current.line
      : current.example +
        " Try using “" +
        current.item[0].toLowerCase() +
        "” in a sentence about your own school.";
  const headings: Record<Panel, Translation> = {
    help: ["How to play", "Басқару", "Как играть"],
    settings: ["Settings", "Баптаулар", "Настройки"],
    pause: ["Paused", "Үзіліс", "Пауза"],
    map: ["Campus map", "Мектеп картасы", "Карта школы"],
    mission: [
      "Explore Your Virtual School",
      "Виртуалды мектебіңді зертте",
      "Исследуй виртуальную школу",
    ],
    guide: [current.guide, current.guide, current.guide],
    word: [current.item[0], current.item[0], current.item[0]],
    quiz: ["Listening challenge", "Тыңдалым тапсырмасы", "Аудирование"],
    info: ["Panorama", "Панорама", "Панорама"],
    story:
      zone === "teacher"
        ? ["Ms. Maya", "Ms. Maya", "Ms. Maya"]
        : zones.find((item) => item.id === zone)!.name,
  };
  const storyTitle = zones.find((item) => item.id === zone)?.title;
  return (
    <main className={menu ? "app home" : "app exploring"}>
      <div className="world">
        <Suspense
          fallback={
            <div className="scene-error">
              <span className="loading">
                <i /> Loading campus
              </span>
            </div>
          }
        >
          <World
            room={menu ? 0 : room}
            menu={menu}
            mode={mode}
            low={low}
            blocked={!!panel}
            joystick={joystick}
            lang={lang}
            go={go}
            interact={interact}
            openStory={openStory}
            markers={!menu && mode !== "panorama"}
            talking={panel === "guide" || storyTalking}
            pano={pano}
            selectPano={(index) => {
              if (panoramas[index]) setPano(index);
            }}
            information={(text) => {
              setInfo(text);
              changePanel("info");
            }}
          />
        </Suspense>
      </div>
      <div className="light-mask" />
      {!menu && (
        <div
          key={mode === "panorama" ? "p" + pano : room}
          className="arrival"
        />
      )}
      <header className="topbar">
        {brand}
        <div className="top-actions">
          {langControl}
          <button
            className="icon"
            onClick={toggleSound}
            aria-label={sound ? "Mute sound" : "Enable sound"}
          >
            {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <button
            className="icon fullscreen"
            onClick={fullscreen}
            aria-label="Fullscreen"
          >
            <Expand size={18} />
          </button>
          <button
            className="icon"
            onClick={() => changePanel(menu ? "settings" : "pause")}
            aria-label={menu ? "Settings" : "Pause"}
          >
            {menu ? <Settings2 size={19} /> : <Pause size={18} />}
          </button>
        </div>
      </header>
      {menu ? (
        <>
          <section className="hero">
            <div className="eyebrow">
              <Compass size={15} />
              {L(
                "INTERACTIVE CAMPUS TOUR",
                "ИНТЕРАКТИВТІ МЕКТЕП ТУРЫ",
                "ИНТЕРАКТИВНЫЙ ТУР ПО ШКОЛЕ",
              )}
            </div>
            <h1>
              {L("Virtual", "Виртуалды", "Виртуальная")}
              <br />
              <em>
                {L("School", "мектеп", "школа")}
                <span>.</span>
              </em>
            </h1>
            <p>
              {L(
                "Step inside a 3D school. Meet your guides, discover new English words, and complete a mission as you explore.",
                "3D мектепке кіріңіз. Гидтермен танысып, жаңа ағылшын сөздерін үйреніңіз және миссияны орындаңыз.",
                "Зайдите в 3D-школу, познакомьтесь с гидами, выучите новые английские слова и выполните миссию.",
              )}
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => go(0)}>
                <Play size={17} fill="currentColor" />
                {L("Start Exploration", "Зерттеуді бастау", "Начать экскурсию")}
                <ArrowRight size={18} className="start-arrow" />
              </button>
              <button className="secondary" onClick={() => changePanel("help")}>
                <CircleHelp size={17} />
                {L("How to Play", "Қалай ойнау керек", "Как играть")}
              </button>
            </div>
            {started && (
              <button className="resume" onClick={() => go(progress.lastRoom)}>
                {L(
                  "Resume exploration",
                  "Зерттеуді жалғастыру",
                  "Продолжить экскурсию",
                )}
              </button>
            )}
          </section>
          <footer className="landing-footer">
            <div className="feature-list">
              <span>
                <Compass size={17} /> 360°{" "}
                {L("exploration", "зерттеу", "экскурсия")}
              </span>
              <span>
                <BookOpen size={17} />{" "}
                {L("English practice", "Ағылшын тілі", "Практика английского")}
              </span>
              <span>
                <Trophy size={17} />{" "}
                {L("Campus mission", "Мектеп миссиясы", "Школьная миссия")}
              </span>
            </div>
            <span className="footer-location">
              <MapPin size={15} />
              {L("Courtyard", "Аула", "Двор")} <span>·</span>{" "}
              {L("Kazakhstan", "Қазақстан", "Казахстан")}
            </span>
          </footer>
        </>
      ) : (
        <>
          <div className="location glass">
            <span className="location-icon">
              <MapPin size={20} />
            </span>
            <span>
              <small>
                {mode === "panorama"
                  ? L("PANORAMA", "ПАНОРАМА", "ПАНОРАМА")
                  : L("CURRENT LOCATION", "АҒЫМДАҒЫ ОРЫН", "МЕСТОПОЛОЖЕНИЕ")}
              </small>
              <strong>
                {mode === "panorama"
                  ? (panoramas[pano]?.name ?? roomName(room))
                  : roomName(room)}
              </strong>
            </span>
          </div>
          <button
            className="mission glass"
            onClick={() => changePanel("mission")}
          >
            <Trophy size={19} />
            <span>
              <strong>
                {L("Campus mission", "Мектеп миссиясы", "Школьная миссия")}
              </strong>
              <small>
                {total}/5 {L("goals", "мақсат", "целей")} · {points} XP
              </small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button
            className="minimap glass"
            aria-label="Campus map"
            onClick={() => changePanel("map")}
          >
            <span>
              <Map size={17} />
              {L("Campus map", "Мектеп картасы", "Карта школы")}
            </span>
            <div className="map-grid">
              {rooms.map((r, i) => (
                <i
                  className={
                    i === room
                      ? "active"
                      : progress.visited.includes(i)
                        ? "visited"
                        : ""
                  }
                  key={r.guide}
                  style={{
                    gridArea: [
                      "3 / 2",
                      "2 / 2",
                      "2 / 3",
                      "1 / 1",
                      "1 / 2",
                      "1 / 3",
                      "1 / 4",
                      "1 / 5",
                      "2 / 5",
                    ][i],
                  }}
                />
              ))}
            </div>
          </button>
          {mode === "free" && !panel && <Joystick motion={joystick} />}
          {mode === "free" && (
            <span className="move-hint glass">
              <Footprints size={14} /> WASD / ↑↓←→ ·{" "}
              {L(
                "Drag to look",
                "Қарау үшін сүйреңіз",
                "Перетащите для обзора",
              )}
            </span>
          )}
          {room === storytellingRoom && mode !== "panorama" && (
            <nav className="studio-nav glass" aria-label={roomName(room)}>
              {zones.map(({ id, name, icon: Icon }) => (
                <button
                  className="icon"
                  key={id}
                  title={translate(name, lang)}
                  aria-label={translate(name, lang)}
                  onClick={() => openStory(id)}
                >
                  <Icon size={18} />
                </button>
              ))}
              <button
                className="icon"
                title={roomName(2)}
                aria-label={roomName(2)}
                onClick={() => go(2)}
              >
                <ArrowRight size={18} />
              </button>
            </nav>
          )}
          <div className="scene-buttons">
            {mode !== "panorama" && (
              <>
                <button
                  className="icon"
                  onClick={() => interact("guide")}
                  aria-label="Talk to guide"
                >
                  <AudioLines size={18} />
                </button>
                <button
                  className="icon"
                  onClick={() => interact("word")}
                  aria-label="Explore vocabulary"
                >
                  <BookOpen size={18} />
                </button>
              </>
            )}
            <button
              className="icon"
              onClick={() => go(0)}
              aria-label="Return to entrance"
            >
              <House size={18} />
            </button>
          </div>
          <nav
            className="tour-controls glass"
            aria-label="Exploration controls"
          >
            <button
              className="icon"
              aria-label="Previous location"
              disabled={mode === "panorama" ? pano === 0 : room === 0}
              onClick={() =>
                mode === "panorama" ? setPano(pano - 1) : go(room - 1)
              }
            >
              <ChevronLeft size={20} />
            </button>
            <button className="tour-label" onClick={() => changePanel("map")}>
              <Compass size={16} />
              {mode === "panorama"
                ? pano + 1 + " / " + panoramas.length
                : room + 1 + " / " + rooms.length}
            </button>
            <button
              className="icon"
              aria-label="Next location"
              disabled={
                mode === "panorama"
                  ? pano === panoramas.length - 1
                  : room === rooms.length - 1
              }
              onClick={() =>
                mode === "panorama" ? setPano(pano + 1) : go(room + 1)
              }
            >
              <ChevronRight size={20} />
            </button>
            <span className="divider" />
            <button
              className="mode-toggle"
              onClick={() => {
                if (mode === "panorama") {
                  setMode("tour");
                  return;
                }
                setMode(mode === "tour" ? "free" : "tour");
              }}
            >
              {mode === "tour" ? (
                <>
                  <Compass size={15} />
                  {L("Guided Tour", "Тур", "Экскурсия")}
                </>
              ) : mode === "free" ? (
                <>
                  <Footprints size={15} />
                  {L("Free Roam", "Еркін жүру", "Свободный режим")}
                </>
              ) : (
                <>
                  <Globe2 size={15} />
                  360°
                </>
              )}
            </button>
          </nav>
        </>
      )}
      {panel && (
        <Modal
          dialogue={
            panel === "guide" || (panel === "story" && zone === "teacher")
          }
          storytelling={panel === "story"}
          title={
            panel === "story" && lang === "en" && storyTitle
              ? storyTitle
              : translate(headings[panel], lang)
          }
          close={() => changePanel()}
        >
          {panel === "story" && (
            <Suspense fallback={<p>Loading lesson…</p>}>
              <StoryLesson
                key={zone}
                zone={zone}
                title={lang === "en" ? undefined : storyTitle}
                open={openStory}
                close={() => changePanel()}
                sound={sound}
                talking={setStoryTalking}
              />
            </Suspense>
          )}
          {panel === "help" && (
            <div className="stack">
              <p>
                <b>{L("Guided tour", "Экскурсия", "Экскурсия")}</b>{" "}
                {L(
                  "Click a door or use Next and Previous. Drag the scene to look around.",
                  "Есікті басыңыз немесе бағыттау түймелерін қолданыңыз. Айналаны көру үшін сүйреңіз.",
                  "Нажимайте на двери или листайте локации. Для обзора перетащите сцену.",
                )}
              </p>
              <p>
                <b>
                  {L(
                    "Free exploration",
                    "Еркін зерттеу",
                    "Свободное исследование",
                  )}
                </b>{" "}
                {L(
                  "Move with WASD or the arrow keys. On a touch screen, use the joystick.",
                  "WASD немесе бағыттау пернелерін, сенсорлық экранда джойстикті пайдаланыңыз.",
                  "Двигайтесь клавишами WASD или стрелками, на сенсорном экране используйте джойстик.",
                )}
              </p>
              <p>
                <b>{L("Learning mission", "Оқу миссиясы", "Учебная миссия")}</b>{" "}
                {L(
                  "Talk to guides and collect words. Open Campus Mission to see your goals.",
                  "Гидтермен сөйлесіп, сөздерді жинаңыз. Мақсаттарды миссия бөлімінен қараңыз.",
                  "Говорите с гидами и собирайте слова. Откройте миссию, чтобы увидеть цели.",
                )}
              </p>
              <button
                className="primary"
                onClick={() => (menu ? go(0) : changePanel())}
              >
                <Play size={17} />
                {L("Explore", "Зерттеу", "Исследовать")}
              </button>
            </div>
          )}
          {panel === "settings" && (
            <div className="stack">
              <div className="setting">
                <span>
                  {L("Interface language", "Интерфейс тілі", "Язык интерфейса")}
                </span>
                {langControl}
              </div>
              <div className="setting">
                <span>{L("Speech audio", "Дауыс", "Озвучивание")}</span>
                <button
                  className="secondary"
                  aria-pressed={sound}
                  onClick={toggleSound}
                >
                  {sound ? "On" : "Off"}
                </button>
              </div>
              <div className="setting">
                <span>
                  {L("Graphics quality", "Графика сапасы", "Качество графики")}
                </span>
                <button className="secondary" onClick={() => setLow(!low)}>
                  {low
                    ? L("Low", "Төмен", "Низкое")
                    : L("High", "Жоғары", "Высокое")}
                </button>
              </div>
              <button className="secondary" onClick={fullscreen}>
                <Expand size={17} />
                {L("Toggle fullscreen", "Толық экран", "Полный экран")}
              </button>
              <a className="secondary" href="#teacher">
                <GraduationCap size={17} />
                {L("Teacher dashboard", "Мұғалім панелі", "Панель учителя")}
              </a>
              {panoramas.length > 0 ? (
                <button
                  className="secondary"
                  onClick={() => {
                    go(0);
                    setMode("panorama");
                  }}
                >
                  <Globe2 size={17} /> 360°{" "}
                  {L("Photos", "Фотолар", "Фотографии")}
                </button>
              ) : (
                <p className="muted">
                  {L(
                    "Explore the generated 3D campus in 360°. Photo panoramas can be added later.",
                    "3D мектепті 360° режимінде зерттеңіз. Фотопанорамаларды кейін қосуға болады.",
                    "Исследуйте 3D-школу на 360°. Фотопанорамы можно добавить позже.",
                  )}
                </p>
              )}
            </div>
          )}
          {panel === "pause" && (
            <div className="stack">
              <button className="primary" onClick={() => changePanel()}>
                <Play size={17} />
                {L("Resume", "Жалғастыру", "Продолжить")}
              </button>
              <button
                className="secondary"
                onClick={() => changePanel("settings")}
              >
                <Settings2 size={17} />
                {L("Settings", "Баптаулар", "Настройки")}
              </button>
              <button className="secondary" onClick={() => changePanel("help")}>
                <CircleHelp size={17} />
                {L("How to Play", "Қалай ойнау керек", "Как играть")}
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setMode("tour");
                  setMenu(true);
                  changePanel();
                }}
              >
                <Menu size={17} />
                {L("Main menu", "Басты мәзір", "Главное меню")}
              </button>
            </div>
          )}
          {panel === "map" && (
            <div className="map-list">
              {rooms.map((r, i) => (
                <button
                  className={
                    i === room ? "room-option selected" : "room-option"
                  }
                  onClick={() => go(i)}
                  key={r.guide}
                >
                  <MapPin size={16} />
                  {roomName(i)}
                  {progress.visited.includes(i) && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
          {panel === "guide" && (
            <div className="stack">
              <div className="role">
                <AudioLines size={16} />
                {current.role}
              </div>
              <blockquote>{guideLine}</blockquote>
              <div className="row">
                <button className="secondary" onClick={() => speak(guideLine)}>
                  <Volume2 size={17} /> Listen
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    if (page === 0) {
                      setPage(1);
                      window.speechSynthesis?.cancel();
                    } else changePanel("quiz");
                  }}
                >
                  {page === 0 ? "Continue" : "Try the challenge"}
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
          {panel === "word" && (
            <div className="stack">
              <div className="translations">
                <span>
                  <small>Қазақша</small>
                  {current.item[1]}
                </span>
                <span>
                  <small>Русский</small>
                  {current.item[2]}
                </span>
              </div>
              <p>{current.meaning}</p>
              <blockquote>{current.example}</blockquote>
              <div className="row">
                <button
                  className="secondary"
                  onClick={() => speak(current.item[0])}
                >
                  <Volume2 size={17} />
                  Pronunciation
                </button>
                <button
                  className="primary"
                  onClick={() =>
                    setProgress((p) => ({
                      ...p,
                      words: intersects(p.words, room),
                    }))
                  }
                >
                  {progress.words.includes(room)
                    ? "✓ Collected"
                    : "Collect word"}
                </button>
              </div>
              <button className="secondary" onClick={() => changePanel("quiz")}>
                Try the challenge
              </button>
            </div>
          )}
          {panel === "quiz" && (
            <div className="stack">
              <p>
                Listen to the guide or read the passage. Which action matches
                what you learned?
              </p>
              <button className="secondary" onClick={() => speak(current.line)}>
                <Volume2 size={17} />
                Play audio
              </button>
              <details>
                <summary>Read the passage</summary>
                <p>{current.line}</p>
              </details>
              {orderedAnswers(room).map((option) => (
                <button
                  key={option.text}
                  className="secondary"
                  onClick={() => {
                    setAnswer(option.correct ? "correct" : "retry");
                    if (option.correct)
                      setProgress((p) => ({
                        ...p,
                        quizzes: intersects(p.quizzes, room),
                      }));
                  }}
                >
                  {option.text}
                </button>
              ))}
              {answer && (
                <p
                  role="status"
                  className={answer === "correct" ? "success" : "muted"}
                >
                  {answer === "correct"
                    ? "Correct! Challenge complete."
                    : "Try again. Listen for how the object or place is used."}
                </p>
              )}
              <p className="muted">
                <b>Speaking practice.</b> Describe this place aloud in two
                sentences. Use the word “{current.item[0].toLowerCase()}”.
              </p>
            </div>
          )}
          {panel === "mission" && (
            <div className="stack">
              <div className="mission-summary">
                <Trophy size={22} />
                <div>
                  <strong>
                    {points} XP · {total}/5 goals
                  </strong>
                  <small>
                    {total === 5
                      ? "Achievement unlocked · Campus Explorer"
                      : total >= 3
                        ? "Achievement unlocked · Word Explorer"
                        : "In progress"}
                  </small>
                </div>
              </div>
              <progress value={total} max={5} />
              <ul className="goals">
                {[
                  "Visit four learning rooms",
                  "Talk to three guides",
                  "Collect four vocabulary words",
                  "Complete three challenges",
                  "Draft a presentation of at least 25 words",
                ].map((label, i) => (
                  <li key={label}>
                    <span className={checks[i] ? "success" : ""}>
                      {checks[i] ? "✓" : "○"}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
              <label className="stack">
                My English presentation
                <textarea
                  rows={4}
                  maxLength={3000}
                  placeholder="Describe your school, your favorite room, and what you learned."
                  value={progress.presentation}
                  onChange={(e) =>
                    setProgress((p) => ({ ...p, presentation: e.target.value }))
                  }
                />
              </label>
              <div className="row">
                <button
                  className="secondary"
                  disabled={!progress.presentation.trim()}
                  onClick={() => speak(progress.presentation)}
                >
                  <Volume2 size={17} />
                  Listen to draft
                </button>
                <button className="primary" onClick={() => changePanel("map")}>
                  <Map size={17} />
                  Choose a room
                </button>
              </div>
              <p className="muted">
                Your progress and draft are saved in this browser.
              </p>
            </div>
          )}
          {panel === "info" && (
            <div className="stack">
              <p>{info}</p>
              <button className="secondary" onClick={() => speak(info)}>
                <Volume2 size={17} />
                Listen
              </button>
            </div>
          )}
          {status && (
            <p className="modal-status muted" role="status">
              {status}
            </p>
          )}
        </Modal>
      )}
      {status && !panel && (
        <div className="toast glass" role="status">
          {status}
        </div>
      )}
    </main>
  );
}
function AppRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  if (hash === "#teacher" || hash.startsWith("#teacher/")) {
    return (
      <Suspense fallback={<p>Loading teacher dashboard…</p>}>
        <TeacherDashboard key={hash} />
      </Suspense>
    );
  }
  return <App />;
}
createRoot(document.getElementById("root")!).render(<AppRoute />);
