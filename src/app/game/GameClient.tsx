"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";
import HUD from "@/components/game/HUD";
import ChatPanel from "@/components/game/ChatPanel";
import Notification, { NotifData } from "@/components/game/Notification";
import { GameEventPayload } from "@/components/game/GameScene";

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
  const notifRef = useRef(0);

  // Validate character
  useEffect(() => {
    if (!CHARACTERS[characterId]) {
      router.replace("/");
    }
  }, [characterId, router]);

  function showNotif(data: Omit<NotifData, "id">) {
    setNotification({ ...data, id: String(++notifRef.current) });
  }

  const handleGameEvent = useCallback(
    (event: GameEventPayload) => {
      switch (event.type) {
        case "room_change": {
          setCurrentRoom(event.data.room as RoomId);
          showNotif({
            message: `${event.data.roomName as string}`,
            emoji: "📍",
            color: "#00b4d8",
            type: "info",
          });
          break;
        }

        case "gadget_pickup": {
          const gadgetId = event.data.gadgetId as string;
          const gadgetName = event.data.gadgetName as string;
          setInventory((prev) => (prev.includes(gadgetId) ? prev : [...prev, gadgetId]));
          showNotif({
            message: `Tu ramasses : ${gadgetName}`,
            emoji: "✅",
            color: "#39ff14",
            type: "pickup",
          });
          break;
        }

        case "npc_interact": {
          const npcId = event.data.npcId as CharacterId;
          setActiveNpc(npcId);
          setChatOpen(true);
          break;
        }

        case "rick_angry": {
          const gadgetName = event.data.gadgetName as string;
          const msgTemplate =
            RICK_ANGRY_MESSAGES[Math.floor(Math.random() * RICK_ANGRY_MESSAGES.length)];
          const msg = msgTemplate.replace("{gadget}", gadgetName);

          setRickAnger((prev) => Math.min(100, prev + 30));
          showNotif({
            message: msg,
            emoji: "😤",
            color: "#ff4444",
            type: "angry",
          });
          // Anger decays over time
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
    },
    []
  );

  function handleUseGadget(gadgetId: string) {
    const gadget = GADGETS.find((g) => g.id === gadgetId);
    if (!gadget) return;
    setGadgetEffect(gadget.effect);
    showNotif({
      message: gadget.effect,
      emoji: gadget.emoji,
      color: gadget.color,
      type: "info",
    });
    setTimeout(() => setGadgetEffect(null), 3000);
  }

  function handleOpenChat() {
    if (chatOpen) {
      setChatOpen(false);
      return;
    }
    // Open chat with a random NPC from current room or any available NPC
    const room = ROOMS[currentRoom];
    const roomNpcs = (room?.npcs || []).filter((id: string) => id !== characterId);
    const allNpcs = Object.keys(CHARACTERS).filter((id) => id !== characterId) as CharacterId[];
    const npc = roomNpcs[0] || allNpcs[0];
    if (npc) {
      setActiveNpc(npc as CharacterId);
      setChatOpen(true);
    }
  }

  // TAB to toggle chat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Tab") {
        e.preventDefault();
        handleOpenChat();
      }
      if (e.key === "Escape") {
        setChatOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, currentRoom, characterId]);

  if (!CHARACTERS[characterId]) return null;

  return (
    <div className="game-container">
      {/* Phaser game canvas */}
      <PhaserGame characterId={characterId} onEvent={handleGameEvent} />

      {/* HUD overlay */}
      <HUD
        playerCharacterId={characterId}
        currentRoom={currentRoom}
        inventory={inventory}
        rickAnger={rickAnger}
        onUseGadget={handleUseGadget}
        onOpenChat={handleOpenChat}
        isChatOpen={chatOpen}
      />

      {/* Chat panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        npcId={activeNpc}
        playerCharacterId={characterId}
      />

      {/* Notifications */}
      <Notification notif={notification} />

      {/* Gadget effect overlay */}
      {gadgetEffect && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
          style={{ background: "rgba(57,255,20,0.03)" }}
        >
          <div
            className="text-center px-8 py-4 rounded-2xl fade-in-up"
            style={{
              background: "rgba(0,0,0,0.85)",
              border: "2px solid #39ff14",
              boxShadow: "0 0 40px rgba(57,255,20,0.4)",
              maxWidth: "400px",
            }}
          >
            <p className="text-sm italic" style={{ color: "#39ff14", fontFamily: "monospace" }}>
              {gadgetEffect}
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:scale-105"
        style={{
          background: "rgba(0,0,0,0.8)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "monospace",
          marginTop: "50px",
        }}
      >
        ← Quitter
      </button>
    </div>
  );
}
