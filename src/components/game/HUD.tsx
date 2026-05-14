"use client";

import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";

interface HUDProps {
  playerCharacterId: CharacterId;
  currentRoom: RoomId;
  inventory: string[];
  rickAnger: number; // 0-100
  onUseGadget: (gadgetId: string) => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
}

export default function HUD({
  playerCharacterId,
  currentRoom,
  inventory,
  rickAnger,
  onUseGadget,
  onOpenChat,
  isChatOpen,
}: HUDProps) {
  const player = CHARACTERS[playerCharacterId];
  const room = ROOMS[currentRoom];
  const inventoryGadgets = inventory.map((id) => GADGETS.find((g) => g.id === id)).filter(Boolean);

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 pointer-events-none">
        {/* Player info */}
        <div className="hud-panel flex items-center gap-3 px-4 py-2" style={{ borderColor: player.color }}>
          <span className="text-2xl">{player.emoji}</span>
          <div>
            <p className="text-xs font-bold" style={{ color: player.color, fontFamily: "monospace" }}>
              {player.name}
            </p>
            <p className="text-xs opacity-50">{player.trait.split(" • ")[0]}</p>
          </div>
        </div>

        {/* Room indicator */}
        <div className="hud-panel px-4 py-2 text-center" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
          <p className="text-sm font-bold" style={{ color: "#00b4d8", fontFamily: "monospace" }}>
            {room.emoji} {room.name}
          </p>
          <p className="text-xs opacity-40">{room.description}</p>
        </div>

        {/* Rick anger meter (only if not playing Rick and anger > 0) */}
        {playerCharacterId !== "rick" && rickAnger > 0 && (
          <div className="hud-panel px-4 py-2" style={{ borderColor: "#ff4444" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "#ff4444", fontFamily: "monospace" }}>
              😤 Rick s&apos;énerve
            </p>
            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,0,0,0.2)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${rickAnger}%`,
                  background: `linear-gradient(90deg, #ff4444, #ff0000)`,
                  boxShadow: "0 0 6px #ff4444",
                }}
              />
            </div>
          </div>
        )}
        {playerCharacterId !== "rick" && rickAnger === 0 && <div style={{ width: "120px" }} />}
        {playerCharacterId === "rick" && <div style={{ width: "120px" }} />}
      </div>

      {/* Inventory bar (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-center pb-3 pointer-events-none">
        <div
          className="hud-panel flex items-center gap-2 px-4 py-2"
          style={{ borderColor: "rgba(57,255,20,0.4)", pointerEvents: "all" }}
        >
          <p className="text-xs mr-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            INVENTAIRE
          </p>
          {inventoryGadgets.length === 0 && (
            <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.2)" }}>
              Vide — ramasse des gadgets avec E
            </p>
          )}
          {inventoryGadgets.map((g) =>
            g ? (
              <button
                key={g.id}
                onClick={() => onUseGadget(g.id)}
                title={`${g.name} — ${g.effect}`}
                className="flex flex-col items-center px-2 py-1 rounded-lg transition-all hover:scale-110"
                style={{
                  background: `rgba(${hexToRgb(g.color)}, 0.15)`,
                  border: `1px solid ${g.color}`,
                  boxShadow: `0 0 8px rgba(${hexToRgb(g.color)}, 0.3)`,
                  minWidth: "48px",
                }}
              >
                <span className="text-xl">{g.emoji}</span>
                <span className="text-xs mt-0.5" style={{ color: g.color, fontSize: "9px", fontFamily: "monospace" }}>
                  {g.name.split(" ")[0]}
                </span>
              </button>
            ) : null
          )}

          {/* Chat toggle */}
          <button
            onClick={onOpenChat}
            className="ml-3 flex flex-col items-center px-2 py-1 rounded-lg transition-all hover:scale-110"
            style={{
              background: isChatOpen ? "rgba(57,255,20,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isChatOpen ? "#39ff14" : "rgba(255,255,255,0.2)"}`,
              minWidth: "48px",
            }}
          >
            <span className="text-xl">💬</span>
            <span className="text-xs" style={{ color: isChatOpen ? "#39ff14" : "#888", fontSize: "9px", fontFamily: "monospace" }}>
              CHAT
            </span>
          </button>
        </div>
      </div>

      {/* Controls hint */}
      <div
        className="absolute bottom-16 left-4 z-40 text-xs"
        style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace", pointerEvents: "none" }}
      >
        W A S D / ↑ ↓ ← → déplacer · E interagir · TAB chat
      </div>
    </>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
