import Phaser from "phaser";
import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";

export interface GameEventPayload {
  type: "room_change" | "gadget_pickup" | "npc_interact" | "rick_angry" | "notification";
  data: Record<string, unknown>;
}

export type GameEventCallback = (event: GameEventPayload) => void;

const TILE = 48;
const PLAYER_SPEED = 160;

// 0=floor  1=wall  2=door  3=furniture/table  4=sofa  5=workbench  6=plant  7=TV  8=portal
const HOUSE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 4, 0, 4, 0, 1, 0, 0, 0, 0, 0, 7, 1],
  [1, 5, 0, 8, 0, 5, 1, 0, 0, 0, 0, 0, 1, 0, 3, 3, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 6, 0, 0, 0, 6, 1, 0, 3, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 6, 0, 0, 0, 6, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const ROOM_ZONES: { id: RoomId; rows: [number, number]; cols: [number, number] }[] = [
  { id: "garage",  rows: [1, 5],   cols: [1, 5]  },
  { id: "salon",   rows: [1, 5],   cols: [7, 11] },
  { id: "cuisine", rows: [1, 5],   cols: [13, 18]},
  { id: "couloir", rows: [7, 10],  cols: [1, 18] },
  { id: "jardin",  rows: [12, 15], cols: [1, 18] },
];

const NPC_POSITIONS: Record<string, { col: number; row: number }> = {
  rick:   { col: 2, row: 3 },
  morty:  { col: 14, row: 13 },
  summer: { col: 16, row: 13 },
  beth:   { col: 9, row: 2 },
  jerry:  { col: 8, row: 8 },
};

const GADGET_POSITIONS: Record<string, { col: number; row: number }> = {
  portal_gun:             { col: 3, row: 2 },
  meeseeks_box:           { col: 4, row: 4 },
  freeze_ray:             { col: 2, row: 4 },
  shrink_ray:             { col: 5, row: 2 },
  butter_robot:           { col: 3, row: 4 },
  love_potion:            { col: 5, row: 4 },
  interdimensional_cable: { col: 9, row: 8 },
  plumbus:                { col: 11, row: 8 },
};

// Room floor colors — visible against black background
const FLOOR_COLORS: Record<RoomId, { base: number; grid: number }> = {
  garage:  { base: 0x1c2a3a, grid: 0x00ff88 },
  salon:   { base: 0x2a1f1a, grid: 0xff8844 },
  cuisine: { base: 0x1a2a2a, grid: 0x44ddff },
  couloir: { base: 0x1a1a1a, grid: 0x888888 },
  jardin:  { base: 0x0f2010, grid: 0x44ff44 },
};

export class HouseScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Arc;
  private playerLabel!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private npcObjects: Map<string, Phaser.GameObjects.Container> = new Map();
  private gadgetObjects: Map<string, Phaser.GameObjects.Container> = new Map();
  private pickedUpGadgets: Set<string> = new Set();
  private currentRoom: RoomId = "couloir";
  private eventCallback?: GameEventCallback;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private nearNpc: string | null = null;
  private nearGadget: string | null = null;
  private characterId: CharacterId = "rick";
  private promptText?: Phaser.GameObjects.Text;
  public touchInput: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    super({ key: "HouseScene" });
  }

  init(data: { characterId: CharacterId; onEvent: GameEventCallback }) {
    this.characterId = data.characterId;
    this.eventCallback = data.onEvent;
  }

  create() {
    const mapW = HOUSE_MAP[0].length * TILE;
    const mapH = HOUSE_MAP.length * TILE;

    this.cameras.main.setBackgroundColor("#0a0a0a");
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.physics.world.setBounds(0, 0, mapW, mapH);

    this.drawMap();
    this.createPlayer();
    this.createNPCs();
    this.createGadgets();
    this.setupInput();
    this.createPromptLabel();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  // ─── Map drawing ──────────────────────────────────────────────────────────

  private drawMap() {
    this.walls = this.physics.add.staticGroup();

    // First pass: draw floors with colored tiles per room
    for (let row = 0; row < HOUSE_MAP.length; row++) {
      for (let col = 0; col < HOUSE_MAP[0].length; col++) {
        const tile = HOUSE_MAP[row][col];
        if (tile === 0 || tile >= 3) {
          this.drawFloor(row, col);
        }
      }
    }

    // Second pass: walls, doors, furniture
    for (let row = 0; row < HOUSE_MAP.length; row++) {
      for (let col = 0; col < HOUSE_MAP[0].length; col++) {
        const tile = HOUSE_MAP[row][col];
        const x = col * TILE + TILE / 2;
        const y = row * TILE + TILE / 2;

        if (tile === 1) {
          this.drawWall(x, y);
        } else if (tile === 2) {
          this.drawDoor(x, y, row, col);
        } else if (tile === 3) {
          this.drawTable(x, y, row, col);
        } else if (tile === 4) {
          this.drawSofa(x, y);
        } else if (tile === 5) {
          this.drawWorkbench(x, y);
        } else if (tile === 6) {
          this.drawPlant(x, y);
        } else if (tile === 7) {
          this.drawTV(x, y);
        } else if (tile === 8) {
          this.drawPortalMachine(x, y);
        }
      }
    }

    this.drawRoomLabels();
  }

  private drawFloor(row: number, col: number) {
    const x = col * TILE + TILE / 2;
    const y = row * TILE + TILE / 2;

    const zone = ROOM_ZONES.find(
      (z) => row >= z.rows[0] && row <= z.rows[1] && col >= z.cols[0] && col <= z.cols[1]
    );
    const colors = zone ? FLOOR_COLORS[zone.id] : FLOOR_COLORS.couloir;

    // Base tile
    this.add.rectangle(x, y, TILE, TILE, colors.base).setDepth(0);
    // Grid lines for visibility
    const g = this.add.graphics().setDepth(0);
    g.lineStyle(1, colors.grid, 0.18);
    g.strokeRect(col * TILE, row * TILE, TILE, TILE);
  }

  private drawWall(x: number, y: number) {
    // Dark base
    this.add.rectangle(x, y, TILE, TILE, 0x111827).setDepth(1);
    // Bright border
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(2, 0x39ff14, 0.6);
    g.strokeRect(x - TILE / 2, y - TILE / 2, TILE, TILE);
    // Subtle inner fill pattern
    g.fillStyle(0x39ff14, 0.04);
    g.fillRect(x - TILE / 2 + 2, y - TILE / 2 + 2, TILE - 4, TILE - 4);

    // Physics wall (invisible)
    const physWall = this.physics.add.staticImage(x, y, "__DEFAULT");
    physWall.setDisplaySize(TILE, TILE);
    physWall.setAlpha(0);
    this.walls.add(physWall);
  }

  private drawDoor(x: number, y: number, row: number, col: number) {
    // Floor under door
    this.drawFloor(row, col);
    // Door frame
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(x - 16, y - TILE / 2, 32, TILE);
    g.lineStyle(2, 0xffd60a, 0.9);
    g.strokeRect(x - 16, y - TILE / 2, 32, TILE);
    // Door knob
    g.fillStyle(0xffd60a, 1);
    g.fillCircle(x + 10, y, 3);
    // Label
    this.add.text(x, y - 18, "🚪", { fontSize: "14px" }).setOrigin(0.5).setDepth(3);
  }

  private drawTable(x: number, y: number, row: number, col: number) {
    this.drawFloor(row, col);
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x5c3d1e, 1);
    g.fillRoundedRect(x - 18, y - 14, 36, 28, 4);
    g.lineStyle(1, 0xc8a96e, 0.8);
    g.strokeRoundedRect(x - 18, y - 14, 36, 28, 4);
  }

  private drawSofa(x: number, y: number) {
    const g = this.add.graphics().setDepth(2);
    // Sofa body
    g.fillStyle(0x4a2d6b, 1);
    g.fillRoundedRect(x - 20, y - 12, 40, 24, 6);
    g.lineStyle(1, 0xaa88ff, 0.8);
    g.strokeRoundedRect(x - 20, y - 12, 40, 24, 6);
    // Cushion divider
    g.lineStyle(1, 0xaa88ff, 0.4);
    g.lineBetween(x, y - 12, x, y + 12);
    // Emoji
    this.add.text(x, y, "🛋️", { fontSize: "18px" }).setOrigin(0.5).setDepth(3);
  }

  private drawWorkbench(x: number, y: number) {
    const g = this.add.graphics().setDepth(2);
    // Metal bench
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(x - 20, y - 14, 40, 28);
    g.lineStyle(2, 0x00ff88, 0.7);
    g.strokeRect(x - 20, y - 14, 40, 28);
    // Top highlight
    g.lineStyle(1, 0x00ff88, 0.3);
    g.lineBetween(x - 18, y - 10, x + 18, y - 10);
    // Beakers/tools icon
    this.add.text(x, y, "⚗️", { fontSize: "14px" }).setOrigin(0.5).setDepth(3);
  }

  private drawPlant(x: number, y: number) {
    const g = this.add.graphics().setDepth(2);
    // Pot
    g.fillStyle(0x8b4513, 1);
    g.fillRect(x - 10, y + 2, 20, 14);
    g.lineStyle(1, 0xc8a96e, 0.6);
    g.strokeRect(x - 10, y + 2, 20, 14);
    // Plant
    this.add.text(x, y - 4, "🌿", { fontSize: "20px" }).setOrigin(0.5).setDepth(3);
  }

  private drawTV(x: number, y: number) {
    const g = this.add.graphics().setDepth(2);
    // TV screen
    g.fillStyle(0x001122, 1);
    g.fillRect(x - 20, y - 14, 40, 28);
    g.lineStyle(2, 0x44ddff, 0.9);
    g.strokeRect(x - 20, y - 14, 40, 28);
    // Screen glow
    g.fillStyle(0x44ddff, 0.1);
    g.fillRect(x - 18, y - 12, 36, 24);
    // Stand
    g.fillStyle(0x333333, 1);
    g.fillRect(x - 4, y + 14, 8, 6);
    this.add.text(x, y, "📺", { fontSize: "16px" }).setOrigin(0.5).setDepth(3);
  }

  private drawPortalMachine(x: number, y: number) {
    const g = this.add.graphics().setDepth(2);
    // Portal swirl
    g.fillStyle(0x00ff88, 0.15);
    g.fillCircle(x, y, 18);
    g.lineStyle(3, 0x00ff88, 0.9);
    g.strokeCircle(x, y, 18);
    g.lineStyle(2, 0x00cc66, 0.6);
    g.strokeCircle(x, y, 12);
    g.lineStyle(1, 0x00aa44, 0.4);
    g.strokeCircle(x, y, 6);
    this.add.text(x, y, "🌀", { fontSize: "22px" }).setOrigin(0.5).setDepth(3);
  }

  private drawRoomLabels() {
    const labels: { id: RoomId; row: number; col: number; color: string }[] = [
      { id: "garage",  row: 1, col: 1,  color: "#00ff88" },
      { id: "salon",   row: 1, col: 7,  color: "#ff8844" },
      { id: "cuisine", row: 1, col: 13, color: "#44ddff" },
      { id: "couloir", row: 7, col: 1,  color: "#aaaaaa" },
      { id: "jardin",  row: 12, col: 1, color: "#44ff44" },
    ];
    labels.forEach(({ id, row, col, color }) => {
      const room = ROOMS[id];
      this.add
        .text(col * TILE + 6, row * TILE + 6, `${room.emoji} ${room.name}`, {
          fontSize: "10px",
          color,
          fontFamily: "monospace",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setDepth(4);
    });
  }

  // ─── Player ───────────────────────────────────────────────────────────────

  private createPlayer() {
    const char = CHARACTERS[this.characterId];
    const startX = 9 * TILE + TILE / 2;
    const startY = 8 * TILE + TILE / 2;
    const color = parseInt(char.color.replace("#", ""), 16);

    // Shadow
    const shadow = this.add.ellipse(0, 18, 28, 10, 0x000000, 0.4);

    // Body circle with glow
    this.playerBody = this.add.circle(0, 0, 18, color, 1);
    this.playerBody.setStrokeStyle(3, 0xffffff, 0.9);

    // Emoji
    const emoji = this.add.text(0, 0, char.emoji, { fontSize: "22px" }).setOrigin(0.5);

    // Name tag
    this.playerLabel = this.add
      .text(0, 26, char.name.split(" ")[0], {
        fontSize: "10px",
        color: char.color,
        fontFamily: "monospace",
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: { x: 4, y: 2 },
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.player = this.add.container(startX, startY, [shadow, this.playerBody, emoji, this.playerLabel]);
    this.player.setDepth(10);

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(30, 30);
    body.setOffset(-15, -15);

    this.physics.add.collider(this.player, this.walls);
  }

  // ─── NPCs ─────────────────────────────────────────────────────────────────

  private createNPCs() {
    Object.entries(NPC_POSITIONS).forEach(([id, pos]) => {
      if (id === this.characterId) return;
      const char = CHARACTERS[id as CharacterId];
      if (!char) return;

      const color = parseInt(char.color.replace("#", ""), 16);
      const x = pos.col * TILE + TILE / 2;
      const y = pos.row * TILE + TILE / 2;

      // Glow ring
      const ring = this.add.circle(0, 0, 22, color, 0.15);
      ring.setStrokeStyle(1, color, 0.6);

      // Body
      const body = this.add.circle(0, 0, 16, color, 0.9);
      body.setStrokeStyle(2, 0xffffff, 0.6);

      // Emoji
      const emojiTxt = this.add.text(0, 0, char.emoji, { fontSize: "18px" }).setOrigin(0.5);

      // Name tag
      const label = this.add
        .text(0, 24, char.name.split(" ")[0], {
          fontSize: "9px",
          color: char.color,
          fontFamily: "monospace",
          backgroundColor: "rgba(0,0,0,0.85)",
          padding: { x: 3, y: 1 },
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      // "Parler" hint
      const hint = this.add
        .text(0, -30, "💬", { fontSize: "12px" })
        .setOrigin(0.5)
        .setAlpha(0.7);

      const npcContainer = this.add.container(x, y, [ring, body, emojiTxt, label, hint]);
      npcContainer.setDepth(9);

      this.tweens.add({
        targets: npcContainer,
        y: y - 5,
        duration: 1500 + (id.charCodeAt(0) % 4) * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.npcObjects.set(id, npcContainer);
    });
  }

  // ─── Gadgets ──────────────────────────────────────────────────────────────

  private createGadgets() {
    Object.entries(GADGET_POSITIONS).forEach(([id, pos]) => {
      const gadget = GADGETS.find((g) => g.id === id);
      if (!gadget) return;

      const x = pos.col * TILE + TILE / 2;
      const y = pos.row * TILE + TILE / 2;
      const col = parseInt(gadget.color.replace("#", ""), 16);

      // Outer glow
      const glow = this.add.circle(0, 0, 20, col, 0.12);
      glow.setStrokeStyle(2, col, 0.5);

      // Inner circle
      const inner = this.add.circle(0, 0, 13, col, 0.3);
      inner.setStrokeStyle(1, col, 0.9);

      // Emoji
      const emojiTxt = this.add.text(0, 0, gadget.emoji, { fontSize: "18px" }).setOrigin(0.5);

      const container = this.add.container(x, y, [glow, inner, emojiTxt]);
      container.setDepth(5);

      this.tweens.add({
        targets: container,
        y: y - 6,
        duration: 900 + (id.charCodeAt(0) % 5) * 120,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.gadgetObjects.set(id, container);
    });
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  private setupInput() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on("down", () => this.handleInteract());
  }

  private createPromptLabel() {
    this.promptText = this.add
      .text(0, 0, "", {
        fontSize: "11px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.9)",
        padding: { x: 8, y: 4 },
        fontFamily: "monospace",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setDepth(20)
      .setAlpha(0);
  }

  // ─── Update loop ──────────────────────────────────────────────────────────

  update() {
    if (!this.player?.body) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    const kbVx =
      (this.cursors?.left?.isDown || this.wasd?.left?.isDown ? -1 : 0) +
      (this.cursors?.right?.isDown || this.wasd?.right?.isDown ? 1 : 0);
    const kbVy =
      (this.cursors?.up?.isDown || this.wasd?.up?.isDown ? -1 : 0) +
      (this.cursors?.down?.isDown || this.wasd?.down?.isDown ? 1 : 0);

    const rawVx = kbVx !== 0 ? kbVx : this.touchInput.x;
    const rawVy = kbVy !== 0 ? kbVy : this.touchInput.y;

    const len = Math.sqrt(rawVx * rawVx + rawVy * rawVy) || 1;
    const speed = len > 0.1 ? PLAYER_SPEED : 0;
    body.setVelocity((rawVx / len) * speed, (rawVy / len) * speed);

    this.checkRoomChange();
    this.checkProximity();
    this.updatePrompt();
  }

  private checkRoomChange() {
    const col = Math.floor(this.player.x / TILE);
    const row = Math.floor(this.player.y / TILE);
    const zone = ROOM_ZONES.find(
      (z) => row >= z.rows[0] && row <= z.rows[1] && col >= z.cols[0] && col <= z.cols[1]
    );
    const newRoom = zone?.id ?? "couloir";
    if (newRoom !== this.currentRoom) {
      this.currentRoom = newRoom;
      this.eventCallback?.({ type: "room_change", data: { room: newRoom, roomName: ROOMS[newRoom].name } });
    }
  }

  private checkProximity() {
    this.nearNpc = null;
    this.nearGadget = null;
    const threshold = TILE * 1.6;

    this.npcObjects.forEach((container, id) => {
      const dx = this.player.x - container.x;
      const dy = this.player.y - container.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) this.nearNpc = id;
    });

    this.gadgetObjects.forEach((container, id) => {
      if (this.pickedUpGadgets.has(id)) return;
      const dx = this.player.x - container.x;
      const dy = this.player.y - container.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) this.nearGadget = id;
    });
  }

  private updatePrompt() {
    if (!this.promptText) return;
    const cam = this.cameras.main;

    if (this.nearNpc) {
      const char = CHARACTERS[this.nearNpc as CharacterId];
      this.promptText.setText(`[E] Parler à ${char.name}`);
      this.promptText.setAlpha(1);
      this.promptText.setPosition(
        this.player.x - cam.scrollX - this.promptText.width / 2,
        this.player.y - cam.scrollY - 50
      );
    } else if (this.nearGadget) {
      const gadget = GADGETS.find((g) => g.id === this.nearGadget);
      this.promptText.setText(`[E] Prendre ${gadget?.name}`);
      this.promptText.setAlpha(1);
      this.promptText.setPosition(
        this.player.x - cam.scrollX - this.promptText.width / 2,
        this.player.y - cam.scrollY - 50
      );
    } else {
      this.promptText.setAlpha(0);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  public triggerInteract() {
    this.handleInteract();
  }

  public hasNearbyTarget(): boolean {
    return this.nearNpc !== null || this.nearGadget !== null;
  }

  private handleInteract() {
    if (this.nearNpc) {
      const char = CHARACTERS[this.nearNpc as CharacterId];
      this.eventCallback?.({ type: "npc_interact", data: { npcId: this.nearNpc, npcName: char.name } });
      const npcContainer = this.npcObjects.get(this.nearNpc);
      if (npcContainer) {
        this.tweens.add({ targets: npcContainer, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true });
      }
    } else if (this.nearGadget) {
      const gadget = GADGETS.find((g) => g.id === this.nearGadget);
      if (!gadget) return;

      this.pickedUpGadgets.add(this.nearGadget);
      const container = this.gadgetObjects.get(this.nearGadget);
      if (container) {
        this.tweens.add({
          targets: container,
          y: container.y - 30,
          alpha: 0,
          duration: 400,
          onComplete: () => container.setVisible(false),
        });
      }

      this.eventCallback?.({
        type: "gadget_pickup",
        data: { gadgetId: gadget.id, gadgetName: gadget.name, isRickItem: gadget.isRickItem },
      });

      if (gadget.isRickItem && this.characterId !== "rick") {
        setTimeout(() => {
          this.eventCallback?.({ type: "rick_angry", data: { gadgetName: gadget.name } });
        }, 600);
      }
    }
  }

  getCurrentRoom(): RoomId {
    return this.currentRoom;
  }
}
