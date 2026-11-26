import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider } from "@react-three/rapier";
import {
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  SRGBColorSpace,
} from "three";
export type XYZ = [number, number, number];
export const wood = "#b57c4c";
export const ink = "#183343";
export function Box({
  p = [0, 0, 0],
  s,
  c,
  solid = false,
  children,
}: {
  p?: XYZ;
  s: XYZ;
  c: string;
  solid?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      <mesh position={p} castShadow receiveShadow>
        <boxGeometry args={s} />
        <meshStandardMaterial color={c} />
        {children}
      </mesh>
      {solid && (
        <CuboidCollider position={p} args={[s[0] / 2, s[1] / 2, s[2] / 2]} />
      )}
    </>
  );
}
export function Planks({
  length,
  colors,
}: {
  length: number;
  colors: string[];
}) {
  const planks = useRef<InstancedMesh>(null!);
  useLayoutEffect(() => {
    const matrix = new Matrix4();
    for (let i = 0; i < 29; i++) {
      matrix.makeTranslation((i - 14) * 0.475, 0.003, 0);
      planks.current.setMatrixAt(i, matrix);
      planks.current.setColorAt(i, new Color(colors[(i * 7) % colors.length]));
    }
    planks.current.instanceMatrix.needsUpdate = true;
    planks.current.computeBoundingSphere();
  }, [colors]);
  return (
    <instancedMesh ref={planks} args={[undefined, undefined, 29]} receiveShadow>
      <boxGeometry args={[0.468, 0.017, length]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
export function Orb({
  p,
  s,
  c,
  detail = 1,
}: {
  p: XYZ;
  s: XYZ;
  c: string;
  detail?: number;
}) {
  return (
    <mesh position={p} scale={s} castShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={c} />
    </mesh>
  );
}
export function Label({
  p,
  w,
  h,
  text,
  art,
  bg = ink,
  fg = "#fff",
  rotation = 0,
}: {
  p: XYZ;
  w: number;
  h: number;
  text: string;
  art?: "map" | "atom" | "grid" | "mountain";
  bg?: string;
  fg?: string;
  rotation?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = Math.max(64, Math.round((768 * h) / w));
    const g = canvas.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const lines = text.split("\n");
    const size = art
      ? Math.min(canvas.height * 0.13, 62)
      : Math.min(canvas.height / (lines.length * 1.55), 110);
    g.font = "700 " + size + "px system-ui";
    lines.forEach((line, i) =>
      g.fillText(
        line,
        384,
        art
          ? canvas.height * (i === 0 ? 0.16 : 0.87)
          : canvas.height / 2 + (i - (lines.length - 1) / 2) * size * 1.2,
        680,
      ),
    );
    if (art) {
      g.save();
      g.translate(384, canvas.height * 0.53);
      g.scale(2, canvas.height / 135);
      g.fillStyle = "#8ccab9";
      g.strokeStyle = "#b4e8da";
      g.lineWidth = 1.6;
      const polygon = (coordinates: number[][]) => {
        g.beginPath();
        coordinates.forEach(([x, y], i) =>
          i === 0 ? g.moveTo(x, y) : g.lineTo(x, y),
        );
        g.closePath();
        g.fill();
      };
      if (art === "map") {
        polygon([
          [-133, -17],
          [-116, -31],
          [-93, -33],
          [-75, -24],
          [-82, -12],
          [-96, -8],
          [-94, 5],
          [-108, -4],
          [-124, -8],
        ]);
        polygon([
          [-92, 4],
          [-70, 8],
          [-58, 18],
          [-71, 36],
          [-79, 39],
          [-86, 19],
        ]);
        polygon([
          [-30, -18],
          [-3, -29],
          [37, -29],
          [72, -34],
          [121, -24],
          [102, -7],
          [80, -6],
          [64, 10],
          [48, -3],
          [34, 16],
          [23, 5],
          [3, -10],
          [-19, -5],
        ]);
        polygon([
          [-21, 0],
          [6, -2],
          [25, 11],
          [14, 29],
          [1, 33],
          [-11, 22],
        ]);
        polygon([
          [72, 25],
          [93, 16],
          [113, 23],
          [109, 34],
          [82, 34],
        ]);
        g.fillStyle = "#ffe298";
        g.beginPath();
        g.arc(47, -17, 3.2, 0, Math.PI * 2);
        g.fill();
      }
      if (art === "atom") {
        [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((a) => {
          g.beginPath();
          g.ellipse(0, 0, 35, 12, a, 0, Math.PI * 2);
          g.stroke();
        });
        g.beginPath();
        g.arc(0, 0, 5, 0, Math.PI * 2);
        g.fill();
      }
      if (art === "grid") {
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 8; j++) {
            g.fillStyle = (i + j) % 3 === 0 ? "#d9edab" : "#68aeb7";
            g.fillRect(-68 + j * 18, -28 + i * 15, 12, 9);
          }
      }
      if (art === "mountain") {
        polygon([
          [-117, 34],
          [-75, -19],
          [-46, 9],
          [-12, -31],
          [37, 26],
          [64, -15],
          [101, 34],
        ]);
        g.fillStyle = "#e6d7ac";
        polygon([
          [-33, -5],
          [-12, -31],
          [12, -2],
          [-7, -9],
          [-13, 0],
          [-20, -10],
        ]);
      }
      g.restore();
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, [w, h, text, bg, fg, art]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={p} rotation-y={rotation}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
export function Person({
  p,
  color,
  talking = false,
  onClick,
}: {
  p: XYZ;
  color: string;
  talking?: boolean;
  onClick: () => void;
}) {
  const body = useRef<Group>(null!),
    arm = useRef<Group>(null!),
    gait = useRef<Group>(null!),
    mouth = useRef<Group>(null!);
  const skin = "#ca8b69";
  useFrame(({ clock }) => {
    const t = clock.elapsedTime,
      walking = Math.sin(t * 0.55) > 0.87;
    body.current.position.x = walking ? Math.sin(t * 2) * 0.12 : 0;
    body.current.position.y = Math.sin(t * 2) * 0.012;
    arm.current.rotation.z = talking
      ? -0.7 + Math.sin(t * 5) * 0.18
      : Math.sin(t * 0.8) > 0.35
        ? -2.5 + Math.sin(t * 8) * 0.24
        : -0.18;
    gait.current.rotation.x = walking ? Math.sin(t * 8) * 0.14 : 0;
    mouth.current.scale.y = talking ? 0.55 + Math.abs(Math.sin(t * 10)) : 0.5;
  });
  return (
    <group
      position={p}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <group ref={body}>
        <Orb p={[0, 1.06, 0]} s={[0.28, 0.41, 0.17]} c={color} detail={2} />
        <Orb p={[0, 1.55, 0]} s={[0.18, 0.23, 0.17]} c={skin} detail={2} />
        <Orb
          p={[0, 1.69, -0.025]}
          s={[0.186, 0.13, 0.17]}
          c="#272b2d"
          detail={2}
        />
        <Orb
          p={[0.079, 1.702, 0.096]}
          s={[0.12, 0.057, 0.09]}
          c="#272b2d"
          detail={2}
        />
        {[-1, 1].map((sign) => (
          <group key={sign}>
            <Orb
              p={[sign * 0.174, 1.54, -0.008]}
              s={[0.035, 0.052, 0.04]}
              c={skin}
            />
            <Orb
              p={[sign * 0.069, 1.573, 0.149]}
              s={[0.038, 0.023, 0.019]}
              c="#fff4e8"
            />
            <Orb
              p={[sign * 0.064, 1.572, 0.165]}
              s={[0.012, 0.014, 0.008]}
              c="#25262b"
            />
            <Orb
              p={[sign * 0.071, 1.608, 0.151]}
              s={[0.035, 0.008, 0.009]}
              c="#352929"
            />
          </group>
        ))}
        <Orb p={[0, 1.53, 0.165]} s={[0.03, 0.041, 0.044]} c={skin} />
        <group ref={mouth} position={[0, 1.468, 0.157]}>
          <Orb p={[0, 0, 0]} s={[0.054, 0.023, 0.012]} c="#743b37" />
        </group>
        <Orb p={[0, 1.31, 0.13]} s={[0.087, 0.086, 0.025]} c="#f4ede1" />
        <group position={[-0.24, 1.25, 0]} rotation-z={-0.12}>
          <Orb p={[0, -0.17, 0]} s={[0.091, 0.235, 0.095]} c={color} />
          <Orb p={[0, -0.38, 0]} s={[0.07, 0.1, 0.071]} c={skin} />
        </group>
        <group ref={arm} position={[0.24, 1.25, 0]}>
          <Orb p={[0, -0.17, 0]} s={[0.091, 0.235, 0.095]} c={color} />
          <Orb p={[0, -0.38, 0]} s={[0.07, 0.1, 0.071]} c={skin} />
        </group>
        <group ref={gait} position={[0.118, 0.7, 0]}>
          <Orb p={[0, -0.28, 0]} s={[0.113, 0.35, 0.105]} c={ink} />
          <Orb p={[0, -0.63, 0.054]} s={[0.112, 0.07, 0.157]} c="#263139" />
        </group>
        <Orb p={[-0.118, 0.42, 0]} s={[0.113, 0.35, 0.105]} c={ink} />
        <Orb p={[-0.118, 0.07, 0.054]} s={[0.112, 0.07, 0.157]} c="#263139" />
      </group>
    </group>
  );
}
export function Flag({ p, w = 2 }: { p: XYZ; w?: number }) {
  return (
    <group position={p} scale={w / 2}>
      <Box s={[2, 1, 0.025]} c="#16afca" />
      <Orb
        p={[0.13, 0.1, 0.03]}
        s={[0.17, 0.17, 0.025]}
        c="#ffd75e"
        detail={2}
      />
      {Array.from({ length: 16 }, (_, i) => (
        <Orb
          key={i}
          p={[
            0.13 + Math.cos((i * Math.PI) / 8) * 0.218,
            0.1 + Math.sin((i * Math.PI) / 8) * 0.218,
            0.03,
          ]}
          s={[0.019, 0.019, 0.016]}
          c="#ffd75e"
        />
      ))}
      <Orb p={[0.13, -0.23, 0.031]} s={[0.24, 0.04, 0.02]} c="#ffd75e" />
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.8, -0.38 + i * 0.108, 0.028]}
          rotation-z={Math.PI / 4}
        >
          <boxGeometry args={[0.066, 0.066, 0.012]} />
          <meshBasicMaterial color="#ffd75e" />
        </mesh>
      ))}
    </group>
  );
}

export function Marker({
  p,
  children,
  action,
  label,
}: {
  p: XYZ;
  children: string;
  action: () => void;
  label?: string;
}) {
  return (
    <Html position={p} center occlude>
      <button className="marker" onClick={action} aria-label={label} title={label}>
        {children}
      </button>
    </Html>
  );
}

export function Desk({ p, lab = false }: { p: XYZ; lab?: boolean }) {
  return (
    <group position={p}>
      <Box
        p={[0, 0.76, 0]}
        s={[1.58, 0.12, 0.79]}
        c={lab ? "#506d7b" : "#d2a16e"}
        solid
      />
      {[-0.68, 0.68].map((x) => (
        <Box
          key={x}
          p={[x, 0.37, 0]}
          s={[0.095, 0.73, 0.64]}
          c={lab ? "#344959" : "#78898a"}
        />
      ))}
      <Box p={[0, 0.43, 0.77]} s={[0.53, 0.11, 0.52]} c={wood} solid />
      <Box p={[0, 0.71, 0.99]} s={[0.53, 0.47, 0.1]} c={wood} />
      {[-0.21, 0.21].map((x) => (
        <Box key={x} p={[x, 0.22, 0.77]} s={[0.06, 0.43, 0.43]} c="#6d8187" />
      ))}
    </group>
  );
}
export function Shelf({ p }: { p: XYZ }) {
  return (
    <group position={p}>
      <Box p={[0, 1.14, 0]} s={[2.21, 2.3, 0.44]} c="#795b48" solid />
      {[0.25, 0.82, 1.39, 1.96].map((y, row) => (
        <group key={y}>
          <Box p={[0, y, 0.2]} s={[2.25, 0.075, 0.47]} c={wood} />
          {Array.from({ length: 11 }, (_, i) => (
            <Box
              key={i}
              p={[(i - 5) * 0.181, y + 0.2, 0.33]}
              s={[0.145, 0.29 + (i % 3) * 0.07, 0.18]}
              c={
                ["#c79c67", "#437677", "#b06351", "#d7c8a3", "#537796"][
                  (i + row * 2) % 5
                ]
              }
            />
          ))}
        </group>
      ))}
    </group>
  );
}
