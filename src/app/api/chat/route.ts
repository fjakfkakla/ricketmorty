import { NextRequest, NextResponse } from "next/server";
import { CHARACTERS, CharacterId } from "@/lib/characters";
import { getScriptedResponse } from "@/lib/dialogues";

export async function POST(req: NextRequest) {
  try {
    const { npcId, playerCharacterId, message, history } = await req.json();

    const npc = CHARACTERS[npcId as CharacterId];
    const player = CHARACTERS[playerCharacterId as CharacterId];

    if (!npc || !player) {
      return NextResponse.json({ error: "Personnage introuvable" }, { status: 400 });
    }

    // Use AI if API key is set, otherwise fall back to scripted dialogues
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const systemPrompt = `${npc.systemPrompt}

Le joueur incarne ${player.name}. Adresse-toi à lui comme si tu parlais à ${player.name}.
Reste toujours dans le personnage de ${npc.name}. Réponds en français.
Si le joueur parle d'inventions ou de gadgets de Rick, réagis en fonction de ton personnage.`;

      const messages = [
        ...(history || []).map((h: { role: string; content: string }) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user" as const, content: message },
      ];

      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: systemPrompt,
        messages,
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      return NextResponse.json({ reply: text, mode: "ai" });
    }

    // Scripted fallback — no API key needed
    const reply = getScriptedResponse(npcId as CharacterId, message, history || []);
    return NextResponse.json({ reply, mode: "scripted" });
  } catch (err) {
    console.error("Chat API error:", err);
    // Even on error, return a scripted response so the game stays playable
    const { npcId, message, history } = await req.json().catch(() => ({ npcId: "rick", message: "", history: [] }));
    const reply = getScriptedResponse(npcId as CharacterId, message, history || []);
    return NextResponse.json({ reply, mode: "scripted" });
  }
}
