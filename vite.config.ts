import { existsSync } from "node:fs";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  define: {
    __STORY_VIDEO__: JSON.stringify(
      ["mp4", "webm", "mov"]
        .map((ext) => `videos/storytelling-example.${ext}`)
        .find((path) =>
          existsSync(new URL(`./public/${path}`, import.meta.url)),
        ) ?? "",
    ),
    __STORY_CAPTIONS__: JSON.stringify(
      existsSync(
        new URL("./public/videos/storytelling-example.vtt", import.meta.url),
      ),
    ),
  },
});
