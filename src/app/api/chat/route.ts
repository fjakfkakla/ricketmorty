import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CHARACTERS, CharacterId } from "@/lib/characters";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { npcId, playerCharacterId, message, history } = await req.json();

    const npc = CHARACTERS[npcId as CharacterId];
    const player = CHARACTERS[playerCharacterId as CharacterId];

    if (!npc || !player) {
      return NextResponse.json({ error: "Personnage introuvable" }, { status: 400 });
    }

    const systemPrompt = `${npc.systemPrompt}

Le joueur incarne ${player.name}. Adresse-toi à lui comme si tu parlais à ${player.name}.
Reste toujours dans le personnage de ${npc.name}. Réponds en français.
Si le joueur parle d'inventions ou de gadgets de Rick, réagis en fonction de ton personnage.`;

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).map(
        (h: { role: string; content: string }): Anthropic.MessageParam => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })
      ),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
