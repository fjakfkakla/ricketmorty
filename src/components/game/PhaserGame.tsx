"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { CharacterId } from "@/lib/characters";
import { HouseScene, GameEventCallback } from "./GameScene";

export interface PhaserGameHandle {
  setJoystick: (x: number, y: number) => void;
  triggerInteract: () => void;
}

interface PhaserGameProps {
  characterId: CharacterId;
  onEvent: GameEventCallback;
}

const PhaserGame = forwardRef<PhaserGameHandle, PhaserGameProps>(
  function PhaserGame({ characterId, onEvent }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<import("phaser").Game | null>(null);
    const sceneRef = useRef<HouseScene | null>(null);

    useImperativeHandle(ref, () => ({
      setJoystick(x: number, y: number) {
        if (sceneRef.current) {
          sceneRef.current.touchInput = { x, y };
        }
      },
      triggerInteract() {
        sceneRef.current?.triggerInteract();
      },
    }));

    useEffect(() => {
      if (!containerRef.current || gameRef.current) return;

      let Phaser: typeof import("phaser");

      async function initPhaser() {
        Phaser = (await import("phaser")).default;

        const config: import("phaser").Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: "#0a0a0a",
          parent: containerRef.current!,
          physics: {
            default: "arcade",
            arcade: { gravity: { x: 0, y: 0 }, debug: false },
          },
          scene: [HouseScene],
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          input: {
            keyboard: true,
          },
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        game.events.once("ready", () => {
          game.scene.start("HouseScene", { characterId, onEvent });
          // Grab scene reference after a tick
          setTimeout(() => {
            sceneRef.current = game.scene.getScene("HouseScene") as HouseScene;
          }, 500);
        });
      }

      initPhaser();

      return () => {
        gameRef.current?.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      };
    }, [characterId, onEvent]);

    return <div ref={containerRef} className="absolute inset-0" />;
  }
);

export default PhaserGame;
