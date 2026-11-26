export type Lang = "en" | "kk" | "ru";
export type Translation = [string, string, string];
export const translate = (values: Translation, lang: Lang) =>
  values[["en", "kk", "ru"].indexOf(lang)];
type Assignment = {
  module: string;
  role: string;
  technique: string;
  steps: string[];
  language: string;
  artifact: string;
};
type Room = {
  name: Translation;
  door?: number;
  assignment?: Assignment;
  guide: string;
  color: string;
  role: string;
  line: string;
  item: Translation;
  example: string;
  meaning: string;
  options: string[];
};

// Room indices identify saved progress. New locations go at the end.
export const rooms: Room[] = [
  {
    name: ["Courtyard", "Аула", "Двор"],
    guide: "Alex",
    color: "#279998",
    role: "Campus guide",
    line: "Welcome to our virtual school! Walk along the path to find the main entrance.",
    item: ["Entrance", "Кіреберіс", "Вход"],
    example: "We meet at the entrance before class.",
    meaning: "The place where you enter a building.",
    options: [
      "Wait at the entrance",
      "Climb onto the roof",
      "Go to the parking lot",
    ],
  },
  {
    name: ["The Entrance", "Кіреберіс", "Вход"],
    door: 9,
    guide: "Aida",
    color: "#c88d52",
    role: "Reception guide",
    line: "This is the entrance hall. Look at the noticeboard to find out what is happening this week.",
    item: ["Noticeboard", "Хабарландыру тақтасы", "Доска объявлений"],
    example: "The school concert is on the noticeboard.",
    meaning: "A board where people put up news and announcements.",
    options: [
      "Read school announcements",
      "Borrow a novel",
      "Measure temperature",
    ],
  },
  {
    name: ["Corridor", "Дәліз", "Коридор"],
    guide: "Daniyar",
    color: "#4f94c9",
    role: "Student guide",
    line: "The corridor connects our classrooms. Each door has a sign with the name of a room.",
    item: ["Sign", "Белгі", "Табличка"],
    example: "The sign shows where the library is.",
    meaning:
      "A piece of information that helps people find or understand something.",
    options: [
      "Find the correct room",
      "Play a musical instrument",
      "Write a computer program",
    ],
  },
  {
    name: ["The Mythbuster Lab", "Мифтерді тексеру зертханасы", "Лаборатория проверки мифов"],
    door: 1,
    assignment: {
      module: "Module 1 · Science",
      role: "Science Detective",
      technique: "Audio True Crime Case File (podcast style)",
      steps: [
        'Students investigate famous scientific myths (e.g., "Did Einstein really fail math?"). They use AI to check facts, then record a dramatic 1-minute audio report exposing the truth.',
      ],
      language: "Use past modals of speculation (“He must have been a genius”) and the passive voice (“The myth was created by…”). Practise shadowing by copying the dramatic intonation of a true-crime podcast.",
      artifact: "“The Reveal”, a one-minute audio file for the tour.",
    },
    guide: "Ms. Amina",
    color: "#cc8b45",
    role: "English teacher",
    line: "Today we are learning about different countries. A globe shows the shape of the Earth. Can you find Kazakhstan?",
    item: ["Globe", "Глобус", "Глобус"],
    example: "We found Kazakhstan on the globe.",
    meaning: "A round model of the Earth.",
    options: [
      "Find Kazakhstan on a globe",
      "Type a sentence on a keyboard",
      "Study a rock under a microscope",
    ],
  },
  {
    name: ["The Disaster Zone", "Апат аймағы", "Зона стихийных бедствий"],
    door: 2,
    assignment: {
      module: "Module 2 · Natural Disasters",
      role: "Survival Instructor",
      technique: "Survival Infographic Poster + Stop-Motion Animation",
      steps: [
        'Create a visual safety guide for a natural disaster. Students can make a poster or a short stop-motion video where a clay volcano "erupts" and speaks.',
      ],
      language: "Use compound adjectives (“fast-moving flood”, “life-saving tips”) and imperatives (“Don’t panic!”).",
      artifact: "A visual warning sign or poster for the 360° tour.",
    },
    guide: "Mr. Timur",
    color: "#397fa3",
    role: "Physics teacher",
    line: "Welcome to the lab. We use a microscope when an object is too small to see clearly with our eyes.",
    item: ["Microscope", "Микроскоп", "Микроскоп"],
    example: "Students use a microscope to study small objects.",
    meaning: "An instrument that makes very small things look larger.",
    options: [
      "Look closely at a tiny object",
      "Read an announcement",
      "Listen to a song",
    ],
  },
  {
    name: ["The Reading Room", "Оқу залы", "Читальный зал"],
    door: 3,
    assignment: {
      module: "Module 5 · Reading for Pleasure",
      role: "Screenwriter / Director",
      technique: "“Page to Screen” Storyboard + Evidence Board (Miro)",
      steps: [
        "Choose a key scene from a book and storyboard it. Use an interactive digital board to connect characters, locations, and quotes.",
      ],
      language: "Practise different question types. Use conjunctions and linking words such as “because”, “however”, and “therefore”.",
      artifact: "A visual storyboard that maps out the route for the 360° tour.",
    },
    guide: "Mira",
    color: "#7963a9",
    role: "Storyboard guide",
    line: "Use the keyboard to type a quote from your scene. Connect it to the character who says it on your digital board.",
    item: ["Keyboard", "Пернетақта", "Клавиатура"],
    example: "I used the keyboard to type my name.",
    meaning: "A set of keys used to enter information into a computer.",
    options: [
      "Type a quote from the scene",
      "Measure the length of a desk",
      "Look up a word on a globe",
    ],
  },
  {
    name: ["The Eco-Dome", "Эко-күмбез", "Экокупол"],
    door: 4,
    assignment: {
      module: "Module 4 · Organic & Non-organic",
      role: "Writer / Environmentalist",
      technique: "Storybook “Diary of an Atom”",
      steps: [
        "Write and illustrate a short story from the perspective of a molecule (e.g., a plastic bottle or a seed) traveling through time.",
      ],
      language: "Use the future simple and future perfect. For the future perfect, try “By 2050, this bottle will have decomposed.”",
      artifact: "A digital storybook that provides the narrative text for the tour.",
    },
    guide: "Ms. Sara",
    color: "#62865c",
    role: "Librarian",
    line: "You can borrow books from the library. A dictionary helps you understand new words and check how to spell them.",
    item: ["Dictionary", "Сөздік", "Словарь"],
    example: "I checked the meaning in a dictionary.",
    meaning: "A book or app that explains the meaning of words.",
    options: [
      "Check the meaning of a word",
      "Find a tiny object",
      "Take a picture",
    ],
  },
  {
    name: ["The Brain Center", "Миды зерттеу орталығы", "Центр изучения мозга"],
    door: 5,
    assignment: {
      module: "Module 6 · Human Brain",
      role: "Psychologist / Game Designer",
      technique: "Interactive Quest-Comic (branching scenario)",
      steps: [
        "Create a comic (in Genially or Google Slides) where the reader makes choices about how to handle stress. Different choices lead to different endings.",
      ],
      language: "Use third conditionals to reflect on choices (“If you had slept more, you wouldn’t have felt stressed”).",
      artifact: "An interactive comic where the viewer chooses what happens next.",
    },
    guide: "Arman",
    color: "#a76557",
    role: "Museum guide",
    line: "This is a dombra, a traditional two-string instrument from Kazakhstan. Musicians play it to tell stories through music.",
    item: ["Dombra", "Домбыра", "Домбра"],
    example: "My grandfather plays the dombra.",
    meaning: "A traditional Kazakh string instrument with a long neck.",
    options: [
      "Play traditional music",
      "Type a message",
      "Find a country on a map",
    ],
  },
  {
    name: ["The Feedback", "Кері байланыс", "Обратная связь"],
    door: 8,
    assignment: {
      module: "Feedback & Showcase",
      role: "360° Narrative Director",
      technique: "360° Tour Assembly + Public Testing + Iteration Log",
      steps: [
        "Assemble: Combine all artifacts from Doors 1–7 into one 360° tour (CoSpaces/Panoee) or a QR-code audio guide.",
        "Test: Present the tour to a real audience (parents, other classes). Ask 3 questions: Where did you get lost? Where was it boring? What was the best part?",
        "Revise: Fill out the Iteration Sheet and the AI Log (what did you generate, what did you change, and why?).",
      ],
      language: "Reflect in English (“I decided to change the audio because…”). Practise public speaking and defend your project decisions.",
      artifact: "The final tour, a public defense, and a written reflection.",
    },
    guide: "Ms. Maya",
    color: "#67519b",
    role: "English teacher",
    line: "A digital story uses words, pictures, and sound to share a message.",
    item: ["Storyboard", "Кадрлық жоспар", "Раскадровка"],
    example: "I planned six scenes on my storyboard.",
    meaning: "A plan that shows what happens in each scene.",
    options: [
      "Plan the scenes in a story",
      "Turn up the music",
      "Print a photograph",
    ],
  },
  {
    name: ["The Tech Arena", "Технологиялар аренасы", "Арена технологий"],
    door: 6,
    assignment: {
      module: "Module 7 · Breakthrough Technologies",
      role: "Tech Reviewer from the Future",
      technique: "Vlog “Tech Review 2050” + AI Interview",
      steps: [
        'Record a video blog presenting a breakthrough technology as if it already exists. Use AI as a "virtual assistant" and interview it.',
      ],
      language: "Use reported speech (“The scientist said that they had created…”).",
      artifact: "A video clip for the tour.",
    },
    guide: "Aliya",
    color: "#367d84",
    role: "Technology guide",
    line: "Meet our virtual assistant. Ask it how the technology works, then report its answer in your review.",
    item: ["Virtual assistant", "Виртуалды көмекші", "Виртуальный помощник"],
    example: "The virtual assistant said that the robot could recognise voices.",
    meaning: "A program that answers questions or helps you carry out tasks.",
    options: ["Interview a virtual assistant", "Read the noticeboard", "Borrow a novel"],
  },
  {
    name: ["The Cinema Studio", "Киностудия", "Киностудия"],
    door: 7,
    assignment: {
      module: "Movie Dubbing, Shadowing and Sound Effects",
      role: "Sound Designer / Voice Actor",
      technique: "Movie dubbing, shadowing and sound effects",
      steps: [
        "Choose a 30–60 second dramatic scene from a favorite movie or cartoon (e.g., Harry Potter, The Lion King, Inside Out). Dub the voices using the shadowing technique and create background sound effects (magic sounds, rain, dramatic music) to build the atmosphere.",
      ],
      language: "Match the characters’ pronunciation, rhythm, intonation and emotions.",
      artifact: "A 30–60 second scene with your English dialogue and sound effects.",
    },
    guide: "Samira",
    color: "#726393",
    role: "Studio sound director",
    line: "Use the microphone to record your character’s voice. Listen to a line, then repeat it with the same rhythm and emotion.",
    item: ["Microphone", "Микрофон", "Микрофон"],
    example: "I recorded my character’s dialogue with a microphone.",
    meaning: "A device that picks up sound so you can record it.",
    options: ["Record a character’s voice", "Inspect a rock", "Draw a map"],
  },
];
export const mythbusterRoom = 3;
export const disasterRoom = 4;
export const ecoRoom = 6;
export const brainRoom = 7;
export const readingRoom = 5;
export const storytellingRoom = 8;
export const techRoom = 9;
export const cinemaRoom = 10;
export const corridorDoors = rooms
  .map((room, id) => ({ id, number: room.door ?? 0 }))
  .filter((door) => door.number > 0)
  .sort((a, b) => a.number - b.number)
  .map((door) => door.id);
export const tourRooms = [0, 1, 2, ...corridorDoors.filter((id) => id !== 1)];
export const links = rooms.map((_, id) => {
  if (id === 0) return [1];
  if (id === 1) return [0, 2];
  if (id === 2) return corridorDoors;
  return [2];
});
export function doorPrefix(room: number, lang: Lang) {
  const n = rooms[room].door;
  return n ? translate([`Door ${n}`, `${n}-есік`, `Дверь ${n}`], lang) : "";
}
export function roomLabel(room: number, lang: Lang) {
  return [doorPrefix(room, lang), translate(rooms[room].name, lang)]
    .filter(Boolean)
    .join(" · ");
}
export function orderedAnswers(room: number) {
  const options = rooms[room].options;
  return [0, 1, 2]
    .map((offset) => (offset + room + 1) % 3)
    .map((index) => ({ text: options[index], correct: index === 0 }));
}
