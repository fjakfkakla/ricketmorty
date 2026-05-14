"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";
import HUD from "@/components/game/HUD";
import ChatPanel from "@/components/game/ChatPanel";
import Notification, { NotifData } from "@/components/game/Notification";
import VirtualJoystick from "@/components/game/VirtualJoystick";
import { GameEventPayload } from "@/components/game/GameScene";
import { PhaserGameHandle } from "@/components/game/PhaserGame";

const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), { ssr: false });

const RICK_ANGRY_MESSAGES = [
  "MAIS QU'EST-CE QUE TU FAIS ?! *rot* C'est à MOI ça ! Repose-le immédiatement !",
  "Tu as OSÉ toucher à ma {gadget} ?! Je vais te transformer en crombulon !",
  "Oh super, un autre humain qui pense qu'il peut juste PRENDRE mes inventions. *rot* Brillant.",
  "Si tu touches encore à mes affaires, je t'envoie dans une dimension où tu es ton propre grand-père !",
  "*rot* Génial. Génial. Mon {gadget} entre les mains d'un imbécile. C'est parfait.",
];

export default function GameClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const characterId = (searchParams.get("character") as CharacterId) || "morty";

  const [currentRoom, setCurrentRoom] = useState<RoomId>("couloir");
  const [inventory, setInventory] = useState<string[]>([]);
  const [rickAnger, setRickAnger] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeNpc, setActiveNpc] = useState<CharacterId | null>(null);
  const [notification, setNotification] = useState<NotifData | null>(null);
  const [gadgetEffect, setGadgetEffect] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const notifRef = useRef(0);
  const phaserRef = useRef<PhaserGameHandle>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!CHARACTERS[characterId]) router.replace("/");
  }, [characterId, router]);

  function showNotif(data: Omit<NotifData, "id">) {
    setNotification({ ...data, id: String(++notifRef.current) });
  }

  const handleGameEvent = useCallback((event: GameEventPayload) => {
    switch (event.type) {
      case "room_change": {
        setCurrentRoom(event.data.room as RoomId);
        showNotif({ message: event.data.roomName as string, emoji: "📍", color: "#00b4d8", type: "info" });
        break;
      }
      case "gadget_pickup": {
        const gadgetId = event.data.gadgetId as string;
        const gadgetName = event.data.gadgetName as string;
        setInventory((prev) => (prev.includes(gadgetId) ? prev : [...prev, gadgetId]));
        showNotif({ message: `Tu ramasses : ${gadgetName}`, emoji: "✅", color: "#39ff14", type: "pickup" });
        break;
      }
      case "npc_interact": {
        setActiveNpc(event.data.npcId as CharacterId);
        setChatOpen(true);
        break;
      }
      case "rick_angry": {
        const gadgetName = event.data.gadgetName as string;
        const msg = RICK_ANGRY_MESSAGES[Math.floor(Math.random() * RICK_ANGRY_MESSAGES.length)].replace(
          "{gadget}",
          gadgetName
        );
        setRickAnger((prev) => Math.min(100, prev + 30));
        showNotif({ message: msg, emoji: "😤", color: "#ff4444", type: "angry" });
        setTimeout(() => setRickAnger((prev) => Math.max(0, prev - 15)), 8000);
        break;
      }
      case "notification": {
        showNotif({
          message: event.data.message as string,
          emoji: (event.data.emoji as string) || "ℹ️",
          color: (event.data.color as string) || "#ffffff",
          type: "info",
        });
        break;
      }
    }
  }, []);

  function handleUseGadget(gadgetId: string) {
    const gadget = GADGETS.find((g) => g.id === gadgetId);
    if (!gadget) return;
    setGadgetEffect(gadget.effect);
    showNotif({ message: gadget.effect, emoji: gadget.emoji, color: gadget.color, type: "info" });
    setTimeout(() => setGadgetEffect(null), 3000);
  }

  function handleOpenChat() {
    if (chatOpen) { setChatOpen(false); return; }
    const room = ROOMS[currentRoom];
    const roomNpcs = (room?.npcs || []).filter((id: string) => id !== characterId);
    const allNpcs = Object.keys(CHARACTERS).filter((id) => id !== characterId) as CharacterId[];
    const npc = roomNpcs[0] || allNpcs[0];
    if (npc) { setActiveNpc(npc as CharacterId); setChatOpen(true); }
  }

  function handleTouchInteract() {
    phaserRef.current?.triggerInteract();
  }

  // TAB / Escape keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Tab") { e.preventDefault(); handleOpenChat(); }
      if (e.key === "Escape") setChatOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, currentRoom, characterId]);

  if (!CHARACTERS[characterId]) return null;

  const player = CHARACTERS[characterId];

  return (
    <div className="game-container">
      {/* Phaser canvas */}
      <PhaserGame ref={phaserRef} characterId={characterId} onEvent={handleGameEvent} />

      {/* HUD */}
      <HUD
        playerCharacterId={characterId}
        currentRoom={currentRoom}
        inventory={inventory}
        rickAnger={rickAnger}
        onUseGadget={handleUseGadget}
        onOpenChat={handleOpenChat}
        isChatOpen={chatOpen}
        isMobile={isMobile}
      />

      {/* Chat panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        npcId={activeNpc}
        playerCharacterId={characterId}
        isMobile={isMobile}
      />

      {/* Notifications */}
      <Notification notif={notification} />

      {/* Gadget effect overlay */}
      {gadgetEffect && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          <div
            className="text-center px-6 py-3 rounded-2xl fade-in-up mx-4"
            style={{
              background: "rgba(0,0,0,0.9)",
              border: "2px solid #39ff14",
              boxShadow: "0 0 40px rgba(57,255,20,0.4)",
              maxWidth: "360px",
            }}
          >
            <p className="text-sm italic" style={{ color: "#39ff14", fontFamily: "monospace" }}>
              {gadgetEffect}
            </p>
          </div>
        </div>
      )}

      {/* Mobile touch controls */}
      {isMobile && !chatOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-between px-5 pb-6 pointer-events-none">
          {/* Joystick left */}
          <div className="pointer-events-auto">
            <VirtualJoystick
              onChange={(state) => phaserRef.current?.setJoystick(state.x, state.y)}
            />
          </div>

          {/* Right buttons */}
          <div className="flex flex-col gap-3 items-center pointer-events-auto">
            {/* Interact */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouchInteract(); }}
              className="flex flex-col items-center justify-center rounded-full font-black text-black select-none active:scale-90 transition-transform"
              style={{
                width: "70px",
                height: "70px",
                background: `linear-gradient(135deg, ${player.color}, rgba(0,0,0,0.5))`,
                border: `3px solid ${player.color}`,
                boxShadow: `0 0 20px ${player.glowColor}`,
                fontSize: "11px",
                fontFamily: "monospace",
                touchAction: "none",
              }}
            >
              <span className="text-xl">👋</span>
              <span style={{ color: "#000", fontSize: "9px", fontWeight: "bold" }}>AGIR</span>
            </button>

            {/* Chat */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleOpenChat(); }}
              className="flex flex-col items-center justify-center rounded-full select-none active:scale-90 transition-transform"
              style={{
                width: "55px",
                height: "55px",
                background: chatOpen ? "rgba(57,255,20,0.2)" : "rgba(0,0,0,0.7)",
                border: `2px solid ${chatOpen ? "#39ff14" : "rgba(255,255,255,0.3)"}`,
                boxShadow: chatOpen ? "0 0 12px rgba(57,255,20,0.5)" : "none",
                touchAction: "none",
              }}
            >
              <span className="text-lg">💬</span>
              <span style={{ color: chatOpen ? "#39ff14" : "#888", fontSize: "8px", fontFamily: "monospace" }}>
                CHAT
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute z-50 flex items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all hover:scale-105 active:scale-95"
        style={{
          top: isMobile ? "60px" : "58px",
          left: "12px",
          background: "rgba(0,0,0,0.8)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "monospace",
        }}
      >
        ← Quitter
      </button>
    </div>
  );
}
