import Phaser from "phaser";
import { CharacterId, CHARACTERS } from "@/lib/characters";
import { GADGETS, ROOMS, RoomId } from "@/lib/gadgets";

export interface GameEventPayload {
  type:
    | "room_change"
    | "gadget_pickup"
    | "npc_interact"
    | "rick_angry"
    | "notification";
  data: Record<string, unknown>;
}

export type GameEventCallback = (event: GameEventPayload) => void;

const TILE = 48;
const PLAYER_SPEED = 160;

// House layout — 0=floor, 1=wall, 2=door, 3=furniture
const HOUSE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 3, 0, 3, 0, 1, 0, 3, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 3, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 3, 0, 0, 0, 1, 0, 3, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const ROOM_ZONES: { id: RoomId; rows: [number, number]; cols: [number, number] }[] = [
  { id: "garage", rows: [1, 5], cols: [1, 5] },
  { id: "salon", rows: [1, 5], cols: [7, 11] },
  { id: "cuisine", rows: [1, 5], cols: [13, 18] },
  { id: "couloir", rows: [7, 10], cols: [1, 18] },
  { id: "jardin", rows: [12, 15], cols: [1, 18] },
];

const NPC_POSITIONS: Record<string, { col: number; row: number }> = {
  rick: { col: 2, row: 3 },
  morty: { col: 14, row: 13 },
  summer: { col: 16, row: 13 },
  beth: { col: 9, row: 2 },
  jerry: { col: 8, row: 8 },
};

const GADGET_POSITIONS: Record<string, { col: number; row: number }> = {
  portal_gun: { col: 3, row: 2 },
  meeseeks_box: { col: 4, row: 4 },
  freeze_ray: { col: 2, row: 4 },
  shrink_ray: { col: 5, row: 2 },
  butter_robot: { col: 3, row: 4 },
  love_potion: { col: 5, row: 4 },
  interdimensional_cable: { col: 9, row: 8 },
  plumbus: { col: 11, row: 8 },
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
  private playerVx = 0;
  private playerVy = 0;

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

  private drawMap() {
    this.walls = this.physics.add.staticGroup();

    for (let row = 0; row < HOUSE_MAP.length; row++) {
      for (let col = 0; col < HOUSE_MAP[0].length; col++) {
        const tile = HOUSE_MAP[row][col];
        const x = col * TILE + TILE / 2;
        const y = row * TILE + TILE / 2;

        if (tile === 0) {
          // Floor
          const floorColor = this.getFloorColor(row, col);
          this.add.rectangle(x, y, TILE - 1, TILE - 1, floorColor, 0.8);
        } else if (tile === 1) {
          // Wall
          const wall = this.add.rectangle(x, y, TILE, TILE, 0x1a1a2e);
          wall.setStrokeStyle(1, 0x39ff14, 0.3);
          const physWall = this.physics.add.staticImage(x, y, "__DEFAULT");
          physWall.setDisplaySize(TILE, TILE);
          physWall.setAlpha(0);
          this.walls.add(physWall);
        } else if (tile === 2) {
          // Door
          this.add.rectangle(x, y, TILE - 8, TILE - 4, 0x6b4226).setStrokeStyle(2, 0xffd60a, 0.8);
          this.add.text(x, y, "🚪", { fontSize: "20px" }).setOrigin(0.5);
        } else if (tile === 3) {
          // Furniture
          this.add.rectangle(x, y, TILE - 8, TILE - 8, 0x2d2d4e).setStrokeStyle(1, 0x00b4d8, 0.5);
        }
      }
    }

    // Room labels
    this.drawRoomLabels();
  }

  private getFloorColor(row: number, col: number): number {
    const zone = ROOM_ZONES.find(
      (z) => row >= z.rows[0] && row <= z.rows[1] && col >= z.cols[0] && col <= z.cols[1]
    );
    if (!zone) return 0x111111;
    const colors: Record<RoomId, number> = {
      garage: 0x0d1b2a,
      salon: 0x1a1a2e,
      cuisine: 0x16213e,
      couloir: 0x111111,
      jardin: 0x0d1f0d,
    };
    return colors[zone.id];
  }

  private drawRoomLabels() {
    const labels: { id: RoomId; row: number; col: number }[] = [
      { id: "garage", row: 1, col: 1 },
      { id: "salon", row: 1, col: 7 },
      { id: "cuisine", row: 1, col: 13 },
      { id: "couloir", row: 7, col: 1 },
      { id: "jardin", row: 12, col: 1 },
    ];
    labels.forEach(({ id, row, col }) => {
      const room = ROOMS[id];
      this.add
        .text(col * TILE + TILE, row * TILE + TILE / 2, `${room.emoji} ${room.name}`, {
          fontSize: "11px",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "monospace",
        })
        .setDepth(1);
    });
  }

  private createPlayer() {
    const char = CHARACTERS[this.characterId];
    const startX = 9 * TILE + TILE / 2;
    const startY = 8 * TILE + TILE / 2;

    const color = parseInt(char.color.replace("#", ""), 16);

    this.playerBody = this.add.circle(0, 0, 16, color, 0.9);
    this.playerBody.setStrokeStyle(2, 0xffffff, 0.8);

    const emoji = this.add.text(0, 0, char.emoji, { fontSize: "20px" }).setOrigin(0.5);
    this.playerLabel = this.add
      .text(0, 24, char.name.split(" ")[0], {
        fontSize: "10px",
        color: char.color,
        fontFamily: "monospace",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5);

    this.player = this.add.container(startX, startY, [this.playerBody, emoji, this.playerLabel]);
    this.player.setDepth(10);

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(28, 28);

    this.physics.add.collider(this.player, this.walls);
  }

  private createNPCs() {
    Object.entries(NPC_POSITIONS).forEach(([id, pos]) => {
      if (id === this.characterId) return;
      const char = CHARACTERS[id as CharacterId];
      if (!char) return;

      const color = parseInt(char.color.replace("#", ""), 16);
      const x = pos.col * TILE + TILE / 2;
      const y = pos.row * TILE + TILE / 2;

      const body = this.add.circle(0, 0, 14, color, 0.7);
      body.setStrokeStyle(2, 0xffffff, 0.4);
      const emoji = this.add.text(0, 0, char.emoji, { fontSize: "18px" }).setOrigin(0.5);
      const label = this.add
        .text(0, 22, char.name.split(" ")[0], {
          fontSize: "9px",
          color: char.color,
          fontFamily: "monospace",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: { x: 2, y: 1 },
        })
        .setOrigin(0.5);

      // Idle float anim
      const npcContainer = this.add.container(x, y, [body, emoji, label]);
      npcContainer.setDepth(9);

      this.tweens.add({
        targets: npcContainer,
        y: y - 6,
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.npcObjects.set(id, npcContainer);
    });
  }

  private createGadgets() {
    Object.entries(GADGET_POSITIONS).forEach(([id, pos]) => {
      const gadget = GADGETS.find((g) => g.id === id);
      if (!gadget) return;

      const x = pos.col * TILE + TILE / 2;
      const y = pos.row * TILE + TILE / 2;

      const bg = this.add.circle(0, 0, 12, parseInt(gadget.color.replace("#", ""), 16), 0.3);
      bg.setStrokeStyle(1, parseInt(gadget.color.replace("#", ""), 16), 0.8);
      const emojiText = this.add.text(0, 0, gadget.emoji, { fontSize: "16px" }).setOrigin(0.5);

      const container = this.add.container(x, y, [bg, emojiText]);
      container.setDepth(5);

      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.gadgetObjects.set(id, container);
    });
  }

  private setupInput() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactKey.on("down", () => this.handleInteract());
  }

  private createPromptLabel() {
    this.promptText = this.add
      .text(0, 0, "", {
        fontSize: "10px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: { x: 6, y: 3 },
        fontFamily: "monospace",
      })
      .setDepth(20)
      .setAlpha(0);
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const vx =
      (this.cursors.left.isDown || this.wasd.left.isDown ? -1 : 0) +
      (this.cursors.right.isDown || this.wasd.right.isDown ? 1 : 0);
    const vy =
      (this.cursors.up.isDown || this.wasd.up.isDown ? -1 : 0) +
      (this.cursors.down.isDown || this.wasd.down.isDown ? 1 : 0);

    const len = Math.sqrt(vx * vx + vy * vy) || 1;
    body.setVelocity((vx / len) * PLAYER_SPEED, (vy / len) * PLAYER_SPEED);

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
      this.eventCallback?.({
        type: "room_change",
        data: { room: newRoom, roomName: ROOMS[newRoom].name },
      });
    }
  }

  private checkProximity() {
    this.nearNpc = null;
    this.nearGadget = null;
    const threshold = TILE * 1.5;

    this.npcObjects.forEach((container, id) => {
      const dx = this.player.x - container.x;
      const dy = this.player.y - container.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        this.nearNpc = id;
      }
    });

    this.gadgetObjects.forEach((container, id) => {
      if (this.pickedUpGadgets.has(id)) return;
      const dx = this.player.x - container.x;
      const dy = this.player.y - container.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        this.nearGadget = id;
      }
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
        this.player.y - cam.scrollY - 44
      );
    } else if (this.nearGadget) {
      const gadget = GADGETS.find((g) => g.id === this.nearGadget);
      this.promptText.setText(`[E] Prendre ${gadget?.name}`);
      this.promptText.setAlpha(1);
      this.promptText.setPosition(
        this.player.x - cam.scrollX - this.promptText.width / 2,
        this.player.y - cam.scrollY - 44
      );
    } else {
      this.promptText.setAlpha(0);
    }
  }

  private handleInteract() {
    if (this.nearNpc) {
      const char = CHARACTERS[this.nearNpc as CharacterId];
      this.eventCallback?.({
        type: "npc_interact",
        data: { npcId: this.nearNpc, npcName: char.name },
      });
      // Bounce animation
      const npcContainer = this.npcObjects.get(this.nearNpc);
      if (npcContainer) {
        this.tweens.add({
          targets: npcContainer,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
        });
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
