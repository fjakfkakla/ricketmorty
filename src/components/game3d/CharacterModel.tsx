"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { CharacterId, CHARACTERS } from "@/lib/characters";
import { getCharacterTexture, SPRITE_W, SPRITE_H } from "./CharacterSprites";

// Models available in /public/models/<id>.glb
const MODEL_PATHS: Record<CharacterId, string> = {
  rick:   "/models/rick.glb",
  morty:  "/models/morty.glb",
  summer: "/models/summer.glb",
  beth:   "/models/beth.glb",
  jerry:  "/models/jerry.glb",
};

// Scale per model — ajuste si le modèle est trop grand/petit
const MODEL_SCALE: Record<CharacterId, number> = {
  rick:   1,
  morty:  1,
  summer: 1,
  beth:   1,
  jerry:  1,
};

// ─── GLB loader (only if file exists) ────────────────────────────────────────
function GLBModel({ path, scale, color }: { path: string; scale: number; color: string }) {
  const { scene } = useGLTF(path);
  const cloned = useRef(scene.clone(true));

  useEffect(() => {
    // Apply shadow + slight emissive to all meshes
    cloned.current.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.emissive = new THREE.Color(color);
              m.emissiveIntensity = 0.08;
            }
          });
        } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive = new THREE.Color(color);
          mesh.material.emissiveIntensity = 0.08;
        }
      }
    });
  }, [color]);

  return <primitive object={cloned.current} scale={scale} position={[0, 0, 0]} />;
}

// ─── Sprite fallback (canvas-drawn) ──────────────────────────────────────────
function SpriteCharacter({ characterId }: { characterId: CharacterId }) {
  const texture = getCharacterTexture(characterId);
  const aspect  = SPRITE_H / SPRITE_W;
  return (
    <Billboard>
      <mesh position={[0, 0.9, 0]}>
        <planeGeometry args={[1.0, 1.0 * aspect]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}

// ─── Smart loader: tries GLB, falls back to sprite ───────────────────────────
function CharacterBody({ characterId }: { characterId: CharacterId }) {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    const path = MODEL_PATHS[characterId];
    fetch(path, { method: "HEAD" })
      .then(r => setHasModel(r.ok))
      .catch(() => setHasModel(false));
  }, [characterId]);

  if (hasModel === null) return null; // loading
  if (!hasModel) return <SpriteCharacter characterId={characterId} />;

  return (
    <GLBModel
      path={MODEL_PATHS[characterId]}
      scale={MODEL_SCALE[characterId]}
      color={CHARACTERS[characterId].color}
    />
  );
}

// ─── Full character component (body + glow ring + label) ─────────────────────
interface CharacterProps {
  characterId: CharacterId;
  isPlayer?: boolean;
  position: [number, number, number];
  labelYOffset?: number;
}

export default function CharacterModel({
  characterId, isPlayer = false, position, labelYOffset = 2.1
}: CharacterProps) {
  const char   = CHARACTERS[characterId];
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.y = clock.getElapsedTime() * (isPlayer ? 2 : 1.2);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
      {/* Glow ring */}
      <mesh ref={ringRef} position={[0, 0.02, 0]}>
        <torusGeometry args={[0.42, 0.022, 6, 28]} />
        <meshStandardMaterial color={char.color} emissive={char.color} emissiveIntensity={isPlayer ? 3 : 2} />
      </mesh>
      {/* Model or sprite */}
      <CharacterBody characterId={characterId} />
      {/* Label */}
      <Billboard position={[0, labelYOffset, 0]}>
        <Html center style={{ pointerEvents: "none" }}>
          <span style={{
            color: char.color, fontSize: isPlayer ? "10px" : "9px",
            fontFamily: "monospace", fontWeight: "bold",
            background: "rgba(0,0,0,0.85)", padding: "2px 6px",
            borderRadius: "4px", border: `1px solid ${char.color}`,
            textShadow: `0 0 8px ${char.color}`, whiteSpace: "nowrap",
          }}>
            {char.name}{!isPlayer && " 💬"}
          </span>
        </Html>
      </Billboard>
      <pointLight color={char.color} intensity={isPlayer ? 1.5 : 0.8} distance={isPlayer ? 3.5 : 2.5} decay={2} />
    </group>
  );
}

// Preload all models (no-op if files don't exist)
Object.values(MODEL_PATHS).forEach(path => {
  try { useGLTF.preload(path); } catch { /* file not found */ }
});
