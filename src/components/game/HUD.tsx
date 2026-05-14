"use client";

import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";

interface HUDProps {
  playerCharacterId: CharacterId;
  currentRoom: RoomId;
  inventory: string[];
  rickAnger: number;
  onUseGadget: (gadgetId: string) => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  isMobile?: boolean;
}

export default function HUD({
  playerCharacterId,
  currentRoom,
  inventory,
  rickAnger,
  onUseGadget,
  onOpenChat,
  isChatOpen,
  isMobile = false,
}: HUDProps) {
  const player = CHARACTERS[playerCharacterId];
  const room = ROOMS[currentRoom];
  const inventoryGadgets = inventory.map((id) => GADGETS.find((g) => g.id === id)).filter(Boolean);

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between pointer-events-none"
        style={{ padding: isMobile ? "6px 8px" : "8px 16px" }}>
        {/* Player info */}
        <div
          className="hud-panel flex items-center gap-2"
          style={{ borderColor: player.color, padding: isMobile ? "4px 8px" : "8px 16px" }}
        >
          <span style={{ fontSize: isMobile ? "18px" : "24px" }}>{player.emoji}</span>
          <div>
            <p
              className="font-bold leading-tight"
              style={{ color: player.color, fontFamily: "monospace", fontSize: isMobile ? "10px" : "12px" }}
            >
              {isMobile ? player.name.split(" ")[0] : player.name}
            </p>
            {!isMobile && (
              <p className="text-xs opacity-50">{player.trait.split(" • ")[0]}</p>
            )}
          </div>
        </div>

        {/* Room indicator */}
        <div
          className="hud-panel text-center"
          style={{ borderColor: "rgba(255,255,255,0.2)", padding: isMobile ? "4px 8px" : "8px 16px" }}
        >
          <p
            className="font-bold"
            style={{ color: "#00b4d8", fontFamily: "monospace", fontSize: isMobile ? "10px" : "14px" }}
          >
            {room.emoji} {isMobile ? room.name.replace("Garage de Rick", "Garage") : room.name}
          </p>
        </div>

        {/* Rick anger meter */}
        {playerCharacterId !== "rick" && rickAnger > 0 && (
          <div
            className="hud-panel"
            style={{ borderColor: "#ff4444", padding: isMobile ? "4px 8px" : "8px 16px" }}
          >
            <p
              className="font-bold mb-1"
              style={{ color: "#ff4444", fontFamily: "monospace", fontSize: isMobile ? "9px" : "11px" }}
            >
              😤 Rick
            </p>
            <div
              className="rounded-full overflow-hidden"
              style={{ width: isMobile ? "50px" : "96px", height: "6px", background: "rgba(255,0,0,0.2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${rickAnger}%`,
                  background: "linear-gradient(90deg, #ff4444, #ff0000)",
                  boxShadow: "0 0 6px #ff4444",
                }}
              />
            </div>
          </div>
        )}
        {(playerCharacterId === "rick" || rickAnger === 0) && (
          <div style={{ width: isMobile ? "60px" : "120px" }} />
        )}
      </div>

      {/* Inventory bar — hidden on mobile (controls are on the side) */}
      {!isMobile && (
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
                  <span
                    className="text-xs mt-0.5"
                    style={{ color: g.color, fontSize: "9px", fontFamily: "monospace" }}
                  >
                    {g.name.split(" ")[0]}
                  </span>
                </button>
              ) : null
            )}
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
              <span
                className="text-xs"
                style={{ color: isChatOpen ? "#39ff14" : "#888", fontSize: "9px", fontFamily: "monospace" }}
              >
                CHAT
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile inventory — compact strip at top right of bottom zone (above joystick) */}
      {isMobile && inventoryGadgets.length > 0 && (
        <div
          className="absolute z-40 flex flex-col gap-1 pointer-events-auto"
          style={{ bottom: "160px", left: "16px" }}
        >
          {inventoryGadgets.slice(0, 4).map((g) =>
            g ? (
              <button
                key={g.id}
                onTouchStart={(e) => { e.preventDefault(); onUseGadget(g.id); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{
                  background: `rgba(${hexToRgb(g.color)}, 0.2)`,
                  border: `1px solid ${g.color}`,
                  fontSize: "10px",
                  color: g.color,
                  fontFamily: "monospace",
                  touchAction: "none",
                }}
              >
                <span>{g.emoji}</span>
                <span style={{ fontSize: "8px" }}>{g.name.split(" ")[0]}</span>
              </button>
            ) : null
          )}
        </div>
      )}

      {/* Controls hint — desktop only */}
      {!isMobile && (
        <div
          className="absolute bottom-16 left-4 z-40 text-xs"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "monospace", pointerEvents: "none" }}
        >
          W A S D / ↑ ↓ ← → déplacer · E interagir · TAB chat
        </div>
      )}
    </>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
