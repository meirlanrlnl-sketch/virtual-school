import { brainRoom, disasterRoom, mythbusterRoom } from "./data";

export type Poster = { src: string; alt: string };
export type RoomPosters = [Poster] | [Poster, Poster];
const base = import.meta.env.BASE_URL + "posters/";

export const roomPosters: Partial<Record<number, RoomPosters>> = {
  [mythbusterRoom]: [
    { src: base + "einstein.png", alt: "Albert Einstein — True or Myth? Eight illustrated claims about his schooling, childhood, scientific work and Nobel Prize to investigate." },
  ],
  [disasterRoom]: [
    { src: base + "disaster-1.png", alt: "How to Avoid Natural Disasters — risk reduction and community preparedness" },
    { src: base + "disaster-2.png", alt: "How to Avoid Natural Disasters — prevent the risk and be prepared" },
  ],
  [brainRoom]: [
    { src: base + "brain-1.png", alt: "Ending 2: The Stress Master. A student sleeps, eats breakfast, takes a break and feels confident during her exam." },
    { src: base + "brain-2.png", alt: "Ending 1: Stress Overload. A student studies late, skips breakfast and struggles to concentrate during her exam." },
  ],
};
