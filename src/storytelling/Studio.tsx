import { useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { SRGBColorSpace, TextureLoader } from "three";
import {
  Box,
  Desk,
  Label,
  Marker,
  Orb,
  Person,
  Shelf,
  type XYZ,
} from "../geometry";
import { translate, type Lang } from "../data";
import { poster, zones, type Zone } from "./content";

const navy = "#172746";
const purple = "#8068b3";
const oak = "#bd946f";
const teacher: XYZ = [0, 0, -3.38];

function Monitor({ p }: { p: XYZ }) {
  return (
    <group position={p}>
      <Box p={[0, 0.12, 0]} s={[0.1, 0.24, 0.12]} c={navy} />
      <Box p={[0, 0.39, 0]} s={[0.8, 0.47, 0.1]} c={navy} />
      <Box p={[0, 0.39, 0.055]} s={[0.71, 0.38, 0.01]} c="#5a5d92" />
      <Box p={[0, 0.015, 0.22]} s={[0.5, 0.035, 0.14]} c="#e1dadd" />
    </group>
  );
}

function StoryPoster() {
  const texture = useLoader(TextureLoader, poster);
  texture.colorSpace = SRGBColorSpace;
  return (
    <mesh position={[-6.72, 2.05, -2.7]} rotation-y={Math.PI / 2}>
      <planeGeometry args={[2.57, 1.597]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export function StoryStudio({
  markers,
  talking,
  open,
  lang,
  blocked,
}: {
  markers: boolean;
  talking: boolean;
  open: (zone: Zone) => void;
  lang: Lang;
  blocked: boolean;
}) {
  const approached = useRef(false);
  useFrame(({ camera }) => {
    const distance = Math.hypot(
      camera.position.x - teacher[0],
      camera.position.z - teacher[2],
    );
    if (distance > 2.5) approached.current = false;
    if (distance < 1.65 && !approached.current && markers && !blocked) {
      approached.current = true;
      open("teacher");
    }
  });
  const activate = (zone: Zone) => (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (zone === "teacher") approached.current = true;
    open(zone);
  };
  const hotspot = (index: number, p: XYZ) => {
    const zone = zones[index];
    return (
      markers && (
        <Marker p={p} action={() => open(zone.id)}>
          {translate(zone.short, lang)}
        </Marker>
      )
    );
  };
  return (
    <>
      <pointLight
        position={[0, 3.2, -3.6]}
        color="#e2d2ff"
        intensity={8}
        distance={11}
      />
      <Box p={[0, 1.76, -4.85]} s={[13.7, 3.51, 0.09]} c={navy} />
      {[-6.3, -5.9, -5.5, 5.5, 5.9, 6.3].map((x) => (
        <Box key={x} p={[x, 1.7, -4.77]} s={[0.18, 3.4, 0.12]} c={oak} />
      ))}
      <Box p={[0, 3.44, -4.74]} s={[10.7, 0.055, 0.17]} c={purple} />
      <Box p={[0, 0.014, -0.9]} s={[5.9, 0.025, 4.5]} c="#6b617b" />
      <group onClick={activate("intro")}>
        <Box p={[-2.75, 2.3, -4.74]} s={[4.38, 1.95, 0.16]} c="#a391c8" />
        <Label
          p={[-2.75, 2.3, -4.63]}
          w={4.18}
          h={1.75}
          text={"DIGITAL STORYTELLING\nWhat Is Digital Storytelling?"}
          bg="#ece7fa"
          fg={navy}
        />
        {hotspot(0, [-2.75, 1.64, -4.46])}
      </group>
      <group onClick={activate("video")}>
        <Box p={[2.75, 2.3, -4.74]} s={[4.38, 1.95, 0.16]} c="#8169b1" />
        <Label
          p={[2.75, 2.3, -4.63]}
          w={4.18}
          h={1.75}
          text={"▶  SCREENING ROOM\nWatch an Example Digital Story"}
          bg="#273456"
          fg="#fff7ee"
        />
        {hotspot(2, [2.75, 1.64, -4.46])}
      </group>
      <Person
        p={teacher}
        color={purple}
        talking={talking}
        onClick={() => {
          approached.current = true;
          open("teacher");
        }}
      />
      {markers && (
        <Marker
          p={[teacher[0], 2.05, teacher[2]]}
          action={() => {
            approached.current = true;
            open("teacher");
          }}
        >
          Ms. Maya
        </Marker>
      )}
      <group position={[-3.9, 0, -0.95]} onClick={activate("steps")}>
        <Desk p={[0, 0, 0]} />
        <Label
          p={[0, 1.65, -0.36]}
          w={1.75}
          h={0.68}
          text={"STORYBOARD\nBeginning • Middle • Ending"}
          bg={navy}
        />
        <Box p={[0, 1.65, -0.44]} s={[1.82, 0.75, 0.1]} c={oak} />
        {hotspot(1, [0, 1.29, 0.25])}
      </group>
      <group position={[3.9, 0, -0.95]} onClick={activate("create")}>
        <Desk p={[0, 0, 0]} />
        <Box p={[-0.4, 1.15, -0.1]} s={[0.08, 0.67, 0.08]} c={navy} />
        <Box p={[-0.4, 1.49, -0.1]} s={[0.42, 0.27, 0.32]} c={navy} />
        <Orb p={[-0.4, 1.49, 0.1]} s={[0.18, 0.18, 0.12]} c="#9993d4" />
        <Box p={[0.42, 1.04, 0.05]} s={[0.05, 0.46, 0.05]} c={navy} />
        <Orb p={[0.42, 1.29, 0.05]} s={[0.12, 0.24, 0.12]} c={purple} />
        {hotspot(3, [0, 1.72, 0.22])}
      </group>
      <group position={[4.3, 0, 1.82]} onClick={activate("submit")}>
        <Desk p={[0, 0, 0]} />
        <Monitor p={[0, 0.83, -0.18]} />
        <Label
          p={[0, 1.55, -0.02]}
          w={1.75}
          h={0.29}
          text="Submit Your Digital Story"
          bg={navy}
        />
        {hotspot(4, [0, 1.14, 0.18])}
      </group>
      <group position={[-4.35, 0, 2.25]} rotation-y={Math.PI}>
        <Shelf p={[0, 0, 0]} />
      </group>
      {[-2.55, 2.15].map((x) => (
        <group key={x} position={[x, 0, 1.45]}>
          <Desk p={[0, 0, 0]} />
          <Monitor p={[0, 0.83, -0.18]} />
        </group>
      ))}
      <Box p={[-6.8, 2.05, -2.7]} s={[0.14, 1.67, 2.64]} c={oak} />
      <Suspense fallback={null}>
        <StoryPoster />
      </Suspense>
      {["SETTING", "CONFLICT", "MESSAGE"].map((name, i) => (
        <Label
          key={name}
          p={[-6.76, 2.12, 1.85 - i * 1.73]}
          w={1.25}
          h={0.59}
          rotation={Math.PI / 2}
          text={name}
          bg={navy}
        />
      ))}
    </>
  );
}
