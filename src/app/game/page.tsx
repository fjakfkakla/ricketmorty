"use client";

import { Suspense } from "react";
import GameClient from "./GameClient";

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="text-6xl mb-4" style={{ animation: "portalSpin 1s linear infinite" }}>🌀</div>
            <p style={{ color: "#39ff14", fontFamily: "monospace" }}>Ouverture du portail...</p>
          </div>
        </div>
      }
    >
      <GameClient />
    </Suspense>
  );
}
