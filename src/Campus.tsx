import { Fragment } from "react";
import {
  Box,
  Desk,
  Flag,
  Label,
  Marker,
  Orb,
  Person,
  Planks,
  Shelf,
  ink,
  wood,
  type XYZ,
} from "./geometry";
import { StoryStudio } from "./storytelling/Studio";
import type { Zone } from "./storytelling/content";
import { links, rooms, storytellingRoom, translate, type Lang } from "./data";
export type SceneActions = {
  room: number;
  lang: Lang;
  go: (n: number) => void;
  interact: (kind: "guide" | "word") => void;
  openStory: (zone: Zone) => void;
  markers: boolean;
  talking: boolean;
  blocked: boolean;
};
const glass = "#6096ac",
  cream = "#f0dcc0",
  slate = "#315b66";
function Tree({ p, variant = 0 }: { p: XYZ; variant?: number }) {
  return (
    <group position={p} scale={1 + variant * 0.12}>
      <Box p={[0, 0.95, 0]} s={[0.26, 1.9, 0.27]} c="#886344" solid />
      <Orb
        p={[0, 2.6, 0]}
        s={[1.02, 1.38, 0.97]}
        c={["#54865a", "#65964f", "#769d51"][variant % 3]}
      />
      <Orb p={[0.51, 2.1, 0.08]} s={[0.72, 0.84, 0.69]} c="#729e59" />
      <Orb p={[-0.38, 2.36, 0.21]} s={[0.71, 0.91, 0.65]} c="#477e5d" />
    </group>
  );
}
export function Courtyard({
  go,
  interact,
  markers,
  talking,
  lang,
}: SceneActions) {
  return (
    <>
      <color attach="background" args={["#9bccdc"]} />
      <fog attach="fog" args={["#a9d5e0", 37, 87]} />
      <Box p={[0, -0.18, 0]} s={[96, 0.35, 96]} c="#7d9e69" />
      <Box p={[0, 3, -5.7]} s={[25, 6, 11]} c="#c99169" solid />
      <Box p={[0, 0.22, -5.6]} s={[25.3, 0.45, 11.2]} c="#9b9c91" />
      <Box p={[0, 6.13, -5.7]} s={[25.6, 0.35, 11.35]} c={slate} />
      <Box p={[0, 6.42, -5.7]} s={[24.8, 0.24, 10.85]} c={cream} />
      <Box p={[0, 7, -5.9]} s={[7, 1.15, 6.8]} c="#bb825d" />
      <Box p={[0, 7.59, -5.9]} s={[7.4, 0.24, 7.13]} c={slate} />
      {[0.62, 3.26, 5.81].map((y) => (
        <Box key={y} p={[0, y, -0.14]} s={[25.17, 0.15, 0.24]} c={cream} />
      ))}
      {[-11, -8.65, -6.3, -4, 4, 6.3, 8.65, 11].map((x) => (
        <Fragment key={x}>
          {[1.69, 4.55].map((y) => (
            <group position={[x, y, -0.12]} key={y}>
              <Box s={[1.71, 1.79, 0.2]} c={cream} />
              <Box p={[0, 0, 0.115]} s={[1.51, 1.56, 0.044]} c={slate} />
              <Box p={[0, 0.03, 0.147]} s={[1.36, 1.39, 0.024]} c={glass} />
              <Box p={[0, 0.03, 0.171]} s={[0.062, 1.46, 0.025]} c={cream} />
              <Box p={[0, 0.42, 0.171]} s={[1.43, 0.045, 0.025]} c={cream} />
              <Box p={[0, -0.9, 0.11]} s={[1.85, 0.1, 0.31]} c={cream} />
            </group>
          ))}
        </Fragment>
      ))}
      {[-12.25, -3.0, 3.0, 12.25].map((x) => (
        <Box key={x} p={[x, 3.2, -0.04]} s={[0.36, 5.2, 0.35]} c="#e2b286" />
      ))}
      <Box p={[0, 4.68, 0.16]} s={[5.83, 2.31, 0.66]} c="#ebcda8" />
      <Label
        p={[0, 4.78, 0.503]}
        w={5.15}
        h={0.92}
        text="VIRTUAL SCHOOL"
        bg="#ebcda8"
        fg="#274e56"
      />
      <Label
        p={[0, 4.04, 0.503]}
        w={3}
        h={0.37}
        text="БІЛІМ • KNOWLEDGE"
        bg="#ebcda8"
        fg="#416874"
      />
      <Box p={[0, 3.23, 1]} s={[6.25, 0.24, 2.52]} c={slate} />
      <Box p={[0, 3.1, 1]} s={[6.12, 0.095, 2.43]} c={cream} />
      {[-2.72, 2.72].map((x) => (
        <Box
          key={x}
          p={[x, 1.52, 1.88]}
          s={[0.31, 3.04, 0.32]}
          c={cream}
          solid
        />
      ))}
      <group
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
      >
        <Box p={[0, 1.51, 0.12]} s={[3.66, 3.02, 0.25]} c={ink} />
        {[-0.87, 0.87].map((x) => (
          <group key={x}>
            <Box p={[x, 1.52, 0.271]} s={[1.62, 2.74, 0.045]} c="#507d92" />
            <Box p={[x, 1.62, 0.3]} s={[1.62, 0.1, 0.05]} c={cream} />
            <Box
              p={[x * 0.29, 1.16, 0.34]}
              s={[0.075, 0.38, 0.09]}
              c="#e7ba75"
            />
          </group>
        ))}
      </group>
      <Box p={[0, 0.05, 10]} s={[4.2, 0.14, 19.6]} c="#b9b7a1" />
      {Array.from({ length: 23 }, (_, i) => (
        <Box
          key={i}
          p={[0, 0.123, 1.15 + i * 0.79]}
          s={[4.19, 0.008, 0.018]}
          c="#969b8d"
        />
      ))}
      <Box p={[0, 0.13, 1.14]} s={[5.72, 0.23, 2.26]} c="#c7bdab" />
      {[-1, 1].map((sign) => (
        <group key={sign}>
          <Box p={[sign * 5, 0.04, 7.8]} s={[6, 0.09, 1.63]} c="#b9b7a1" />
          {[5, 9.6, 13.6].map((x, i) => (
            <Tree key={x} p={[sign * x, 0, 2.5 + i * 3.66]} variant={i} />
          ))}
          <group position={[sign * 5.4, 0, 6.2]}>
            <Box p={[0, 0.44, 0]} s={[2.1, 0.14, 0.64]} c={wood} solid />
            <Box p={[0, 0.82, -0.27]} s={[2.1, 0.37, 0.11]} c={wood} />
            {[-0.78, 0.78].map((x) => (
              <Box key={x} p={[x, 0.25, 0]} s={[0.1, 0.5, 0.49]} c={slate} />
            ))}
          </group>
          {Array.from({ length: 9 }, (_, i) => (
            <Orb
              key={i}
              p={[sign * (3.2 + i * 0.92), 0.3, 0.6]}
              s={[0.52, 0.5, 0.49]}
              c={i % 2 ? "#6f994f" : "#5e8c60"}
            />
          ))}
        </group>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <Tree key={i} p={[(i - 5) * 5.2, 0, -13.4]} variant={i % 3} />
      ))}
      <Box p={[4.3, 2.62, 3]} s={[0.07, 5.2, 0.07]} c="#dce1d7" solid />
      <Flag p={[5.23, 4.5, 3]} w={1.8} />
      {Array.from({ length: 7 }, (_, i) => (
        <group
          key={i}
          position={[(i - 3) * 11, 10 + (i % 2) * 3, -19 - (i % 3) * 7]}
        >
          <Orb p={[0, 0, 0]} s={[3.7, 0.58, 1.35]} c="#e3edf0" />
          <Orb p={[-0.3, 0.48, 0.08]} s={[2.05, 0.72, 1.17]} c="#ecf4f6" />
        </group>
      ))}
      <Person
        p={[-1.53, 0.13, 3.6]}
        color={rooms[0].color}
        talking={talking}
        onClick={() => interact("guide")}
      />
      {markers && (
        <>
          <Marker p={[0, 2.27, 0.52]} action={() => go(1)}>
            {translate(rooms[1].name, lang)}
          </Marker>
          <Marker p={[-1.53, 2.1, 3.6]} action={() => interact("guide")}>
            Alex
          </Marker>
          <Marker p={[0.91, 0.5, 2.3]} action={() => interact("word")}>
            + Entrance
          </Marker>
        </>
      )}
    </>
  );
}
const woods = ["#c18e64", "#cba077", "#bc895f", "#c29971", "#d0a47a"];
function Exhibit({ room }: { room: number }) {
  if (room <= 2)
    return (
      <>
        <Box p={[0, 1.24, -0.12]} s={[0.76, 0.51, 0.09]} c={wood} />
        <Label
          p={[0, 1.24, -0.067]}
          w={0.69}
          h={0.44}
          text={room === 1 ? "SCHOOL NEWS" : "ROOMS →"}
          bg="#ece0c7"
          fg={ink}
        />
        <Box p={[0, 0.99, -0.12]} s={[0.09, 0.29, 0.09]} c={ink} />
      </>
    );
  if (room === 3)
    return (
      <>
        <Orb p={[0, 1.23, 0]} s={[0.33, 0.33, 0.33]} c="#4f9db7" detail={2} />
        <Orb p={[0.12, 1.3, 0.25]} s={[0.17, 0.095, 0.06]} c="#8eae64" />
        <Orb p={[-0.12, 1.18, 0.25]} s={[0.09, 0.14, 0.064]} c="#8eae64" />
        <Box p={[0, 0.9, 0]} s={[0.4, 0.1, 0.36]} c={ink} />
      </>
    );
  if (room === 4)
    return (
      <>
        <Box p={[0, 0.88, 0]} s={[0.5, 0.12, 0.41]} c={ink} />
        <Box p={[0.16, 1.1, -0.11]} s={[0.12, 0.42, 0.12]} c="#688d9a" />
        <Box p={[-0.01, 1.2, 0]} s={[0.34, 0.08, 0.26]} c={ink} />
        <mesh position={[-0.07, 1.38, -0.04]} rotation-z={-0.48}>
          <cylinderGeometry args={[0.092, 0.1, 0.39, 16]} />
          <meshStandardMaterial color="#e5dfd3" />
        </mesh>
      </>
    );
  if (room === 5)
    return (
      <>
        <Box p={[0, 1.26, -0.22]} s={[0.76, 0.48, 0.08]} c={ink} />
        <Label
          p={[0, 1.26, -0.171]}
          w={0.67}
          h={0.39}
          text="> hello, school"
          bg="#153a53"
          fg="#85e5d1"
        />
        <Box p={[0, 0.99, -0.22]} s={[0.13, 0.26, 0.09]} c={ink} />
        <Box p={[0, 0.85, 0.2]} s={[0.63, 0.046, 0.24]} c="#344b59" />
      </>
    );
  if (room === 7)
    return (
      <group position={[0, 1.17, 0]} rotation-z={-0.46}>
        <Orb p={[0, 0, 0]} s={[0.2, 0.31, 0.084]} c="#a46a34" detail={2} />
        <Box p={[0, 0.44, 0]} s={[0.075, 0.59, 0.079]} c="#b98444" />
        <Box p={[0, 0.32, 0.049]} s={[0.012, 0.72, 0.012]} c="#e9d7a4" />
        <Orb p={[0, 0.054, 0.083]} s={[0.068, 0.06, 0.013]} c="#573726" />
      </group>
    );
  return (
    <>
      <Box p={[0, 0.915, 0]} s={[0.56, 0.14, 0.39]} c="#925144" />
      <Box p={[0, 0.916, 0.195]} s={[0.54, 0.09, 0.018]} c="#f2e4c4" />
    </>
  );
}
export function Interior({
  room,
  lang,
  go,
  interact,
  markers,
  talking,
  openStory,
  blocked,
}: SceneActions) {
  const studio = room === storytellingRoom;
  const entry = room <= 2,
    color = studio
      ? "#e8dfd3"
      : room === 7
        ? "#927263"
        : room === 6
          ? "#769087"
          : "#659bc1",
    thisRoom = rooms[room];
  const doorXs = links[room].map(
    (_, i) => (i - (links[room].length - 1) / 2) * (room === 2 ? 1.93 : 3),
  );
  const doorZ = entry ? -4.86 : 4.86;
  const title = [
    "",
    "NOTICEBOARD",
    "FIND YOUR CLASS",
    "HELLO, WORLD!",
    "MOTION & MATTER",
    "THINK IN CODE",
    "STORIES & WORDS",
    "HERITAGE OF KAZAKHSTAN",
  ][room];
  return (
    <>
      <color attach="background" args={["#b1cdd9"]} />
      <Box p={[0, -0.12, 0]} s={[14, 0.24, 10]} c="#ba8964" />
      <Planks length={9.93} colors={woods} />
      <Box p={[0, 3.73, 0]} s={[14.25, 0.18, 10.18]} c="#e4e9e5" solid />
      <Box p={[0, 1.82, -5]} s={[14.25, 3.65, 0.24]} c={color} solid />
      <Box p={[0, 1.82, 5]} s={[14.25, 3.65, 0.24]} c={color} solid />
      {[-7, 7].map((x) => (
        <group key={x}>
          <Box p={[x, 1.82, 0]} s={[0.24, 3.65, 10]} c={color} solid />
          <Box p={[x * 0.98, 0.17, 0]} s={[0.1, 0.26, 10]} c="#e5dbcd" />
          {[-2.9, 0, 2.9].map((z) => (
            <group
              key={z}
              position={[x * 0.977, 1.99, z]}
              rotation-y={x > 0 ? -Math.PI / 2 : Math.PI / 2}
            >
              <Box s={[2.06, 1.49, 0.12]} c="#e9e8d9" />
              <Box p={[0, 0, 0.077]} s={[1.88, 1.27, 0.018]} c="#b7dbe4" />
              <Box p={[0, 0, 0.093]} s={[0.065, 1.32, 0.019]} c="#eff0dd" />
              <Box p={[0, -0.78, 0.105]} s={[2.19, 0.1, 0.25]} c="#f4e8d2" />
            </group>
          ))}
        </group>
      ))}
      {[-3, 0, 3].map((x) => (
        <Box key={x} p={[x, 3.59, 0]} s={[1.64, 0.06, 0.38]} c="#fff9df" />
      ))}
      {links[room].map((target, i) => (
        <group
          key={target}
          position={[doorXs[i], 0, doorZ]}
          rotation-y={entry ? 0 : Math.PI}
          onClick={(e) => {
            e.stopPropagation();
            go(target);
          }}
        >
          <Box p={[0, 1.22, 0.03]} s={[1.56, 2.44, 0.14]} c="#e9ddca" />
          <Box p={[0, 1.16, 0.12]} s={[1.36, 2.28, 0.08]} c="#694f41" />
          <Box p={[0, 1.62, 0.171]} s={[0.87, 0.88, 0.026]} c="#557d91" />
          <Box p={[0.51, 1.01, 0.19]} s={[0.17, 0.075, 0.11]} c="#e5af6c" />
          <Label
            p={[0, 2.73, 0.16]}
            w={1.9}
            h={0.37}
            text={
              target === storytellingRoom && lang === "en"
                ? "DIGITAL STORYTELLING\nCLASSROOM"
                : translate(rooms[target].name, lang)
            }
          />
          {markers && (
            <Marker p={[0, 1.28, 0.28]} action={() => go(target)}>
              {translate(rooms[target].name, lang)}
            </Marker>
          )}
        </group>
      ))}
      {studio ? (
        <StoryStudio
          markers={markers}
          talking={talking}
          open={openStory}
          lang={lang}
          blocked={blocked}
        />
      ) : (
        <>
          <Label
            p={[0, entry ? 3.26 : 2.28, -4.84]}
            w={entry ? 4.4 : 5.4}
            h={entry ? 0.43 : 1.42}
            text={title}
            bg={entry ? ink : "#f4eee2"}
            fg={entry ? "#fff" : "#2c5866"}
          />
          {room === 3 && (
            <Label
              p={[-4.55, 2.24, -4.84]}
              w={2.7}
              h={1.4}
              art="map"
              text={"WORLD MAP\nFind Kazakhstan"}
              bg="#267e89"
            />
          )}
          {room === 4 && (
            <Label
              p={[-4.55, 2.24, -4.84]}
              w={2.7}
              h={1.4}
              art="atom"
              text={"PHYSICS\nForce • Energy • Light"}
              bg="#224057"
            />
          )}
          {room === 5 && (
            <Label
              p={[-4.55, 2.24, -4.84]}
              w={2.7}
              h={1.4}
              art="grid"
              text={"COMPUTER SCIENCE\nInput • Process • Output"}
              bg="#2d4772"
            />
          )}
          {room === 7 && (
            <>
              <Flag p={[-4.65, 2.3, -4.81]} />
              <Label
                p={[4.67, 2.24, -4.84]}
                w={2.6}
                h={1.4}
                art="mountain"
                text={"THE KAZAKH STEPPE\nLand & heritage"}
                bg="#554236"
              />
            </>
          )}
          {room === 3 && (
            <>
              <Box p={[0, 1.49, -4.8]} s={[4.9, 0.08, 0.19]} c="#eae1d1" />
              <Box p={[1.7, 1.55, -4.75]} s={[0.24, 0.045, 0.09]} c="#5b837d" />
              <Box
                p={[-4.95, 0.91, -3.2]}
                s={[1.56, 0.14, 0.75]}
                c={wood}
                solid
              />
              <Box p={[-4.95, 0.47, -3.2]} s={[1.44, 0.84, 0.62]} c="#a97850" />
              <Box
                p={[-4.77, 1.01, -3.15]}
                s={[0.46, 0.07, 0.34]}
                c="#567e91"
              />
            </>
          )}
          {room === 4 && (
            <group position={[4.8, 0.82, -3.25]}>
              <Box p={[0, -0.42, 0]} s={[1.45, 0.8, 0.78]} c="#435e6a" solid />
              <Box s={[1.53, 0.1, 0.85]} c="#648b97" />
              <Box p={[0.36, 0.34, 0]} s={[0.055, 0.68, 0.055]} c="#263949" />
              <Box p={[0.08, 0.68, 0]} s={[0.61, 0.06, 0.06]} c="#263949" />
              <Box p={[-0.19, 0.46, 0]} s={[0.022, 0.45, 0.022]} c="#eee6d8" />
              <Orb p={[-0.19, 0.24, 0]} s={[0.12, 0.12, 0.12]} c="#d9a54d" />
            </group>
          )}
          {room === 6 &&
            [-4.5, -2.2, 2.2, 4.5].map((x) => (
              <Shelf key={x} p={[x, 0, -4.58]} />
            ))}
          {!entry &&
            [-3, 3].flatMap((x) =>
              [-0.9, 1.57].map((z) => (
                <group key={x + "," + z}>
                  <Desk p={[x, 0, z]} lab={room === 4 || room === 5} />
                  {room === 5 && (
                    <group position={[x, 0, z]}>
                      <Exhibit room={room} />
                    </group>
                  )}
                  {room === 7 && (
                    <group position={[x, 0, z]}>
                      <Orb p={[0, 1, 0]} s={[0.33, 0.24, 0.25]} c="#bd8048" />
                    </group>
                  )}
                </group>
              )),
            )}
          {entry &&
            [-5.45, 5.45].map((x) => (
              <Box
                key={x}
                p={[x, 0.36, 2.55]}
                s={[1.85, 0.72, 0.75]}
                c={wood}
                solid
              />
            ))}
          <group
            position={[1.7, 0, entry ? -1.4 : -3.13]}
            onClick={(e) => {
              e.stopPropagation();
              interact("word");
            }}
          >
            <Desk p={[0, 0, 0]} lab={room === 4 || room === 5} />
            <Exhibit room={room} />
            {markers && (
              <Marker p={[0, 1.71, 0.2]} action={() => interact("word")}>
                {"+ " + thisRoom.item[0]}
              </Marker>
            )}
          </group>
          <Person
            p={[-1.4, 0, entry ? -1.6 : -3.34]}
            color={thisRoom.color}
            talking={talking}
            onClick={() => interact("guide")}
          />
          {markers && (
            <Marker
              p={[-1.4, 2.02, entry ? -1.6 : -3.34]}
              action={() => interact("guide")}
            >
              {thisRoom.guide}
            </Marker>
          )}
        </>
      )}
    </>
  );
}
