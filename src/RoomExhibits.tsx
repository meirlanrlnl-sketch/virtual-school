import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Box, Desk, Label, Marker, Orb, Shelf, type XYZ } from "./geometry";

export const themes: Record<
  number,
  { wall: string; accent: string; icon: string; floor: string }
> = {
  3: { wall: "#94afc5", accent: "#2563eb", icon: "⚛", floor: "#cfdae2" },
  4: { wall: "#47505a", accent: "#f97316", icon: "🌋", floor: "#807970" },
  5: { wall: "#243d32", accent: "#b99a62", icon: "📖", floor: "#674735" },
  6: { wall: "#729681", accent: "#65a30d", icon: "🌿", floor: "#b69b73" },
  7: { wall: "#24314b", accent: "#aa7ffa", icon: "🧠", floor: "#405067" },
  9: { wall: "#19374e", accent: "#22d3ee", icon: "AI", floor: "#46576c" },
  10: { wall: "#172554", accent: "#67e8f9", icon: "🪐", floor: "#39425b" },
};
function Turn({
  children,
  speed = 0.15,
  pulse = false,
}: {
  children: ReactNode;
  speed?: number;
  pulse?: boolean;
}) {
  const group = useRef<Group>(null);
  const reduce = useRef(true);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduce.current = query.matches;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useFrame(({ clock }, delta) => {
    if (!group.current || reduce.current) return;
    if (pulse)
      group.current.scale.y = 1 + 0.05 * Math.sin(clock.elapsedTime * speed);
    else group.current.rotation.y += Math.min(delta, 0.1) * speed;
  });
  return <group ref={group}>{children}</group>;
}
function Drum({
  p = [0, 0, 0],
  top,
  bottom,
  h,
  color,
}: {
  p?: XYZ;
  top: number;
  bottom: number;
  h: number;
  color: string;
}) {
  return (
    <mesh position={p}>
      <cylinderGeometry args={[top, bottom, h, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
function Ring({
  radius,
  color,
  tilt = 0,
}: {
  radius: number;
  color: string;
  tilt?: number;
}) {
  return (
    <mesh rotation={[Math.PI / 2, tilt, 0]}>
      <torusGeometry args={[radius, 0.016, 6, 48]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
function Station({
  x,
  z = -1.7,
  title,
  children,
  color,
}: {
  x: number;
  z?: number;
  title: string;
  children: ReactNode;
  color: string;
}) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.42, 0]} s={[2.55, 0.84, 1.35]} c={color} solid />
      <Box p={[0, 0.87, 0]} s={[2.68, 0.09, 1.46]} c="#dee2dc" />
      <Label p={[0, 0.55, 0.686]} w={2.3} h={0.37} text={title} />
      <group position={[0, 0.92, 0]}>{children}</group>
    </group>
  );
}
function Science() {
  return (
    <>
      <Station x={-3.6} title="Microscopy & chemistry" color="#385b87">
        <Drum
          p={[-0.65, 0.09, 0]}
          top={0.31}
          bottom={0.35}
          h={0.18}
          color="#22364a"
        />
        <Box p={[-0.85, 0.41, 0]} s={[0.12, 0.63, 0.16]} c="#94a3b8" />
        <group position={[-0.65, 0.73, 0]} rotation-z={-0.55}>
          <Drum top={0.13} bottom={0.1} h={0.55} color="#22364a" />
        </group>
        {["#22d3ee", "#7177d8", "#37bfa6"].map((c, i) => (
          <group key={c} position={[0.25 + i * 0.27, 0, 0]}>
            <Drum p={[0, 0.15, 0]} top={0.15} bottom={0.21} h={0.3} color={c} />
            <Drum
              p={[0, 0.38, 0]}
              top={0.065}
              bottom={0.065}
              h={0.18}
              color="#bbdee4"
            />
          </group>
        ))}
      </Station>
      <Station x={3.7} title="Atomic structure" color="#385b87">
        <group position={[0, 0.83, 0]}>
          <Turn>
            <Orb p={[0, 0, 0]} s={[0.26, 0.26, 0.26]} c="#f38861" />
            {[0, 1, 2].map((i) => (
              <group key={i} rotation={[0.75, i * 1.05, 0]}>
                <Ring radius={0.78} color="#22d3ee" />
                <Orb p={[0.78, 0, 0]} s={[0.11, 0.11, 0.11]} c="#2563eb" />
              </group>
            ))}
          </Turn>
        </group>
      </Station>
    </>
  );
}
function Disasters() {
  return (
    <>
      <Station x={-3.7} title="Volcano • cross section" color="#544840">
        <Drum p={[0, 0.48, 0]} top={0.2} bottom={1} h={0.96} color="#654636" />
        <Turn pulse speed={1.3}>
          <Drum
            p={[0, 0.98, 0]}
            top={0.18}
            bottom={0.18}
            h={0.09}
            color="#ff7838"
          />
        </Turn>
        <group rotation-x={0.68} position={[0, 0.53, 0.56]}>
          <Box s={[0.13, 1.25, 0.05]} c="#fa671d" />
        </group>
      </Station>
      <Station x={3.7} title="Storm simulation" color="#495665">
        <Turn>
          {Array.from({ length: 9 }, (_, i) => (
            <group
              key={i}
              position={[0.12 * Math.sin(i * 0.55), 0.1 + i * 0.13, 0]}
            >
              <Drum
                top={0.13 + i * 0.063}
                bottom={0.09 + i * 0.063}
                h={0.14}
                color={i % 2 ? "#8596a6" : "#9eacb6"}
              />
            </group>
          ))}
        </Turn>
      </Station>
      <Label
        p={[-5.85, 2.75, -3.5]}
        w={3.4}
        h={1.3}
        text={"Global monitoring network\nWeather • seismic activity"}
        art="map"
      />
    </>
  );
}
function Library() {
  return (
    <>
      {[-5.4, 5.4].map((x) => (
        <group
          key={x}
          position={[x, 0, -1.65]}
          rotation-y={x < 0 ? 0.55 : -0.55}
          scale={[1.2, 1.43, 1]}
        >
          <Shelf p={[0, 0, 0]} />
        </group>
      ))}
      <Box p={[0, 0.023, 0.4]} s={[3.1, 0.02, 4.3]} c="#974e41" />
      <group position={[-3.65, 0, 0.2]}>
        <Desk p={[0, 0, 0]} />
        <Drum
          p={[0.53, 1.05, 0]}
          top={0.04}
          bottom={0.07}
          h={0.53}
          color="#b99a62"
        />
        <Drum
          p={[0.53, 1.4, 0]}
          top={0.16}
          bottom={0.34}
          h={0.27}
          color="#f4dba1"
        />
        {[-1, 1].map((i) => (
          <group
            key={i}
            position={[i * 0.18 - 0.23, 0.85, 0.05]}
            rotation-z={i * 0.13}
          >
            <Box s={[0.36, 0.045, 0.45]} c="#f1e6d2" />
          </group>
        ))}
      </group>
      <Station x={3.6} z={0.35} title="Literary atlas" color="#49352a">
        <group position={[0, 0.61, 0]}>
          <Orb p={[0, 0, 0]} s={[0.48, 0.48, 0.48]} c="#508781" />
          <Ring radius={0.57} color="#b99a62" tilt={1.2} />
        </group>
      </Station>
    </>
  );
}
function Greenhouse() {
  return (
    <>
      {[-1, 1].map((side) => (
        <Station
          key={side}
          x={side * 3.75}
          title={
            side < 0
              ? "Zone A • Organic products"
              : "Zone B • Non-organic products"
          }
          color="#43644b"
        >
          {[-1, 1].map((i) => (
            <Box
              key={i}
              p={[i * 1.17, 0.81, 0]}
              s={[0.05, 1.62, 0.06]}
              c="#758880"
            />
          ))}
          <Box p={[0, 1.65, 0]} s={[2.45, 0.09, 0.52]} c="#e3e9cf" />
          <Label p={[0,1.37,.08]} w={2.2} h={.38}
            text={side < 0 ? "Soil fertility: compost and crop rotation" : "Soil fertility: measured mineral fertilizers"}
            bg="#294936"/>
          <Box p={[0,.21,-.2]} s={[2.19,.05,.06]} c="#395952"/>
          <Turn pulse speed={0.55}>
            {[-0.82, -0.27, 0.27, 0.82].map((x, i) => (
              <group key={x} position={[x, 0, 0]}>
                <Drum
                  p={[0, 0.16, 0]}
                  top={0.22}
                  bottom={0.16}
                  h={0.32}
                  color={side < 0 ? "#a76748" : "#889ca3"}
                />
                <Box p={[0, 0.55, 0]} s={[0.035, 0.57, 0.035]} c="#426827" />
                {[-1, 1].map((d) => (
                  <group
                    key={d}
                    position={[d * 0.11, 0.53 + d * 0.09, 0]}
                    rotation-z={-d * 0.76}
                  >
                    <Orb
                      p={[0, 0, 0]}
                      s={[0.1, 0.23, 0.07]}
                      c={i % 2 ? "#72ae48" : "#448352"}
                    />
                  </group>
                ))}
                <Orb p={[0, 0.82, 0]} s={[0.095, 0.09, 0.095]} c="#df6945" />
              </group>
            ))}
          </Turn>
        </Station>
      ))}
    </>
  );
}
const regions = [
  ["Frontal lobe", "Planning and voluntary movement"],
  ["Parietal lobe", "Touch and spatial awareness"],
  ["Occipital lobe", "Visual processing"],
  ["Temporal lobe", "Hearing and memory"],
];
function Brain() {
  const [region, setRegion] = useState(0);
  return (
    <>
      <Station x={-2.65} title="Brain atlas • select a region" color="#494266">
        <group position={[0, 0.89, 0]}>
          <Turn speed={0.09}>
            {[-1, 1].map((side) => (
              <group key={side}>
                {Array.from({ length: 12 }, (_, i) => {
                  const r = Math.floor(i / 3),
                    z = (r - 1.5) * 0.31;
                  return (
                    <mesh
                      key={i}
                      position={[
                        side * (0.17 + 0.14 * (i % 3)),
                        0.24 * Math.sin(((i % 3) + 1) * 0.94) -
                          0.12 * Math.abs(z),
                        z,
                      ]}
                      scale={[0.28, 0.38, 0.35]}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRegion(
                          r === 3 ? 0 : r === 0 ? 2 : i % 3 === 2 ? 3 : 1,
                        );
                      }}
                    >
                      <icosahedronGeometry args={[1, 2]} />
                      <meshStandardMaterial
                        color={["#f4b3cb", "#c499df", "#acb7ee", "#e8a7ad"][r]}
                      />
                    </mesh>
                  );
                })}
              </group>
            ))}
          </Turn>
        </group>
      </Station>
      <Station x={3.65} title="Neuroscience workstation" color="#494266">
        <Label
          p={[0, 0.63, 0.04]}
          w={2.45}
          h={1.12}
          text={regions[region].join("\n")}
          bg="#233453"
          fg="#b5efff"
        />
        <Marker
          p={[0, 0.05, 0.45]}
          action={() => setRegion((region + 1) % regions.length)}
        >
          Next brain region
        </Marker>
      </Station>
    </>
  );
}
function Robot({ suit = false }: { suit?: boolean }) {
  return (
    <group>
      {[-1, 1].map((i) => (
        <group key={i}>
          <Box p={[i * 0.2, 0.29, 0]} s={[0.21, 0.56, 0.29]} c="#a8bdc7" />
          <group position={[i * 0.48, 0.86, 0]} rotation-z={i * 0.21}>
            <Box s={[0.18, 0.62, 0.23]} c="#c5d3dc" />
          </group>
        </group>
      ))}
      <Box p={[0, 0.84, 0]} s={[0.69, 0.55, 0.42]} c="#e3e9ed" />
      <Orb p={[0, 1.42, 0]} s={[0.34, 0.33, 0.3]} c="#f1f4ef" />
      <Orb
        p={[0, 1.44, 0.19]}
        s={[0.28, 0.17, 0.14]}
        c={suit ? "#aa7936" : "#1f697a"}
      />
    </group>
  );
}
function Tech() {
  return (
    <>
      <Station x={-3.7} title="Robotics • prototype 01" color="#23465c">
        <Robot />
      </Station>
      <Station x={3.7} title="Autonomous flight" color="#23465c">
        <group position={[0, 0.86, 0]}>
          <Turn>
            <Orb p={[0, 0, 0]} s={[0.39, 0.15, 0.27]} c="#44cada" />
            {[-1, 1].flatMap((x) =>
              [-1, 1].map((z) => (
                <group key={x + ":" + z} position={[x * 0.46, 0.04, z * 0.29]}>
                  <Box s={[0.55, 0.07, 0.1]} c="#a9c3cc" />
                  <Ring radius={0.21} color="#37d4f0" />
                </group>
              )),
            )}
          </Turn>
        </group>
      </Station>
    </>
  );
}
function Space() {
  return (
    <>
      <Station x={-3.8} title="Solar system • not to scale" color="#334363">
        <group position={[0, 0.52, 0]} rotation-x={0.32}>
          <Orb p={[0, 0, 0]} s={[0.16, 0.16, 0.16]} c="#ffd179" />
          {[
            "#999999",
            "#e5ad73",
            "#529fc4",
            "#cc694a",
            "#d9ba91",
            "#cfad75",
            "#85cfce",
            "#778ccd",
          ].map((c, i) => (
            <group key={c}>
              <Ring radius={0.27 + i * 0.133} color="#73899a" />
              <Turn speed={0.22 / (1 + i * 0.27)}>
                <group rotation-y={i * 2.3}>
                  <Orb
                    p={[0.27 + i * 0.133, 0, 0]}
                    s={i === 4 ? [0.11, 0.11, 0.11] : [0.067, 0.067, 0.067]}
                    c={c}
                  />
                </group>
              </Turn>
            </group>
          ))}
        </group>
      </Station>
      <Station x={4.4} z={1.75} title="Launch vehicle" color="#334363">
        <Drum
          p={[0, 0.52, 0]}
          top={0.19}
          bottom={0.19}
          h={1.04}
          color="#d6dfed"
        />
        <Drum
          p={[0, 1.24, 0]}
          top={0.015}
          bottom={0.19}
          h={0.4}
          color="#b25846"
        />
        {[-1, 1].map((i) => (
          <Drum
            key={i}
            p={[i * 0.24, 0.32, 0]}
            top={0.09}
            bottom={0.12}
            h={0.64}
            color="#e6ac74"
          />
        ))}
      </Station>
      <Station x={3.7} title="Extravehicular suit" color="#334363">
        <Robot suit />
      </Station>
    </>
  );
}
function SideCollection({ room }: { room: number }) {
  if (room === 3)
    return (
      <Station x={-4.5} z={1.55} title="Specimen cabinet" color="#455d73">
        <Box p={[0, 0.68, -0.45]} s={[2.42, 1.36, 0.11]} c="#718a9c" />
        {[0, 0.67, 1.35].map((y, i) => (
          <group key={y}>
            <Box p={[0, y, 0]} s={[2.4, 0.045, 0.9]} c="#d9e5e7" />
            {i < 2 &&
              [-0.82, -0.27, 0.27, 0.82].map((x, j) => (
                <group key={x} position={[x, y + 0.25, 0]}>
                  <Drum
                    top={0.15}
                    bottom={0.15}
                    h={0.42}
                    color={["#9bd8d3", "#aabbd8", "#c9ac94", "#9ebda1"][j]}
                  />
                  <Drum
                    p={[0, 0.22, 0]}
                    top={0.16}
                    bottom={0.16}
                    h={0.04}
                    color="#3d5366"
                  />
                </group>
              ))}
          </group>
        ))}
        <mesh position={[0, 0.69, 0.48]}>
          <planeGeometry args={[2.41, 1.34]} />
          <meshStandardMaterial
            transparent
            opacity={0.12}
            color="#b8e6f9"
            depthWrite={false}
          />
        </mesh>
      </Station>
    );
  if (room === 4)
    return (
      <Station
        x={3.9}
        z={1.55}
        title="Weather station • wind speed"
        color="#4f5356"
      >
        <Drum
          p={[0, 0.59, 0]}
          top={0.035}
          bottom={0.055}
          h={1.18}
          color="#b7bbc2"
        />
        <group position={[0, 1.19, 0]}>
          <Turn speed={0.8}>
            {[0, 1, 2].map((i) => (
              <group key={i} rotation-y={(i * Math.PI * 2) / 3}>
                <Box p={[0.32, 0, 0]} s={[0.64, 0.04, 0.04]} c="#b9c6cb" />
                <Orb p={[0.64, 0, 0]} s={[0.15, 0.1, 0.15]} c="#e5a167" />
              </group>
            ))}
          </Turn>
        </group>
      </Station>
    );
  if (room === 7)
    return (
      <Station x={-4.3} z={1.5} title="Signal transmission" color="#534872">
        <Orb p={[-0.66, 0.53, 0]} s={[0.25, 0.27, 0.21]} c="#c690db" />
        {[-1, 0, 1].map((i) => (
          <group
            key={i}
            position={[-0.9, 0.55 + i * 0.18, 0]}
            rotation-z={i * 0.51}
          >
            <Box s={[0.52, 0.039, 0.05]} c="#bd93d9" />
          </group>
        ))}
        <Box p={[0.35, 0.53, 0]} s={[1.5, 0.055, 0.05]} c="#72d0e2" />
        {[0, 1, 2, 3].map((i) => (
          <Orb
            key={i}
            p={[i * 0.28, 0.53, 0]}
            s={[0.11, 0.1, 0.1]}
            c="#b0d4e0"
          />
        ))}
        <Label
          p={[0, 0.23, 0.54]}
          w={2.25}
          h={0.26}
          text="Dendrites → cell body → axon"
        />
      </Station>
    );
  if (room === 10)
    return (
      <group position={[-4.9, 0, 1.3]}>
        <Drum
          p={[0, 0.13, 0]}
          top={0.5}
          bottom={0.63}
          h={0.26}
          color="#5c7284"
        />
        <Drum
          p={[0, 0.69, 0]}
          top={0.08}
          bottom={0.11}
          h={0.98}
          color="#aab6be"
        />
        <group position={[0, 1.43, 0]} rotation-z={-0.98}>
          <Drum top={0.26} bottom={0.15} h={1.3} color="#e7e8df" />
          <Drum
            p={[0, 0.67, 0]}
            top={0.23}
            bottom={0.23}
            h={0.045}
            color="#538ba6"
          />
        </group>
        <group position={[8.6, 2.7, -0.8]}>
          <Turn>
            <Box s={[0.41, 0.36, 0.32]} c="#b7a27a" />
            {[-1, 1].map((i) => (
              <Box
                key={i}
                p={[i * 0.65, 0, 0]}
                s={[0.83, 0.055, 0.46]}
                c="#466da7"
              />
            ))}
          </Turn>
        </group>
      </group>
    );
  if (room === 5)
    return (
      <group position={[3.6, 0, 1.9]}>
        <Box p={[0, 0.45, 0]} s={[0.95, 0.35, 0.8]} c="#59664e" solid />
        <Box p={[0, 0.89, 0.33]} s={[0.98, 0.8, 0.19]} c="#485940" />
        {[-1, 1].map((i) => (
          <Box
            key={i}
            p={[i * 0.46, 0.65, 0]}
            s={[0.14, 0.24, 0.8]}
            c="#906d49"
          />
        ))}
      </group>
    );
  if (room === 6)
    return (
      <group position={[-4.6, 0, 1.65]}>
        {["Glass", "Paper", "Metal"].map((name, i) => (
          <group key={name} position={[i * 0.66, 0, 0]}>
            <Box
              p={[0, 0.38, 0]}
              s={[0.58, 0.76, 0.55]}
              c={["#488269", "#657d9a", "#9b8054"][i]}
              solid
            />
            <Label p={[0, 0.46, 0.283]} w={0.5} h={0.23} text={name} />
          </group>
        ))}
      </group>
    );
  if (room === 9)
    return (
      <Station x={-4.1} z={1.35} title="Robotic manipulator" color="#254254">
        <Drum
          p={[0, 0.09, 0]}
          top={0.34}
          bottom={0.4}
          h={0.18}
          color="#7993a0"
        />
        <Turn speed={0.12}>
          <group rotation-z={-0.32} position={[0, 0.52, 0]}>
            <Box s={[0.21, 0.77, 0.23]} c="#c29c63" />
            <Orb p={[0, 0.39, 0]} s={[0.17, 0.17, 0.17]} c="#3794ac" />
            <group position={[0.29, 0.51, 0]} rotation-z={-0.97}>
              <Box s={[0.15, 0.7, 0.16]} c="#dab679" />
            </group>
            <Box p={[0.6, 0.65, 0]} s={[0.13, 0.26, 0.16]} c="#7596a7" />
          </group>
        </Turn>
      </Station>
    );
  return null;
}
const exhibits: Record<number, () => ReactNode> = {
  3: Science,
  4: Disasters,
  5: Library,
  6: Greenhouse,
  7: Brain,
  9: Tech,
  10: Space,
};
export function RoomExhibits({ room }: { room: number }) {
  const Exhibit = exhibits[room];
  return Exhibit ? (
    <>
      <Exhibit />
      <SideCollection room={room} />
    </>
  ) : null;
}
