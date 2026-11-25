import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Html, useGLTF, useTexture } from "@react-three/drei";
import {
  CapsuleCollider,
  Physics,
  useRapier,
  type RapierCollider,
} from "@react-three/rapier";
import {
  BackSide,
  Euler,
  MathUtils,
  PerspectiveCamera,
  SRGBColorSpace,
  Vector3,
} from "three";
import { Courtyard, Interior, type SceneActions } from "./Campus";
import { storytellingRoom } from "./data";
import { panoramas } from "./panoramas";

export type Mode = "tour" | "free" | "panorama";
export type Motion = { x: number; y: number };
export type WorldProps = SceneActions & {
  menu: boolean;
  mode: Mode;
  low: boolean;
  blocked: boolean;
  joystick: MutableRefObject<Motion>;
  pano: number;
  selectPano: (index: number) => void;
  information: (text: string) => void;
};
const spawn = (room: number) =>
  room === 0 ? new Vector3(0, 1.65, 10.7) : new Vector3(0, 1.65, 3.8);

function CameraRig({ room, menu, mode, blocked, joystick, pano }: WorldProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const canvas = useThree((s) => s.gl.domElement);
  const { world } = useRapier();
  const controller = useMemo(
    () => world.createCharacterController(0.035),
    [world],
  );
  useEffect(
    () => () => world.removeCharacterController(controller),
    [world, controller],
  );
  const collider = useRef<RapierCollider>(null!);
  const position = useRef(spawn(room)),
    look = useRef({ yaw: 0, pitch: 0 }),
    keys = useRef(new Set<string>());
  const movement = useMemo(() => new Vector3(), []),
    velocity = useMemo(() => new Vector3(), []);
  const euler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const activePanorama = mode === "panorama" && panoramas.length > 0;
  const zoom = useRef(62);
  useEffect(() => {
    position.current.copy(spawn(room));
    velocity.set(0, 0, 0);
    look.current = { yaw: 0, pitch: 0 };
    zoom.current = 62;
    if (activePanorama) camera.position.set(0, 0, 0);
    else if (!menu) {
      camera.position
        .copy(position.current)
        .add(new Vector3(0, 0.18, mode === "tour" ? 1.05 : 0.25));
      camera.rotation.set(0, 0, 0);
    }
  }, [room, menu, mode, velocity, camera, activePanorama, pano]);
  useEffect(() => {
    if (blocked || menu) return;
    const pointers = new Map<number, { x: number; y: number }>();
    const distance = () => {
      const [a, b] = pointers.values();
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };
    const down = (e: PointerEvent) => {
      if (e.button === 0)
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const move = (e: PointerEvent) => {
      const previous = pointers.get(e.pointerId);
      if (!previous) return;
      const before = distance();
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePanorama && before > 0) {
        zoom.current = MathUtils.clamp(
          zoom.current - (distance() - before) * 0.17,
          28,
          88,
        );
        return;
      }
      look.current.yaw += (previous.x - e.clientX) * 0.004;
      look.current.pitch = MathUtils.clamp(
        look.current.pitch + (e.clientY - previous.y) * 0.004,
        -1.45,
        1.45,
      );
    };
    const up = (e: PointerEvent) => pointers.delete(e.pointerId);
    const keyDown = (e: KeyboardEvent) => {
      if (mode !== "free" || e.target instanceof HTMLSelectElement) return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
        keys.current.add(e.code);
      }
    };
    const keyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
    };
    const blur = () => {
      keys.current.clear();
      pointers.clear();
    };
    const wheel = (e: WheelEvent) => {
      if (activePanorama) {
        e.preventDefault();
        zoom.current = MathUtils.clamp(zoom.current + e.deltaY * 0.04, 28, 88);
      }
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", blur);
    return () => {
      blur();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("wheel", wheel);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", blur);
    };
  }, [canvas, menu, blocked, activePanorama, mode]);
  useFrame(({ clock, size }, dt) => {
    const t = clock.elapsedTime,
      delta = Math.min(dt, 0.05);
    const aspect = size.width / size.height;
    let fov = zoom.current;
    if (menu) fov = aspect < 1 ? 59 : 48;
    else if (room === storytellingRoom && !activePanorama) {
      // Preserve a view of both screens when the viewport is narrow.
      fov = Math.min(
        104,
        Math.max(66, MathUtils.radToDeg(2 * Math.atan(0.55 / aspect))),
      );
    }
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov = MathUtils.damp(camera.fov, fov, 12, delta);
      camera.updateProjectionMatrix();
    }
    if (menu) {
      const narrow = size.width / size.height < 1;
      camera.position.set(
        (narrow ? -9 : -17) + Math.sin(t * 0.32) * 0.62,
        narrow ? 8.3 : 8.9,
        narrow ? 24 : 23.6,
      );
      camera.lookAt(narrow ? -0.3 : -5.9, narrow ? 2.7 : 2.5, -0.7);
      return;
    }
    euler.set(look.current.pitch, look.current.yaw, 0);
    camera.quaternion.setFromEuler(euler);
    if (activePanorama) {
      camera.position.set(0, 0, 0);
      return;
    }
    if (mode === "free" && !blocked && collider.current) {
      const held = (a: string, b: string) =>
        Number(keys.current.has(a) || keys.current.has(b));
      movement.set(
        held("KeyD", "ArrowRight") -
          held("KeyA", "ArrowLeft") +
          joystick.current.x,
        0,
        held("KeyS", "ArrowDown") -
          held("KeyW", "ArrowUp") +
          joystick.current.y,
      );
      if (movement.lengthSq() > 1) movement.normalize();
      movement.applyAxisAngle(camera.up, look.current.yaw).multiplyScalar(3.65);
      velocity.lerp(movement, 1 - Math.exp(-delta * 13));
      collider.current.setTranslation({
        x: position.current.x,
        y: 0.9,
        z: position.current.z,
      });
      world.propagateModifiedBodyPositionsToColliders();
      controller.computeColliderMovement(collider.current, {
        x: velocity.x * delta,
        y: 0,
        z: velocity.z * delta,
      });
      const next = controller.computedMovement();
      position.current.x += next.x;
      position.current.z += next.z;
      if (room === 0) {
        position.current.x = MathUtils.clamp(position.current.x, -36, 36);
        position.current.z = MathUtils.clamp(position.current.z, -36, 36);
      }
    } else velocity.set(0, 0, 0);
    camera.position.lerp(
      position.current,
      1 - Math.exp(-delta * (mode === "free" ? 20 : 5)),
    );
  });
  return (
    <CapsuleCollider
      ref={collider}
      args={[0.6, 0.28]}
      position={[0, 0.9, room === 0 ? 10.7 : 3.8]}
      sensor
    />
  );
}
export function ImportedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
function PhotoSphere({ pano, selectPano, information }: WorldProps) {
  const photo = panoramas[pano];
  const map = useTexture(
    import.meta.env.BASE_URL + "assets/panoramas/" + photo.image,
  );
  map.colorSpace = SRGBColorSpace;
  return (
    <>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[40, 48, 32]} />
        <meshBasicMaterial map={map} side={BackSide} />
      </mesh>
      {photo.hotspots.map((spot, i) => {
        const yaw = MathUtils.degToRad(spot.yaw),
          pitch = MathUtils.degToRad(spot.pitch);
        return (
          <Html
            key={i}
            center
            position={[
              Math.sin(yaw) * Math.cos(pitch) * 20,
              Math.sin(pitch) * 20,
              -Math.cos(yaw) * Math.cos(pitch) * 20,
            ]}
          >
            <button
              className="marker"
              onClick={() =>
                spot.destination !== undefined
                  ? selectPano(spot.destination)
                  : information(
                      (spot.guide ? "Guide: " : "") +
                        (spot.information ?? spot.label),
                    )
              }
            >
              {spot.label}
            </button>
          </Html>
        );
      })}
    </>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="scene-error">
        The 3D scene could not start. Enable WebGL or try reloading the page.{" "}
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function World(props: WorldProps) {
  const outside = props.room === 0;
  const photo = props.mode === "panorama" && panoramas.length > 0;
  return (
    <SceneBoundary>
      <Canvas
        className="canvas"
        shadows={!props.low}
        dpr={props.low ? 1 : [1, 1.55]}
        camera={{ position: [-17, 8.9, 23.6], fov: 48, near: 0.06, far: 115 }}
        gl={{ powerPreference: props.low ? "low-power" : "high-performance" }}
        fallback={
          <div className="scene-error">
            WebGL is required for the virtual school.
          </div>
        }
      >
        <Suspense
          fallback={
            <Html center>
              <span className="loading">
                <i /> Loading campus
              </span>
            </Html>
          }
        >
          <AdaptiveDpr />
          <hemisphereLight
            args={["#e9f7ff", "#a3967e", outside ? 2.05 : 2.25]}
          />
          <directionalLight
            position={outside ? [-13, 20, 11] : [-3, 3.4, 2]}
            intensity={outside ? 2.05 : 1.35}
            color="#fff1d4"
            castShadow={!props.low}
            shadow-mapSize={1024}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={18}
            shadow-camera-bottom={-17}
            shadow-normalBias={0.035}
          />
          <Physics gravity={[0, 0, 0]}>
            <CameraRig {...props} />
            {photo ? (
              <PhotoSphere {...props} />
            ) : outside ? (
              <Courtyard {...props} />
            ) : (
              <Interior {...props} />
            )}
          </Physics>
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
