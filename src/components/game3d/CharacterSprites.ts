import * as THREE from "three";

const W = 128;
const H = 192;

function makeTexture(draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, r = 0) {
  ctx.beginPath();
  if (r > 0) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fillStyle = color;
  ctx.fill();
}

function outline(ctx: CanvasRenderingContext2D, color = "#000", width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

// ─── Rick Sanchez ────────────────────────────────────────────────────────────
function drawRick(ctx: CanvasRenderingContext2D) {
  const SKIN = "#b5d5c5";
  const COAT = "#c8dde8";
  const SHIRT = "#aabfcc";

  // Lab coat body
  rect(ctx, 24, 90, 80, 90, COAT, 8);
  ctx.beginPath(); ctx.rect(24, 90, 80, 90); outline(ctx, "#7a9aaa", 2);
  // Shirt/tie detail
  rect(ctx, 52, 96, 24, 60, SHIRT, 4);
  // Coat lapels
  ctx.beginPath();
  ctx.moveTo(64, 90); ctx.lineTo(38, 90); ctx.lineTo(44, 115);
  ctx.fillStyle = COAT; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(64, 90); ctx.lineTo(90, 90); ctx.lineTo(84, 115);
  ctx.fillStyle = COAT; ctx.fill();

  // Neck
  ellipse(ctx, 64, 88, 10, 8, SKIN);

  // Head
  ctx.beginPath();
  ctx.ellipse(64, 62, 30, 32, 0, 0, Math.PI * 2);
  ctx.fillStyle = SKIN; ctx.fill();
  ctx.strokeStyle = "#7aaa8a"; ctx.lineWidth = 2; ctx.stroke();

  // White hair — big fluffy
  ctx.fillStyle = "#e8e8e8";
  ctx.beginPath();
  // Left hair bump
  ctx.ellipse(36, 42, 16, 20, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(50, 32, 18, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(66, 28, 16, 20, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(82, 34, 14, 18, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(92, 46, 12, 16, 0.4, 0, Math.PI * 2); ctx.fill();
  // Hair outline
  ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1;

  // Unibrow
  ctx.beginPath();
  ctx.moveTo(42, 56); ctx.quadraticCurveTo(64, 50, 84, 56);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();

  // Eyes — small beady
  ellipse(ctx, 52, 63, 5, 5, "#fff");
  ellipse(ctx, 76, 63, 5, 5, "#fff");
  ellipse(ctx, 53, 63, 3, 3, "#111");
  ellipse(ctx, 77, 63, 3, 3, "#111");
  // Pupils glint
  ellipse(ctx, 54, 62, 1, 1, "#fff");
  ellipse(ctx, 78, 62, 1, 1, "#fff");

  // Nose
  ctx.beginPath();
  ctx.moveTo(62, 68); ctx.lineTo(60, 76); ctx.lineTo(66, 78);
  ctx.strokeStyle = "#7a9a8a"; ctx.lineWidth = 2; ctx.stroke();

  // Mouth — slightly open smirk
  ctx.beginPath();
  ctx.moveTo(48, 82); ctx.quadraticCurveTo(64, 86, 78, 80);
  ctx.strokeStyle = "#555"; ctx.lineWidth = 2; ctx.stroke();

  // DROOL — signature Rick trait
  ctx.beginPath();
  ctx.moveTo(52, 84); ctx.quadraticCurveTo(48, 92, 50, 98);
  ctx.strokeStyle = "#88ccdd"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
  ellipse(ctx, 50, 99, 4, 5, "#88ccdd");

  // Arms
  rect(ctx, 4, 92, 22, 52, COAT, 8);
  rect(ctx, 102, 92, 22, 52, COAT, 8);
  // Hands
  ellipse(ctx, 15, 148, 10, 10, SKIN);
  ellipse(ctx, 113, 148, 10, 10, SKIN);

  // Legs
  rect(ctx, 30, 175, 26, 16, "#445566", 4);
  rect(ctx, 72, 175, 26, 16, "#445566", 4);
  // Shoes
  rect(ctx, 26, 186, 30, 8, "#222", 3);
  rect(ctx, 72, 186, 30, 8, "#222", 3);
}

// ─── Morty Smith ─────────────────────────────────────────────────────────────
function drawMorty(ctx: CanvasRenderingContext2D) {
  const SKIN = "#e8c88a";
  const SHIRT = "#f0d030";

  // Body — yellow shirt
  rect(ctx, 28, 100, 72, 78, SHIRT, 8);
  ctx.beginPath(); ctx.rect(28, 100, 72, 78); outline(ctx, "#b8a020", 2);

  // Neck
  ellipse(ctx, 64, 98, 9, 7, SKIN);

  // Head — big round
  ctx.beginPath();
  ctx.ellipse(64, 68, 34, 36, 0, 0, Math.PI * 2);
  ctx.fillStyle = SKIN; ctx.fill();
  ctx.strokeStyle = "#c09050"; ctx.lineWidth = 2; ctx.stroke();

  // Brown hair — short, slightly messy
  ctx.fillStyle = "#8b6040";
  ctx.beginPath();
  ctx.ellipse(64, 38, 28, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(40, 50, 14, 18, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(88, 50, 14, 18, 0.4, 0, Math.PI * 2); ctx.fill();

  // Eyebrows — thin, worried
  ctx.strokeStyle = "#6a4020"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(42, 56); ctx.lineTo(58, 60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(70, 60); ctx.lineTo(86, 56); ctx.stroke();

  // Eyes — big, worried (Morty signature)
  ellipse(ctx, 50, 68, 9, 10, "#fff");
  ellipse(ctx, 78, 68, 9, 10, "#fff");
  ellipse(ctx, 50, 68, 5, 6, "#6a4020");
  ellipse(ctx, 78, 68, 5, 6, "#6a4020");
  ellipse(ctx, 50, 68, 2.5, 3, "#111");
  ellipse(ctx, 78, 68, 2.5, 3, "#111");
  ellipse(ctx, 51, 66, 1.5, 1.5, "#fff");
  ellipse(ctx, 79, 66, 1.5, 1.5, "#fff");

  // Nose — small
  ctx.beginPath();
  ctx.moveTo(62, 76); ctx.lineTo(60, 82); ctx.lineTo(67, 82);
  ctx.strokeStyle = "#c09050"; ctx.lineWidth = 1.5; ctx.stroke();

  // Mouth — worried "oh geez"
  ctx.beginPath();
  ctx.moveTo(50, 88); ctx.quadraticCurveTo(64, 96, 78, 88);
  ctx.strokeStyle = "#888"; ctx.lineWidth = 2; ctx.stroke();
  // Slight open mouth
  ellipse(ctx, 64, 91, 8, 5, "#cc8866");

  // Ears
  ellipse(ctx, 30, 68, 5, 8, SKIN);
  ellipse(ctx, 98, 68, 5, 8, SKIN);

  // Arms
  rect(ctx, 4, 102, 26, 46, SHIRT, 8);
  rect(ctx, 98, 102, 26, 46, SHIRT, 8);
  ellipse(ctx, 17, 152, 10, 10, SKIN);
  ellipse(ctx, 111, 152, 10, 10, SKIN);

  // Pants
  rect(ctx, 28, 174, 30, 18, "#6688aa", 4);
  rect(ctx, 70, 174, 30, 18, "#6688aa", 4);
  // Shoes
  rect(ctx, 24, 186, 32, 8, "#554433", 3);
  rect(ctx, 72, 186, 32, 8, "#554433", 3);
}

// ─── Summer Smith ────────────────────────────────────────────────────────────
function drawSummer(ctx: CanvasRenderingContext2D) {
  const SKIN = "#f0c8a0";
  const TOP = "#e88898";

  // Body
  rect(ctx, 26, 98, 76, 80, TOP, 8);
  ctx.beginPath(); ctx.rect(26, 98, 76, 80); outline(ctx, "#c06070", 2);

  // Neck
  ellipse(ctx, 64, 96, 9, 7, SKIN);

  // Head
  ctx.beginPath();
  ctx.ellipse(64, 66, 30, 32, 0, 0, Math.PI * 2);
  ctx.fillStyle = SKIN; ctx.fill();
  ctx.strokeStyle = "#c09070"; ctx.lineWidth = 1.5; ctx.stroke();

  // Long red-orange hair
  ctx.fillStyle = "#d04020";
  // Hair top
  ctx.beginPath();
  ctx.ellipse(64, 40, 32, 28, 0, 0, Math.PI * 2); ctx.fill();
  // Left side hair (long)
  ctx.beginPath();
  ctx.moveTo(34, 55); ctx.quadraticCurveTo(18, 90, 22, 148);
  ctx.quadraticCurveTo(28, 160, 36, 148);
  ctx.quadraticCurveTo(30, 100, 40, 60);
  ctx.fillStyle = "#c03010"; ctx.fill();
  // Right side hair
  ctx.beginPath();
  ctx.moveTo(94, 55); ctx.quadraticCurveTo(110, 90, 106, 148);
  ctx.quadraticCurveTo(100, 160, 92, 148);
  ctx.quadraticCurveTo(98, 100, 88, 60);
  ctx.fillStyle = "#c03010"; ctx.fill();

  // Eyebrows
  ctx.strokeStyle = "#882200"; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(44, 54); ctx.quadraticCurveTo(54, 50, 62, 54); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(66, 54); ctx.quadraticCurveTo(74, 50, 84, 54); ctx.stroke();

  // Eyes
  ellipse(ctx, 52, 64, 7, 8, "#fff");
  ellipse(ctx, 76, 64, 7, 8, "#fff");
  ellipse(ctx, 52, 64, 4, 4.5, "#2244aa");
  ellipse(ctx, 76, 64, 4, 4.5, "#2244aa");
  ellipse(ctx, 52, 64, 2, 2, "#111");
  ellipse(ctx, 76, 64, 2, 2, "#111");
  // Eyelashes
  ctx.strokeStyle = "#111"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(46, 58); ctx.lineTo(44, 54); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(58, 57); ctx.lineTo(58, 53); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(70, 57); ctx.lineTo(70, 53); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(82, 58); ctx.lineTo(84, 54); ctx.stroke();

  // Nose
  ctx.beginPath();
  ctx.moveTo(62, 70); ctx.lineTo(60, 76); ctx.lineTo(66, 76);
  ctx.strokeStyle = "#c09070"; ctx.lineWidth = 1.5; ctx.stroke();

  // Mouth — slight smirk with lipstick
  ellipse(ctx, 64, 84, 10, 4, "#cc4466");
  ctx.beginPath();
  ctx.moveTo(54, 83); ctx.quadraticCurveTo(64, 89, 74, 83);
  ctx.strokeStyle = "#aa2244"; ctx.lineWidth = 2; ctx.stroke();

  // Arms
  rect(ctx, 2, 100, 26, 50, TOP, 8);
  rect(ctx, 100, 100, 26, 50, TOP, 8);
  ellipse(ctx, 15, 154, 10, 10, SKIN);
  ellipse(ctx, 113, 154, 10, 10, SKIN);

  // Skirt / pants
  rect(ctx, 26, 174, 76, 18, "#6644aa", 4);
  // Legs
  rect(ctx, 32, 188, 22, 6, SKIN, 3);
  rect(ctx, 74, 188, 22, 6, SKIN, 3);
}

// ─── Beth Smith ───────────────────────────────────────────────────────────────
function drawBeth(ctx: CanvasRenderingContext2D) {
  const SKIN = "#f0c8a0";
  const COAT = "#f0f0f0";

  // White vet coat
  rect(ctx, 24, 96, 80, 82, COAT, 8);
  ctx.beginPath(); ctx.rect(24, 96, 80, 82); outline(ctx, "#ccc", 2);
  // Scrubs underneath (teal)
  rect(ctx, 44, 100, 40, 72, "#5bbcaa", 4);

  // Neck
  ellipse(ctx, 64, 94, 10, 7, SKIN);

  // Head
  ctx.beginPath();
  ctx.ellipse(64, 64, 28, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = SKIN; ctx.fill();
  ctx.strokeStyle = "#c09070"; ctx.lineWidth = 1.5; ctx.stroke();

  // Blonde bob hair
  ctx.fillStyle = "#e8c840";
  ctx.beginPath();
  ctx.ellipse(64, 42, 32, 26, 0, 0, Math.PI * 2); ctx.fill();
  // Side hair left
  ctx.beginPath();
  ctx.moveTo(36, 56); ctx.quadraticCurveTo(26, 80, 30, 100);
  ctx.quadraticCurveTo(36, 108, 42, 98); ctx.quadraticCurveTo(34, 80, 40, 60);
  ctx.fillStyle = "#d8b830"; ctx.fill();
  // Side hair right
  ctx.beginPath();
  ctx.moveTo(92, 56); ctx.quadraticCurveTo(102, 80, 98, 100);
  ctx.quadraticCurveTo(92, 108, 86, 98); ctx.quadraticCurveTo(94, 80, 88, 60);
  ctx.fillStyle = "#d8b830"; ctx.fill();

  // Eyebrows
  ctx.strokeStyle = "#a88020"; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(44, 52); ctx.quadraticCurveTo(55, 48, 62, 52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(66, 52); ctx.quadraticCurveTo(73, 48, 84, 52); ctx.stroke();

  // Eyes — almond shaped
  ellipse(ctx, 52, 62, 8, 6, "#fff");
  ellipse(ctx, 76, 62, 8, 6, "#fff");
  ellipse(ctx, 52, 62, 4, 4, "#22667a");
  ellipse(ctx, 76, 62, 4, 4, "#22667a");
  ellipse(ctx, 52, 62, 2, 2, "#111");
  ellipse(ctx, 76, 62, 2, 2, "#111");
  ellipse(ctx, 53, 61, 1.5, 1.5, "#fff");
  ellipse(ctx, 77, 61, 1.5, 1.5, "#fff");

  // Nose — refined
  ctx.beginPath();
  ctx.moveTo(62, 68); ctx.lineTo(60, 74); ctx.lineTo(66, 75);
  ctx.strokeStyle = "#c09070"; ctx.lineWidth = 1.5; ctx.stroke();

  // Mouth — confident half smile
  ctx.beginPath();
  ctx.moveTo(52, 82); ctx.quadraticCurveTo(64, 88, 76, 82);
  ctx.strokeStyle = "#cc6655"; ctx.lineWidth = 2; ctx.stroke();
  ellipse(ctx, 64, 83, 8, 3, "#dd7766");

  // Wine glass in right hand
  ctx.strokeStyle = "#cc4488"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(106, 110); ctx.lineTo(110, 140); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(108, 108, 8, 10, 0, 0, Math.PI); ctx.fillStyle = "#dd4488"; ctx.fill();
  ctx.beginPath(); ctx.moveTo(104, 140); ctx.lineTo(116, 140); ctx.strokeStyle = "#cc4488"; ctx.stroke();

  // Arms
  rect(ctx, 2, 98, 24, 50, COAT, 8);
  rect(ctx, 102, 98, 24, 50, COAT, 8);
  ellipse(ctx, 14, 150, 10, 10, SKIN);
  ellipse(ctx, 114, 150, 10, 10, SKIN);

  // Skirt
  ctx.beginPath();
  ctx.moveTo(24, 174); ctx.lineTo(8, 192); ctx.lineTo(120, 192); ctx.lineTo(104, 174);
  ctx.fillStyle = "#335577"; ctx.fill();
  // Shoes
  ellipse(ctx, 32, 192, 12, 5, "#222");
  ellipse(ctx, 96, 192, 12, 5, "#222");
}

// ─── Jerry Smith ─────────────────────────────────────────────────────────────
function drawJerry(ctx: CanvasRenderingContext2D) {
  const SKIN = "#f0c890";
  const SHIRT = "#6688cc";

  // Shirt + tie
  rect(ctx, 26, 100, 76, 78, SHIRT, 8);
  ctx.beginPath(); ctx.rect(26, 100, 76, 78); outline(ctx, "#445599", 2);
  // Tie
  ctx.beginPath();
  ctx.moveTo(64, 102); ctx.lineTo(58, 118); ctx.lineTo(64, 160); ctx.lineTo(70, 118);
  ctx.fillStyle = "#cc3333"; ctx.fill();

  // Neck
  ellipse(ctx, 64, 98, 9, 7, SKIN);

  // Head — weak chin, slightly droopy
  ctx.beginPath();
  ctx.ellipse(64, 65, 28, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = SKIN; ctx.fill();
  ctx.strokeStyle = "#c09060"; ctx.lineWidth = 1.5; ctx.stroke();
  // Weak chin
  ctx.beginPath();
  ctx.ellipse(64, 90, 18, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = SKIN; ctx.fill();

  // Brown hair — receding
  ctx.fillStyle = "#7a5030";
  ctx.beginPath();
  ctx.arc(64, 45, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
  // Side hair
  ctx.beginPath();
  ctx.ellipse(38, 54, 10, 14, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(90, 54, 10, 14, 0.3, 0, Math.PI * 2); ctx.fill();

  // Eyebrows — droopy sad
  ctx.strokeStyle = "#6a4020"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(44, 57); ctx.quadraticCurveTo(52, 55, 60, 58); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(68, 58); ctx.quadraticCurveTo(76, 55, 84, 57); ctx.stroke();

  // Eyes — droopy, slightly sad
  ellipse(ctx, 52, 66, 7, 7, "#fff");
  ellipse(ctx, 76, 66, 7, 7, "#fff");
  ellipse(ctx, 52, 67, 4, 4, "#3355aa");
  ellipse(ctx, 76, 67, 4, 4, "#3355aa");
  ellipse(ctx, 52, 67, 2, 2, "#111");
  ellipse(ctx, 76, 67, 2, 2, "#111");
  // Droopy lower eyelid
  ctx.strokeStyle = "#c09060"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(45, 71); ctx.quadraticCurveTo(52, 74, 59, 71); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(69, 71); ctx.quadraticCurveTo(76, 74, 83, 71); ctx.stroke();

  // Nose — bigger
  ctx.beginPath();
  ctx.ellipse(64, 76, 7, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#d8a870"; ctx.fill();
  ctx.beginPath();
  ctx.ellipse(60, 78, 3, 2, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#c09060"; ctx.fill();
  ctx.beginPath();
  ctx.ellipse(68, 78, 3, 2, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#c09060"; ctx.fill();

  // Mouth — big dopey smile
  ctx.beginPath();
  ctx.moveTo(48, 86); ctx.quadraticCurveTo(64, 96, 80, 86);
  ctx.strokeStyle = "#777"; ctx.lineWidth = 2; ctx.stroke();
  ellipse(ctx, 64, 89, 10, 5, "#ddaa88");
  // Teeth
  ctx.beginPath();
  ctx.rect(55, 85, 18, 6);
  ctx.fillStyle = "#fff"; ctx.fill();

  // Ears
  ellipse(ctx, 36, 66, 6, 9, SKIN);
  ellipse(ctx, 92, 66, 6, 9, SKIN);

  // Arms
  rect(ctx, 2, 102, 26, 50, SHIRT, 8);
  rect(ctx, 100, 102, 26, 50, SHIRT, 8);
  ellipse(ctx, 15, 156, 11, 11, SKIN);
  ellipse(ctx, 113, 156, 11, 11, SKIN);

  // Pants
  rect(ctx, 26, 175, 32, 18, "#334455", 4);
  rect(ctx, 70, 175, 32, 18, "#334455", 4);
  // Shoes
  rect(ctx, 22, 187, 36, 8, "#222", 4);
  rect(ctx, 70, 187, 36, 8, "#222", 4);
}

// ─── Public API ───────────────────────────────────────────────────────────────
const DRAW_FN: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
  rick:   drawRick,
  morty:  drawMorty,
  summer: drawSummer,
  beth:   drawBeth,
  jerry:  drawJerry,
};

const cache: Record<string, THREE.CanvasTexture> = {};

export function getCharacterTexture(id: string): THREE.CanvasTexture {
  if (cache[id]) return cache[id];
  const fn = DRAW_FN[id];
  if (!fn) return getCharacterTexture("morty");
  const tex = makeTexture(fn);
  cache[id] = tex;
  return tex;
}

export const SPRITE_W = W;
export const SPRITE_H = H;
