export type Lang = "en" | "kk" | "ru";
export type Translation = [string, string, string];
export const translate = (values: Translation, lang: Lang) =>
  values[["en", "kk", "ru"].indexOf(lang)];
export const rooms = [
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
    name: ["Entrance Hall", "Кіреберіс залы", "Вестибюль"],
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
    name: ["English Classroom", "Ағылшын тілі кабинеті", "Кабинет английского"],
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
    name: ["Physics Lab", "Физика зертханасы", "Кабинет физики"],
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
    name: ["Computer Lab", "Информатика кабинеті", "Кабинет информатики"],
    guide: "Mira",
    color: "#7963a9",
    role: "Computer science guide",
    line: "Computers help us solve problems. Use the keyboard to type instructions and see the result on the monitor.",
    item: ["Keyboard", "Пернетақта", "Клавиатура"],
    example: "I used the keyboard to type my name.",
    meaning: "A set of keys used to enter information into a computer.",
    options: [
      "Type instructions",
      "Measure the length of a desk",
      "Look up a word on a globe",
    ],
  },
  {
    name: ["Library", "Кітапхана", "Библиотека"],
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
    name: ["School Museum", "Мектеп мұражайы", "Школьный музей"],
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
    name: [
      "Digital Storytelling Classroom",
      "Цифрлық әңгімелеу сыныбы",
      "Класс цифровых историй",
    ],
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
] satisfies {
  name: Translation;
  guide: string;
  color: string;
  role: string;
  line: string;
  item: Translation;
  example: string;
  meaning: string;
  options: string[];
}[];
export const storytellingRoom = 8;
export const links = [
  [1],
  [0, 2],
  [1, 3, 4, 5, 6, 7, storytellingRoom],
  [2],
  [2],
  [2],
  [2],
  [2],
  [2],
];
export function orderedAnswers(room: number) {
  const options = rooms[room].options;
  return [0, 1, 2]
    .map((offset) => (offset + room + 1) % 3)
    .map((index) => ({ text: options[index], correct: index === 0 }));
}
