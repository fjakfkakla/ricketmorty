"use client";

import { useState, useRef, useEffect } from "react";
import { CharacterId, CHARACTERS } from "@/lib/characters";

interface Message {
  role: "user" | "assistant";
  content: string;
  npcId?: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  npcId: CharacterId | null;
  playerCharacterId: CharacterId;
  initialNpcMessage?: string;
  isMobile?: boolean;
}

export default function ChatPanel({
  isOpen,
  onClose,
  npcId,
  playerCharacterId,
  initialNpcMessage,
  isMobile = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentNpc, setCurrentNpc] = useState<CharacterId | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && npcId && npcId !== currentNpc) {
      setCurrentNpc(npcId);
      const greeting = initialNpcMessage || getGreeting(npcId, playerCharacterId);
      setMessages([{ role: "assistant", content: greeting, npcId }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, npcId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getGreeting(npc: CharacterId, player: CharacterId): string {
    const npcChar = CHARACTERS[npc];
    const playerChar = CHARACTERS[player];
    const greetings: Record<CharacterId, string> = {
      rick: `*rot* Qu'est-ce que tu veux, ${playerChar.name.split(" ")[0]} ? J'ai pas que ça à faire.`,
      morty: `Oh m-mec ! ${playerChar.name.split(" ")[0]} ! Salut ! T-tu vas bien ?`,
      summer: `Ah sérieux, ${playerChar.name.split(" ")[0]}... Genre, t'as besoin de quoi ?`,
      beth: `${playerChar.name.split(" ")[0]}, bonjour. Je suis un peu occupée mais... qu'est-ce qu'il y a ?`,
      jerry: `Oh ! ${playerChar.name.split(" ")[0]} ! Super de te voir ! Tu veux regarder la télé avec moi ?`,
    };
    return greetings[npc] || `Salut ${playerChar.name} !`;
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !npcId) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npcId,
          playerCharacterId,
          message: userMsg,
          history: newMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "...", npcId },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "*(bruit de statique)* Je t'entends plus...", npcId },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !npcId) return null;

  const npc = CHARACTERS[npcId];
  const player = CHARACTERS[playerCharacterId];

  const mobileStyle = isMobile
    ? { inset: 0, width: "100%", height: "100%", borderRadius: 0, bottom: 0, right: 0 }
    : { bottom: "16px", right: "16px", width: "340px", height: "420px", borderRadius: "12px" };

  return (
    <div
      className="absolute flex flex-col overflow-hidden z-50"
      style={{
        ...mobileStyle,
        background: "rgba(0,0,0,0.96)",
        border: `2px solid ${npc.color}`,
        boxShadow: `0 0 30px ${npc.glowColor}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${npc.glowColor}, rgba(0,0,0,0.8))` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{npc.emoji}</span>
          <div>
            <p className="font-bold text-sm" style={{ color: npc.color }}>
              {npc.name}
            </p>
            <p className="text-xs opacity-60">{npc.trait.split(" • ")[0]}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-lg opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: npc.color }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <span className="text-lg mr-2 flex-shrink-0 mt-1">{npc.emoji}</span>
            )}
            <div
              className="chat-bubble text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: `rgba(${hexToRgb(player.color)}, 0.15)`,
                      border: `1px solid ${player.color}`,
                      color: player.color,
                      borderRadius: "12px 12px 2px 12px",
                      padding: "8px 12px",
                      maxWidth: "230px",
                    }
                  : {
                      background: `rgba(${hexToRgb(npc.color)}, 0.1)`,
                      border: `1px solid ${npc.color}`,
                      color: "#e0e0e0",
                      borderRadius: "2px 12px 12px 12px",
                      padding: "8px 12px",
                      maxWidth: "230px",
                    }
              }
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <span className="text-lg ml-2 flex-shrink-0 mt-1">{player.emoji}</span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="text-lg mr-2">{npc.emoji}</span>
            <div
              className="px-3 py-2 rounded-xl text-sm"
              style={{ background: `rgba(${hexToRgb(npc.color)}, 0.1)`, border: `1px solid ${npc.color}`, color: npc.color }}
            >
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t" style={{ borderColor: `rgba(${hexToRgb(npc.color)}, 0.3)` }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dire quelque chose..."
          disabled={loading}
          className="flex-1 bg-transparent text-sm outline-none placeholder-gray-600"
          style={{ color: "#e0e0e0", fontFamily: "monospace" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 py-1 rounded-lg text-sm font-bold transition-all disabled:opacity-30"
          style={{
            background: npc.color,
            color: "#000",
            fontFamily: "monospace",
          }}
        >
          ↵
        </button>
      </form>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
