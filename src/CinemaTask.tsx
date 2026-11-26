import { Play } from "lucide-react";

const steps = [
  ["Choose a movie scene", "Pick 30–60 seconds of dramatic dialogue from a movie or cartoon you have permission to use. You can also create your own scene."],
  ["Listen carefully", "Watch the scene several times. Listen for changes in speed, pauses and emotion, and watch the characters’ expressions."],
  ["Prepare the dialogue", "Write down the English lines. Mark the stressed words, practise difficult sounds and decide how each character feels."],
  ["Practise shadowing", "Play one line and repeat it almost immediately. Match the speaker’s rhythm, pronunciation, intonation and emotion. Repeat until the line feels natural."],
  ["Dub the characters", "Mute the original dialogue and record your own English voices. Match each line to the character’s mouth movements and actions. You may work alone, in pairs or in a small group."],
  ["Create sound effects", "Record sounds such as rain, footsteps or a closing door. You can also use licensed effects and music. Keep them quiet enough to hear every line."],
  ["Edit the scene", "Combine the scene, dialogue, effects and music. You can edit the video in CapCut, Canva or iMovie, and edit the audio in Audacity."],
  ["Review your project", "Watch your finished scene. Check the timing, emotions and sound balance, then export your 30–60 second video."],
];

export const cinemaChecklist = [
  "I selected a 30–60 second dramatic scene.",
  "I practiced the shadowing technique.",
  "I recorded my own English dialogue.",
  "I used appropriate pronunciation and intonation.",
  "I expressed the characters’ emotions.",
  "I synchronized my voice with the scene.",
  "I added background sound effects.",
  "My dialogue is clear and understandable.",
  "I reviewed my final video.",
  "I have permission to share the materials used in my project.",
];

export function CinemaTask({ assignment, checked, toggle, replay }: {
  assignment: string;
  checked: number[];
  toggle: (index: number) => void;
  replay: () => void;
}) {
  return (
    <section className="story-lesson story-stack" lang="en">
      <h3>YOUR TASK — MOVIE DUBBING CHALLENGE</h3>
      <blockquote>{assignment}</blockquote>
      <div>
        <h4>What is shadowing?</h4>
        <p>Listen to a line and repeat it almost immediately. Copy how the speaker sounds, including the speed, pauses and emotion in their voice.</p>
      </div>
      <details className="story-card">
        <summary>Step-by-step project guide</summary>
        <ol className="cinema-steps">
          {steps.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}
        </ol>
      </details>
      <details className="story-card">
        <summary>What will you learn?</summary>
        <p>Practise listening and speaking with natural rhythm, intonation and clearer pronunciation. Use your voice to express emotion and edit dialogue and sound effects to tell a visual story.</p>
      </details>
      <details className="story-card">
        <summary>Project checklist · {checked.length}/{cinemaChecklist.length}</summary>
        <div className="story-stack">
          <progress aria-label="Project checklist" value={checked.length} max={cinemaChecklist.length} />
          {cinemaChecklist.map((item, index) => (
            <label key={item} className="story-check">
              <input type="checkbox" checked={checked.includes(index)} onChange={() => toggle(index)} />
              {item}
            </label>
          ))}
        </div>
      </details>
      <details className="story-card">
        <summary>Assessment criteria · 100 points</summary>
        <p>Your teacher assesses five skills. Each is worth 20 points.</p>
        <ul>
          {["Pronunciation and clarity", "Rhythm and intonation", "Emotional expression", "Voice synchronization", "Creativity and sound effects"].map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </details>
      <button className="secondary" onClick={replay}><Play size={16} />Watch the explanation again</button>
    </section>
  );
}
