"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  HOUSE_MAP, MAP_ROWS, MAP_COLS,
  ROOM_ZONES_3D, ROOM_FLOOR_COLORS, ROOM_ACCENT_COLORS, ROOM_LIGHT_COLORS,
  getRoomAt,
} from "@/lib/mapData";
import { ROOMS, RoomId } from "@/lib/gadgets";

const WALL_H = 2.2;
const WALL_COLOR = 0x1a2030;

// ─── Room lights ──────────────────────────────────────────────────────────────
function RoomLights() {
  return (
    <>
      {ROOM_ZONES_3D.map(zone => {
        const cx = (zone.cols[0] + zone.cols[1]) / 2 + 0.5;
        const cz = (zone.rows[0] + zone.rows[1]) / 2 + 0.5;
        const color = ROOM_LIGHT_COLORS[zone.id];
        return (
          <pointLight
            key={zone.id}
            position={[cx, 3.5, cz]}
            color={color}
            intensity={zone.id === "garage" ? 4 : 2.5}
            distance={12}
            decay={1.5}
          />
        );
      })}
    </>
  );
}

// ─── Floors ───────────────────────────────────────────────────────────────────
function RoomFloors() {
  return (
    <>
      {ROOM_ZONES_3D.map(zone => {
        const w = zone.cols[1] - zone.cols[0] + 1;
        const h = zone.rows[1] - zone.rows[0] + 1;
        const cx = zone.cols[0] + w / 2;
        const cz = zone.rows[0] + h / 2;
        const color = ROOM_FLOOR_COLORS[zone.id];
        const accent = ROOM_ACCENT_COLORS[zone.id];
        return (
          <group key={zone.id}>
            {/* Base floor */}
            <mesh position={[cx, -0.05, cz]} receiveShadow>
              <boxGeometry args={[w, 0.1, h]} />
              <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Grid lines overlay */}
            <GridOverlay
              x={zone.cols[0]} z={zone.rows[0]} w={w} h={h} color={accent}
            />
            {/* Room label */}
            <Html
              position={[cx, 0.05, zone.rows[0] + 0.6]}
              center
              style={{ pointerEvents: "none" }}
            >
              <div style={{
                color: accent,
                fontSize: "11px",
                fontFamily: "monospace",
                fontWeight: "bold",
                textShadow: `0 0 8px ${accent}`,
                whiteSpace: "nowrap",
                opacity: 0.8,
              }}>
                {ROOMS[zone.id].emoji} {ROOMS[zone.id].name}
              </div>
            </Html>
          </group>
        );
      })}
      {/* Outer floor (corridors) */}
      <mesh position={[MAP_COLS / 2, -0.06, MAP_ROWS / 2]} receiveShadow>
        <boxGeometry args={[MAP_COLS, 0.08, MAP_ROWS]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
    </>
  );
}

function GridOverlay({ x, z, w, h, color }: { x:number; z:number; w:number; h:number; color:string }) {
  const lineColor = new THREE.Color(color);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= w; i++) {
      pts.push(new THREE.Vector3(x + i, 0.01, z));
      pts.push(new THREE.Vector3(x + i, 0.01, z + h));
    }
    for (let i = 0; i <= h; i++) {
      pts.push(new THREE.Vector3(x, 0.01, z + i));
      pts.push(new THREE.Vector3(x + w, 0.01, z + i));
    }
    return pts;
  }, [x, z, w, h]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(lines);
    return g;
  }, [lines]);

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={lineColor} transparent opacity={0.15} />
    </lineSegments>
  );
}

// ─── Walls ────────────────────────────────────────────────────────────────────
function Walls() {
  const wallPositions = useMemo(() => {
    const pos: [number, number][] = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (HOUSE_MAP[row][col] === 1) pos.push([col, row]);
      }
    }
    return pos;
  }, []);

  return (
    <group>
      {wallPositions.map(([col, row]) => (
        <WallBlock key={`${col}-${row}`} col={col} row={row} />
      ))}
    </group>
  );
}

function WallBlock({ col, row }: { col: number; row: number }) {
  // Determine nearest room for accent color
  const neighbors = [
    getRoomAt(row - 1, col), getRoomAt(row + 1, col),
    getRoomAt(row, col - 1), getRoomAt(row, col + 1),
  ].filter(Boolean) as RoomId[];
  const accent = neighbors.length > 0 ? ROOM_ACCENT_COLORS[neighbors[0]] : "#39ff14";

  return (
    <group position={[col + 0.5, WALL_H / 2, row + 0.5]}>
      {/* Wall body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, WALL_H, 1]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Neon edge highlight */}
      <mesh>
        <boxGeometry args={[1.02, WALL_H + 0.02, 1.02]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.3}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ─── Doors ────────────────────────────────────────────────────────────────────
function Doors() {
  const doorPositions = useMemo(() => {
    const pos: [number, number][] = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (HOUSE_MAP[row][col] === 2) pos.push([col, row]);
      }
    }
    return pos;
  }, []);

  return (
    <>
      {doorPositions.map(([col, row]) => (
        <group key={`door-${col}-${row}`} position={[col + 0.5, 0, row + 0.5]}>
          {/* Door frame */}
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.15, 2, 0.9]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[0.9, 2, 0.15]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.7} />
          </mesh>
          {/* Door knob glow */}
          <mesh position={[0.3, 1, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={1} />
          </mesh>
          <pointLight position={[0, 1.5, 0]} color="#ffd60a" intensity={0.8} distance={2} />
        </group>
      ))}
    </>
  );
}

// ─── Furniture ────────────────────────────────────────────────────────────────
function Furniture() {
  const items = useMemo(() => {
    const list: { col: number; row: number; type: number }[] = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const t = HOUSE_MAP[row][col];
        if (t >= 3) list.push({ col, row, type: t });
      }
    }
    return list;
  }, []);

  return (
    <>
      {items.map(({ col, row, type }) => {
        const x = col + 0.5;
        const z = row + 0.5;
        if (type === 3) return <Table key={`${col}-${row}`} x={x} z={z} />;
        if (type === 4) return <Sofa key={`${col}-${row}`} x={x} z={z} />;
        if (type === 5) return <Workbench key={`${col}-${row}`} x={x} z={z} />;
        if (type === 6) return <Plant key={`${col}-${row}`} x={x} z={z} />;
        if (type === 7) return <TV key={`${col}-${row}`} x={x} z={z} />;
        if (type === 8) return <PortalMachine key={`${col}-${row}`} x={x} z={z} />;
        return null;
      })}
    </>
  );
}

function Table({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.8, 0.08, 0.6]} />
        <meshStandardMaterial color="#7c5230" roughness={0.6} />
      </mesh>
      {[[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.44]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Sofa({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0.05]} castShadow>
        <boxGeometry args={[0.85, 0.44, 0.5]} />
        <meshStandardMaterial color="#4a2d6b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.28]} castShadow>
        <boxGeometry args={[0.85, 0.4, 0.12]} />
        <meshStandardMaterial color="#5a3d7b" roughness={0.7} />
      </mesh>
      {/* Cushion line */}
      <mesh position={[0, 0.45, 0.05]}>
        <boxGeometry args={[0.04, 0.46, 0.52]} />
        <meshStandardMaterial color="#6a4d8b" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Workbench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Bench surface */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.85, 0.08, 0.55]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0.9, 0.24]} castShadow>
        <boxGeometry args={[0.85, 0.7, 0.06]} />
        <meshStandardMaterial color="#1c2e40" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.27, lz]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.54]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Neon trim on bench */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.87, 0.02, 0.57]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 1.2, 0]} color="#00ff88" intensity={1} distance={2.5} />
    </group>
  );
}

function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.36, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshStandardMaterial color="#2d7a2d" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.62, 0.1]} castShadow>
        <sphereGeometry args={[0.18, 6, 5]} />
        <meshStandardMaterial color="#3a9a3a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function TV({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Stand */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.12, 0.56, 0.12]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 12]} />
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.82, 0.52, 0.06]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0.72, 0.032]}>
        <planeGeometry args={[0.74, 0.44]} />
        <meshStandardMaterial color="#002244" emissive="#1144aa" emissiveIntensity={0.8} roughness={1} />
      </mesh>
      <pointLight position={[0, 0.72, 0.5]} color="#4488ff" intensity={1.5} distance={2.5} />
    </group>
  );
}

function PortalMachine({ x, z }: { x: number; z: number }) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1.current) { ring1.current.rotation.x = t * 0.9; ring1.current.rotation.z = t * 0.3; }
    if (ring2.current) { ring2.current.rotation.y = t * 0.7; ring2.current.rotation.x = t * -0.5; }
    if (ring3.current) { ring3.current.rotation.z = t * -1.1; ring3.current.rotation.y = t * 0.4; }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.08;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={[x, 0.6, z]}>
      {/* Base machine */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.5, 12]} />
        <meshStandardMaterial color="#1a3a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Portal core glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial
          color="#00ff88" emissive="#00ff88" emissiveIntensity={3}
          transparent opacity={0.7}
        />
      </mesh>
      {/* Rotating rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[0.4, 0.025, 8, 40]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={3} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[0.5, 0.018, 8, 40]} />
        <meshStandardMaterial color="#00cc66" emissive="#00cc66" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[0.6, 0.012, 8, 40]} />
        <meshStandardMaterial color="#008844" emissive="#008844" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#00ff88" intensity={6} distance={4} decay={1.5} />
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HouseModel() {
  return (
    <group>
      <RoomLights />
      <RoomFloors />
      <Walls />
      <Doors />
      <Furniture />
    </group>
  );
}
