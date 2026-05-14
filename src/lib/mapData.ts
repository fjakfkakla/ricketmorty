import { RoomId } from "./gadgets";

// 0=floor  1=wall  2=door  3=table  4=sofa  5=workbench  6=plant  7=TV  8=portal
export const HOUSE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,4,0,4,0,1,0,0,0,0,0,7,1],
  [1,5,0,8,0,5,1,0,0,0,0,0,1,0,3,3,3,0,0,1],
  [1,0,0,0,0,0,1,4,0,0,0,4,1,0,0,0,0,0,0,1],
  [1,5,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,3,0,0,0,0,0,0,0,3,0,0,0,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,6,0,0,0,6,1,0,3,0,3,0,0,0,3,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,6,0,0,0,6,1,0,0,0,0,0,0,0,0,0,0,0,6,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
] as const;

export const MAP_COLS = HOUSE_MAP[0].length;
export const MAP_ROWS = HOUSE_MAP.length;

export const ROOM_ZONES_3D: { id: RoomId; rows: [number,number]; cols: [number,number] }[] = [
  { id: "garage",  rows: [1,5],   cols: [1,5]  },
  { id: "salon",   rows: [1,5],   cols: [7,11] },
  { id: "cuisine", rows: [1,5],   cols: [13,18]},
  { id: "couloir", rows: [7,10],  cols: [1,18] },
  { id: "jardin",  rows: [12,15], cols: [1,18] },
];

export function getRoomAt(row: number, col: number): RoomId | null {
  const zone = ROOM_ZONES_3D.find(
    z => row >= z.rows[0] && row <= z.rows[1] && col >= z.cols[0] && col <= z.cols[1]
  );
  return zone?.id ?? null;
}

export function isWall(row: number, col: number): boolean {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return true;
  return HOUSE_MAP[row][col] === 1;
}

export const ROOM_FLOOR_COLORS: Record<RoomId, string> = {
  garage:  "#0e2233",
  salon:   "#2a1a10",
  cuisine: "#0a1f22",
  couloir: "#141414",
  jardin:  "#0a1f0a",
};

export const ROOM_ACCENT_COLORS: Record<RoomId, string> = {
  garage:  "#00ff88",
  salon:   "#ff8844",
  cuisine: "#44ddff",
  couloir: "#888888",
  jardin:  "#44ff44",
};

export const ROOM_LIGHT_COLORS: Record<RoomId, string> = {
  garage:  "#00ff88",
  salon:   "#ff6622",
  cuisine: "#22ccff",
  couloir: "#aaaaaa",
  jardin:  "#66ff66",
};

export const NPC_POSITIONS_3D: Record<string, { col: number; row: number }> = {
  rick:   { col: 2,  row: 3  },
  morty:  { col: 14, row: 13 },
  summer: { col: 16, row: 13 },
  beth:   { col: 9,  row: 2  },
  jerry:  { col: 8,  row: 8  },
};

export const GADGET_POSITIONS_3D: Record<string, { col: number; row: number }> = {
  portal_gun:             { col: 3,  row: 2 },
  meeseeks_box:           { col: 4,  row: 4 },
  freeze_ray:             { col: 2,  row: 4 },
  shrink_ray:             { col: 5,  row: 2 },
  butter_robot:           { col: 3,  row: 4 },
  love_potion:            { col: 5,  row: 4 },
  interdimensional_cable: { col: 9,  row: 8 },
  plumbus:                { col: 11, row: 8 },
};
