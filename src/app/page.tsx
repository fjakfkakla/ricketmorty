"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHARACTERS, CharacterId } from "@/lib/characters";

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<CharacterId | null>(null);
  const [entering, setEntering] = useState(false);

  const characters = Object.values(CHARACTERS);

  function handlePlay() {
    if (!selected || entering) return;
    setEntering(true);
    setTimeout(() => {
      router.push(`/game?character=${selected}`);
    }, 800);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(57,255,20,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,180,216,0.05) 0%, transparent 60%)",
          }}
        />
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (((i * 7) % 3) + 1) + "px",
              height: (((i * 7) % 3) + 1) + "px",
              top: ((i * 17) % 100) + "%",
              left: ((i * 23) % 100) + "%",
              opacity: ((i * 13) % 7) / 10 + 0.1,
              animation: `float ${3 + ((i * 11) % 4)}s ease-in-out infinite`,
              animationDelay: ((i * 3) % 4) + "s",
            }}
          />
        ))}
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: "500px",
            height: "500px",
            top: "-100px",
            right: "-100px",
            border: "3px solid #39ff14",
            animation: "portalSpin 20s linear infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: "300px",
            height: "300px",
            bottom: "-50px",
            left: "-50px",
            border: "2px solid #00b4d8",
            animation: "portalSpin 15s linear infinite reverse",
          }}
        />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mb-8 fade-in-up">
        <div className="text-6xl mb-2">🧪</div>
        <h1
          className="text-5xl font-black tracking-widest uppercase mb-1 neon-flicker"
          style={{ color: "#39ff14", fontFamily: "monospace" }}
        >
          Rick & Morty
        </h1>
        <p
          className="text-xl tracking-[0.3em] uppercase"
          style={{ color: "#00b4d8", fontFamily: "monospace" }}
        >
          — The Game —
        </p>
        <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Choisis ton personnage pour explorer la maison Smith
        </p>
      </div>

      {/* Character grid */}
      <div className="relative z-10 grid grid-cols-5 gap-3 mb-8 px-4 fade-in-up" style={{ animationDelay: "0.2s" }}>
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => setSelected(char.id)}
            className="relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 cursor-pointer"
            style={{
              background:
                selected === char.id
                  ? `linear-gradient(135deg, ${char.glowColor}, rgba(0,0,0,0.8))`
                  : "rgba(255,255,255,0.03)",
              border: `2px solid ${selected === char.id ? char.borderColor : "rgba(255,255,255,0.1)"}`,
              boxShadow:
                selected === char.id
                  ? `0 0 20px ${char.glowColor}, 0 0 40px ${char.glowColor}`
                  : "none",
              transform: selected === char.id ? "scale(1.05)" : "scale(1)",
              minWidth: "120px",
            }}
          >
            {selected === char.id && (
              <div
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{ background: char.color, boxShadow: `0 0 6px ${char.color}` }}
              />
            )}
            <span className="text-4xl mb-2 float-anim" style={{ animationDelay: `${(char.id.length * 0.3) % 2}s` }}>
              {char.emoji}
            </span>
            <span
              className="text-sm font-bold tracking-wide"
              style={{ color: selected === char.id ? char.color : "#ccc" }}
            >
              {char.name}
            </span>
            <span className="text-xs mt-1 text-center" style={{ color: "#aaa", fontSize: "10px", opacity: 0.6 }}>
              {char.trait.split(" • ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Selected character info */}
      {selected && (
        <div
          className="relative z-10 hud-panel px-6 py-4 mb-6 text-center max-w-md fade-in-up"
          style={{ borderColor: CHARACTERS[selected].color }}
        >
          <p
            className="font-bold text-lg"
            style={{ color: CHARACTERS[selected].color }}
          >
            {CHARACTERS[selected].description}
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Objet de départ : {CHARACTERS[selected].emoji} {CHARACTERS[selected].startingItem}
          </p>
        </div>
      )}

      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={!selected || entering}
        className="relative z-10 px-12 py-4 text-lg font-black uppercase tracking-widest rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: selected
            ? `linear-gradient(135deg, ${CHARACTERS[selected]?.color || "#39ff14"}, rgba(0,0,0,0.5))`
            : "rgba(255,255,255,0.1)",
          border: `2px solid ${selected ? CHARACTERS[selected]?.color || "#39ff14" : "rgba(255,255,255,0.2)"}`,
          color: selected ? "#000" : "#666",
          boxShadow: selected ? `0 0 30px ${CHARACTERS[selected]?.glowColor || "transparent"}` : "none",
          fontFamily: "monospace",
        }}
      >
        {entering ? "🌀 Ouverture du portail..." : "🚀 Jouer"}
      </button>

      <p className="absolute bottom-4 text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>
        W A S D ou flèches pour se déplacer · E pour interagir · TAB pour le chat
      </p>
    </div>
  );
}
