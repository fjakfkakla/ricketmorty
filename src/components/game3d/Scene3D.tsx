"use client";

import {
  useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import CharacterModel from "./CharacterModel";
import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";
import {
  isWall, getRoomAt,
  NPC_POSITIONS_3D, GADGET_POSITIONS_3D,
} from "@/lib/mapData";
import HouseModel from "./HouseModel";
import { GameEventCallback } from "@/components/game/GameScene";

const SPEED = 5;
const PLAYER_R = 0.32;   // collision radius
const INTERACT_DIST = 1.7;

export interface Scene3DHandle {
  setJoystick: (x: number, y: number) => void;
  triggerInteract: () => void;
}

// ─── Module-level input (avoids re-renders) ───────────────────────────────────
const keys: Record<string, boolean> = {};
const joystick = { x: 0, y: 0 };
let wantInteract = false;

// ─── Collision-safe movement ──────────────────────────────────────────────────
function movePlayer(pos: THREE.Vector3, dx: number, dz: number) {
  // X axis
  const nx = pos.x + dx;
  const checkColX = dx > 0
    ? Math.floor(nx + PLAYER_R)
    : Math.floor(nx - PLAYER_R);
  if (!isWall(Math.floor(pos.z), checkColX) &&
      !isWall(Math.floor(pos.z + PLAYER_R - 0.01), checkColX) &&
      !isWall(Math.floor(pos.z - PLAYER_R + 0.01), checkColX)) {
    pos.x = nx;
  }

  // Z axis
  const nz = pos.z + dz;
  const checkRowZ = dz > 0
    ? Math.floor(nz + PLAYER_R)
    : Math.floor(nz - PLAYER_R);
  if (!isWall(checkRowZ, Math.floor(pos.x)) &&
      !isWall(checkRowZ, Math.floor(pos.x + PLAYER_R - 0.01)) &&
      !isWall(checkRowZ, Math.floor(pos.x - PLAYER_R + 0.01))) {
    pos.z = nz;
  }
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig({ playerPos }: { playerPos: THREE.Vector3 }) {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3(9.5, 14, 18.5));
  const lookAt = useRef(new THREE.Vector3(9.5, 0, 8.5));

  useFrame(() => {
    const target = new THREE.Vector3(playerPos.x, 14, playerPos.z + 10);
    const look   = new THREE.Vector3(playerPos.x, 0,  playerPos.z);
    camPos.current.lerp(target, 0.07);
    lookAt.current.lerp(look, 0.07);
    camera.position.copy(camPos.current);
    camera.lookAt(lookAt.current);
  });

  return null;
}

// ─── Player ───────────────────────────────────────────────────────────────────
function PlayerMesh({
  characterId, playerPos, pickedUp,
  onRoomChange, onInteractTarget,
}: {
  characterId: CharacterId;
  playerPos: THREE.Vector3;
  pickedUp: Set<string>;
  onRoomChange: (room: RoomId) => void;
  onInteractTarget: (npcId: string | null, gadgetId: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentRoom = useRef<RoomId | null>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // --- Input ---
    const rawX =
      (keys["arrowleft"] || keys["a"] ? -1 : 0) +
      (keys["arrowright"] || keys["d"] ? 1 : 0) + joystick.x;
    const rawZ =
      (keys["arrowup"] || keys["w"] ? -1 : 0) +
      (keys["arrowdown"] || keys["s"] ? 1 : 0) + joystick.y;

    const len = Math.sqrt(rawX * rawX + rawZ * rawZ) || 1;
    const moving = Math.abs(rawX) > 0.05 || Math.abs(rawZ) > 0.05;

    if (moving) {
      movePlayer(playerPos, (rawX / len) * SPEED * delta, (rawZ / len) * SPEED * delta);
    }

    // --- Sync mesh ---
    if (groupRef.current) {
      groupRef.current.position.set(
        playerPos.x,
        moving ? Math.sin(t * 8) * 0.04 : 0,
        playerPos.z
      );
    }
    // --- Room change ---
    const room = getRoomAt(Math.floor(playerPos.z), Math.floor(playerPos.x));
    if (room && room !== currentRoom.current) {
      currentRoom.current = room;
      onRoomChange(room);
    }

    // --- Interact ---
    if (wantInteract || keys["e"]) {
      wantInteract = false;
      keys["e"] = false;

      let nearNpc: string | null = null;
      let nearGadget: string | null = null;
      let best = INTERACT_DIST;

      Object.entries(NPC_POSITIONS_3D).forEach(([id, pos]) => {
        if (id === characterId) return;
        const d = Math.hypot(playerPos.x - (pos.col + 0.5), playerPos.z - (pos.row + 0.5));
        if (d < best) { best = d; nearNpc = id; }
      });

      if (!nearNpc) {
        best = INTERACT_DIST;
        Object.entries(GADGET_POSITIONS_3D).forEach(([id, pos]) => {
          if (pickedUp.has(id)) return;
          const d = Math.hypot(playerPos.x - (pos.col + 0.5), playerPos.z - (pos.row + 0.5));
          if (d < best) { best = d; nearGadget = id; }
        });
      }

      onInteractTarget(nearNpc, nearGadget);
    }
  });

  return (
    <group ref={groupRef} position={[playerPos.x, 0, playerPos.z]}>
      <CharacterModel characterId={characterId} isPlayer={true} position={[0, 0, 0]} />
    </group>
  );
}

// ─── NPC ──────────────────────────────────────────────────────────────────────
function NPC({ id }: { id: string }) {
  const pos = NPC_POSITIONS_3D[id];
  const char = CHARACTERS[id as CharacterId];
  if (!pos || !char) return null;

  const ref  = useRef<THREE.Group>(null);
  const seed = pos.col * 1.3 + pos.row * 0.7;

  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 1.4 + seed) * 0.07;
  });

  return (
    <group ref={ref} position={[pos.col + 0.5, 0, pos.row + 0.5]}>
      <CharacterModel characterId={id as CharacterId} isPlayer={false} position={[0, 0, 0]} />
    </group>
  );
}

// ─── Gadget ───────────────────────────────────────────────────────────────────
function GadgetItem({ id }: { id: string }) {
  const pos    = GADGET_POSITIONS_3D[id];
  const gadget = GADGETS.find(g => g.id === id);
  if (!pos || !gadget) return null;

  const ref  = useRef<THREE.Group>(null);
  const seed = pos.col * 0.8 + pos.row * 0.5;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + seed;
    if (ref.current) {
      ref.current.position.y = 0.55 + Math.sin(t * 2.2) * 0.14;
      ref.current.rotation.y = t * 0.9;
    }
  });

  return (
    <group ref={ref} position={[pos.col + 0.5, 0.55, pos.row + 0.5]}>
      <mesh castShadow>
        <sphereGeometry args={[0.17, 10, 8]} />
        <meshStandardMaterial color={gadget.color} emissive={gadget.color} emissiveIntensity={3} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.27, 0.016, 6, 22]} />
        <meshStandardMaterial color={gadget.color} emissive={gadget.color} emissiveIntensity={2} />
      </mesh>
      <Billboard position={[0, 0.44, 0]}>
        <Html center style={{ pointerEvents:"none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
            <span style={{ fontSize:"18px" }}>{gadget.emoji}</span>
            <span style={{
              color: gadget.color, fontSize:"8px", fontFamily:"monospace",
              background:"rgba(0,0,0,0.9)", padding:"1px 4px", borderRadius:"3px",
              border:`1px solid ${gadget.color}`, whiteSpace:"nowrap",
            }}>{gadget.name}</span>
          </div>
        </Html>
      </Billboard>
      <pointLight color={gadget.color} intensity={2.5} distance={2} decay={2} />
    </group>
  );
}

// ─── Inner scene (has access to Canvas context) ───────────────────────────────
function InnerScene({
  characterId, onEvent, pickedUp, setPickedUp,
}: {
  characterId: CharacterId;
  onEvent: GameEventCallback;
  pickedUp: Set<string>;
  setPickedUp: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const playerPos = useRef(new THREE.Vector3(9.5, 0, 8.5));
  const npcs = Object.keys(NPC_POSITIONS_3D).filter(id => id !== characterId);

  const handleRoomChange = useCallback((room: RoomId) => {
    onEvent({ type: "room_change", data: { room, roomName: ROOMS[room].name } });
  }, [onEvent]);

  const handleInteract = useCallback((npcId: string | null, gadgetId: string | null) => {
    if (npcId) {
      const char = CHARACTERS[npcId as CharacterId];
      onEvent({ type: "npc_interact", data: { npcId, npcName: char?.name ?? npcId } });
    }
    if (gadgetId) {
      const gadget = GADGETS.find(g => g.id === gadgetId);
      if (!gadget) return;
      setPickedUp(prev => new Set([...prev, gadgetId]));
      onEvent({ type: "gadget_pickup", data: { gadgetId, gadgetName: gadget.name, isRickItem: gadget.isRickItem } });
      if (gadget.isRickItem && characterId !== "rick")
        setTimeout(() => onEvent({ type: "rick_angry", data: { gadgetName: gadget.name } }), 600);
    }
  }, [characterId, onEvent, setPickedUp]);

  return (
    <>
      <ambientLight intensity={0.2} color="#8899bb" />
      <directionalLight position={[15, 20, 10]} intensity={0.9} color="#fff5dd" castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-far={60}
        shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30} />
      <directionalLight position={[-8, 10, -6]} intensity={0.2} color="#aabbff" />

      <HouseModel />

      <PlayerMesh
        characterId={characterId}
        playerPos={playerPos.current}
        pickedUp={pickedUp}
        onRoomChange={handleRoomChange}
        onInteractTarget={handleInteract}
      />

      {npcs.map(id => <NPC key={id} id={id} />)}

      {Object.keys(GADGET_POSITIONS_3D).map(id =>
        pickedUp.has(id) ? null : <GadgetItem key={id} id={id} />
      )}

      <CameraRig playerPos={playerPos.current} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.85} intensity={1.6} mipmapBlur />
      </EffectComposer>
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
const Scene3D = forwardRef<Scene3DHandle, { characterId: CharacterId; onEvent: GameEventCallback }>(
  function Scene3D({ characterId, onEvent }, ref) {
    const [pickedUp, setPickedUp] = useState<Set<string>>(new Set());

    useImperativeHandle(ref, () => ({
      setJoystick(x: number, y: number) { joystick.x = x; joystick.y = y; },
      triggerInteract() { wantInteract = true; },
    }));

    useEffect(() => {
      const dn = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = true; };
      const up = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
      window.addEventListener("keydown", dn);
      window.addEventListener("keyup", up);
      return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
    }, []);

    return (
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [9.5, 14, 18.5], fov: 45 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <InnerScene
            characterId={characterId}
            onEvent={onEvent}
            pickedUp={pickedUp}
            setPickedUp={setPickedUp}
          />
        </Canvas>
      </div>
    );
  }
);

export default Scene3D;
