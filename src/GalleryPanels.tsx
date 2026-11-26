import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";

const captions: Record<number, string[][]> = {
  3: [
    ["Periodic table • periods 1–4", "Elements in order of atomic number"],
    [
      "Laboratory glassware",
      "Graduated cylinder     |     Beaker     |     Conical flask",
    ],
  ],
  4: [
    ["Seismic monitoring", "Ground motion over time • illustrative trace"],
    ["Tsunami research", "Wave propagation across the ocean • schematic"],
  ],
  5: [
    [
      "The story arc",
      "Exposition     •     Rising action     •     Climax     •     Resolution",
    ],
    [
      "Storyboard workshop",
      "Frame a setting     •     Introduce a character     •     Reveal a choice",
    ],
  ],
  6: [
    ["Root observation", "Water and dissolved nutrients reach the roots"],
    [
      "Compost cycle",
      "Plant material     •     Decomposition     •     Soil amendment",
    ],
  ],
  7: [
    ["Neural pathways", "Dendrites receive signals • axons carry signals away"],
    [
      "Sensory pathways",
      "Receptors     •     Sensory nerves     •     Central nervous system",
    ],
  ],
  9: [
    [
      "Machine vision",
      "Input image     •     Feature extraction     •     Classification",
    ],
    ["Prototype assembly", "Manipulator joints • position and orientation"],
  ],
  10: [
    ["Observation deck", "Deep sky field"],
    ["Lunar observation", "Moon phases as seen from Earth"],
  ],
};
function panelTexture(room: number, side: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 384;
  const g = canvas.getContext("2d")!;
  const [title, caption] = captions[room][side];
  g.fillStyle = room === 5 ? "#342b25" : room === 6 ? "#203b31" : "#101e30";
  g.fillRect(0, 0, 960, 384);
  const line = (points: number[][], color: string, width = 3) => {
    g.beginPath();
    points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = color;
    g.lineWidth = width;
    g.stroke();
  };
  const dot = (x: number, y: number, r: number, color: string) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
  };
  const mint = "#85daca",
    gold = "#e6b66e";
  if (room === 3 && !side) {
    const rows = [
      "H                He",
      "Li Be          B C N O F Ne",
      "Na Mg          Al Si P S Cl Ar",
      "K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr",
    ];
    rows.forEach((row, y) => {
      const symbols = row.split(/\s+/);
      symbols.forEach((symbol, i) => {
        const col =
          symbols.length === 18 || i < (y === 0 ? 1 : 2)
            ? i
            : 18 - symbols.length + i;
        const x = 45 + col * 49,
          top = 85 + y * 50;
        g.fillStyle = col < 2 ? "#3d7084" : col > 11 ? "#426d65" : "#505e86";
        g.fillRect(x, top, 46, 47);
        g.fillStyle = "#fff";
        g.font = "bold 20px system-ui";
        g.textAlign = "center";
        g.fillText(symbol, x + 23, top + 30);
      });
    });
  } else if (room === 3) {
    [
      [230, 24, 35],
      [470, 66, 67],
      [725, 22, 86],
    ].forEach(([x, neck, base]) => {
      line(
        [
          [x - neck, 105],
          [x - neck, 165],
          [x - base, 262],
          [x + base, 262],
          [x + neck, 165],
          [x + neck, 105],
        ],
        mint,
        6,
      );
      line(
        [
          [x - base * 0.8, 232],
          [x + base * 0.8, 232],
        ],
        "#58bfe6",
        9,
      );
    });
  } else if (room === 4) {
    for (let x = 40; x < 920; x += 40)
      line(
        [
          [x, 100],
          [x, 278],
        ],
        "#293a49",
        1,
      );
    for (let j = 0; j < (side ? 4 : 1); j++)
      line(
        Array.from({ length: 390 }, (_, i) => [
          48 + i * 2.22,
          190 +
            j * 14 +
            Math.sin(i * (side ? 0.035 : 0.75)) *
              Math.exp(-Math.pow((i - 220) / (side ? 120 : 54), 2)) *
              85,
        ]),
        side ? mint : gold,
        3,
      );
  } else if (room === 5) {
    for (let i = 0; i < 4; i++) {
      const x = 65 + i * 216,
        y = side ? 135 : 190 - [0, 35, 82, 8][i];
      g.strokeStyle = gold;
      g.strokeRect(x, 90, 177, 195);
      line(
        [
          [x + 12, 240],
          [x + 55, y],
          [x + 93, y + 25],
          [x + 136, y - 18],
          [x + 165, 235],
        ],
        "#a5b79a",
        4,
      );
      dot(x + 120, 126, 12, gold);
    }
  } else if (room === 6) {
    for (let i = 0; i < 5; i++) {
      const x = 110 + i * 183;
      line(
        [
          [x, 210],
          [x, 102 + (i % 2) * 18],
        ],
        mint,
        5,
      );
      for (let k = 0; k < 6; k++) {
        const d = k % 2 ? 1 : -1;
        line(
          [
            [x, 170 - k * 9],
            [x + d * (20 + k * 3), 146 - k * 8],
          ],
          "#9bc078",
          7,
        );
        line(
          [
            [x, 208],
            [x + d * (10 + k * 3), 230 + k * 5],
            [x + d * (22 + k * 3), 252 + k * 4],
          ],
          gold,
          2,
        );
      }
    }
    line(
      [
        [45, 206],
        [920, 206],
      ],
      "#a78262",
    );
  } else if (room === 7 || room === 9) {
    const points = Array.from({ length: 18 }, (_, i) => [
      95 + Math.floor(i / 3) * 154 + (room === 7 ? Math.sin(i) * 26 : 0),
      113 + (i % 3) * 63 + Math.cos(i) * 12,
    ]);
    points.forEach((p, i) => {
      if (i < 15) {
        line([p, points[i + 3]], mint);
        if (i % 3 !== 2) line([p, points[i + 4]], "#71669e", 2);
      }
    });
    points.forEach(([x, y], i) =>
      dot(x, y, room === 7 ? 7 + (i % 5) : 9, i % 3 ? mint : gold),
    );
  } else {
    for (let i = 0; i < 170; i++)
      dot(
        25 + ((i * 137.3) % 907),
        85 + ((i * i * 17.3) % 205),
        i % 7 === 0 ? 2 : 1,
        "#d4e5ff",
      );
    if (side)
      for (let i = 0; i < 7; i++) {
        const x = 110 + i * 121;
        dot(x, 186, 36, "#d3cfb6");
        if (i !== 3) {
          g.save();
          g.beginPath();
          g.arc(x, 186, 36, 0, 7);
          g.clip();
          dot(x + (i - 3) * 13, 186, 36, "#303447");
          g.restore();
        }
      }
  }
  g.textAlign = "left";
  g.fillStyle = "#f1f6fa";
  g.font = "bold 35px system-ui";
  g.fillText(title, 35, 51);
  g.fillStyle = "#cbd8df";
  g.font = "22px system-ui";
  g.fillText(caption, 35, 347, 890);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
export function GalleryPanel({ room, side }: { room: number; side: 0 | 1 }) {
  const texture = useMemo(() => panelTexture(room, side), [room, side]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh
      position={[side ? 6.75 : -6.75, 2.18, 0.36]}
      rotation-y={side ? -Math.PI / 2 : Math.PI / 2}
    >
      <planeGeometry args={[4.6, 1.84]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function SpaceWindow() {
  const stars = useMemo(() => {
    const positions = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      positions[3 * i] = 1.85 * (((i * 137.317) % 97) / 97 - 0.5);
      positions[3 * i + 1] = 1.23 * (((i * i * 3.71) % 83) / 83 - 0.5);
    }
    return positions;
  }, []);
  return (
    <points position={[0, 0, 0.09]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[stars, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.016} color="#f8faff" />
    </points>
  );
}
