import { readingRoom, cinemaRoom, techRoom, type Translation } from "./data";

export type RoomVideo = {
  title: string;
  src: string;
  webm: string;
  poster: string;
  heading: Translation;
  instruction: string;
  requiresCompletion: boolean;
  nextIsExample?: boolean;
};

const videos = import.meta.env.BASE_URL + "videos/";
export const roomVideos: Partial<Record<number, RoomVideo>> = {
  [readingRoom]: {
    title: "Reading for Pleasure — Literary Storyboards",
    src: videos + "door-3-reading-room.mp4",
    webm: videos + "door-3-reading-room.webm",
    poster: videos + "door-3-reading-room.jpg",
    heading: ["Watch the Explanation Video", "Түсіндірме видеоны көру", "Смотреть видеоинструкцию"],
    instruction: "Watch the explanation, then explore the sample storyboard before opening your task.",
    requiresCompletion: true,
    nextIsExample: true,
  },
  [techRoom]: {
    title: "Tech Review 2050",
    src: videos + "door-6-tech-arena.mp4?audio=mp3",
    webm: videos + "door-6-tech-arena.webm",
    poster: videos + "door-6-tech-arena.jpg",
    heading: ["Watch the Video", "Видеоны көру", "Смотреть видео"],
    instruction: "Watch the video carefully to understand the topic before starting your task.",
    requiresCompletion: false,
  },
  [cinemaRoom]: {
    title: "Movie Dubbing Challenge",
    src: videos + "door-7-cinema-studio.mp4",
    webm: videos + "door-7-cinema-studio.webm",
    poster: videos + "door-7-cinema-studio.jpg",
    heading: ["Watch the Explanation Video", "Түсіндірме видеоны көру", "Смотреть видеоинструкцию"],
    instruction: "Watch the explanation video carefully. Learn how to use the shadowing technique, dub movie characters, and create sound effects. After watching the video, open your task.",
    requiresCompletion: true,
  },
};
