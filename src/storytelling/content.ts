import {
  AudioLines,
  BookOpen,
  Clapperboard,
  Film,
  Image,
  ListChecks,
  Mic,
  Music,
  Pencil,
  Upload,
  Video,
} from "lucide-react";
import type { Translation } from "../data";

export type Zone =
  "teacher" | "intro" | "steps" | "video" | "create" | "submit";

export const zones = [
  {
    id: "intro",
    short: ["Whiteboard", "Тақта", "Доска"],
    name: [
      "Introduction to Digital Storytelling",
      "Цифрлық әңгімелеуге кіріспе",
      "Введение в цифровые истории",
    ],
    title: "What Is Digital Storytelling?",
    icon: BookOpen,
  },
  {
    id: "steps",
    short: ["Guide", "Нұсқаулық", "Руководство"],
    name: ["Step-by-Step Guide", "Қадамдық нұсқаулық", "Пошаговое руководство"],
    title: "How to Create Your Own Digital Story",
    icon: ListChecks,
  },
  {
    id: "video",
    short: ["Watch example", "Үлгіні көр", "Смотреть пример"],
    name: ["Watch example", "Үлгіні көру", "Посмотреть пример"],
    title: "Watch example",
    icon: Film,
  },
  {
    id: "create",
    short: ["Create", "Жоба жаса", "Создать"],
    name: ["Create Your Own Story", "Өз әңгімеңді жаса", "Создай свою историю"],
    title: "Create Your Own Digital Story",
    icon: Pencil,
  },
  {
    id: "submit",
    short: ["Submit", "Жібер", "Отправить"],
    name: ["Submit Your Project", "Жобаңды жібер", "Отправь свой проект"],
    title: "Submit Your Digital Story",
    icon: Upload,
  },
] satisfies {
  id: Exclude<Zone, "teacher">;
  name: Translation;
  short: Translation;
  title: string;
  icon: typeof BookOpen;
}[];

export const poster =
  import.meta.env.BASE_URL + "storytelling/youre-not-alone.jpg";

export const teacherLines = [
  "Hello, students! Welcome to The Feedback, our digital storytelling studio!",
  "Today, you are going to learn how to create your own digital story.",
  "Digital storytelling is a creative way to share your ideas, experiences, and emotions using pictures, videos, music, and your voice.",
  "First, explore the storytelling guide. Then, watch an example video. Finally, create your own digital story and submit it to your teacher.",
  "Are you ready? Let's get started!",
];

export const media = [
  ["Story", BookOpen],
  ["Images", Image],
  ["Video", Video],
  ["Voice", Mic],
  ["Music", Music],
  ["Message", AudioLines],
] as const;

export const structure = [
  [
    "Setting",
    "Where and when the story happens.",
    "A city school on a Monday morning.",
  ],
  [
    "Character",
    "The person we follow in the story.",
    "Mia, a student who loves to draw.",
  ],
  [
    "Goal",
    "What the character wants.",
    "Mia wants to feel safe with her friends.",
  ],
  [
    "Conflict",
    "The problem in the character’s way.",
    "People send Mia mean messages.",
  ],
  [
    "Rising Action",
    "Events that make the problem harder.",
    "The messages keep coming, and Mia stops drawing.",
  ],
  [
    "Climax",
    "The most important moment, when things start to change.",
    "Mia tells her teacher what happened.",
  ],
  [
    "Resolution",
    "How the problem is solved or how things change.",
    "Mia gets support and reports the messages.",
  ],
  [
    "Message",
    "The idea you want the audience to remember.",
    "Speak up and help people who are being bullied.",
  ],
] as const;

export const steps = [
  {
    title: "Choose a Topic",
    icon: BookOpen,
    text: "Choose an interesting topic you want to share with your audience.",
    example:
      "My Biggest Challenge could be a story about speaking in front of the class.",
    prompts: [
      "My Childhood Memory",
      "A Day That Changed My Life",
      "My Dream Job",
      "My Biggest Challenge",
      "My Future",
      "An Unforgettable Journey",
    ],
  },
  {
    title: "Create Your Story Idea",
    icon: Pencil,
    text: "Decide who your main character is, where the story happens, what the character wants, and what problem gets in the way.",
    example:
      "A new student wants to make a friend but feels too shy to say hello.",
  },
  {
    title: "Write Your Script",
    icon: ListChecks,
    text: "Write in English. In the beginning, introduce the characters and setting. In the middle, show the problem and important events. In the ending, show how the problem is solved and share the message.",
    example:
      "I arrived alone. At lunch, I sat beside another student. By Friday, I had a friend.",
  },
  {
    title: "Create a Storyboard",
    icon: Clapperboard,
    text: "Plan 6–8 scenes. For each scene, write what happens, what we see, what the narrator says, and what music or sounds we hear.",
    example:
      "Scene 1 shows an empty lunch table. The narrator says, ‘It was my first day.’ We hear the lunch bell.",
  },
  {
    title: "Prepare Visual Materials",
    icon: Image,
    text: "Collect or make pictures, drawings, animations, and clips that help tell your story. Use your own work or materials you have permission to use. Keep a list for your credits.",
    example:
      "Take a photo of an empty table and credit a sound clip you have permission to use.",
  },
  {
    title: "Record Your Voice",
    icon: Mic,
    text: "Practice your English first. Speak clearly at a steady speed. Pause between ideas, stress important words, and change your tone to show feelings.",
    example:
      "Pause after ‘I opened the door.’ Then say ‘Everyone smiled’ in a warm voice.",
  },
  {
    title: "Edit Your Video",
    icon: Film,
    text: "Put your voice, photos, clips, and transitions together. You can use Canva, CapCut, or iMovie. Keep any background music quiet so the audience can hear you.",
    example:
      "Fade from the hallway to the lunch table as the narration continues.",
  },
  {
    title: "Review and Submit",
    icon: Upload,
    text: "Watch your whole video. Check your grammar, pronunciation, story order, pictures, and sound. Upload your finished video at the submission station.",
    example:
      "Ask a classmate to listen and tell you the main message before you submit.",
  },
];

export const questions = [
  "Who is the main character?",
  "Where does the story happen?",
  "What is the main problem?",
  "What happens at the climax?",
  "How does the story end?",
  "What is the main message?",
  "How do visuals, music, and narration support the story?",
];
export const requirements = [
  "A clear title",
  "An interesting topic",
  "A main character",
  "A setting",
  "A problem or conflict",
  "A beginning, middle, and ending",
  "English voice narration",
  "Relevant images or videos",
  "A meaningful message",
  "Credits for external materials",
];
export const rubric = [
  [
    "Story structure and organization",
    "The beginning, middle, and ending are clear. The events are easy to follow.",
  ],
  [
    "Creativity and originality",
    "You share your own ideas and tell the story in an interesting way.",
  ],
  [
    "English language and grammar",
    "Your English is clear and the words fit the story.",
  ],
  [
    "Pronunciation and voice narration",
    "Your words are easy to hear and understand. You use a good speed and tone.",
  ],
  [
    "Visual quality and technical presentation",
    "Images and sound are clear and help tell the story. The video plays well.",
  ],
] as const;
