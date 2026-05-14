export interface Gadget {
  id: string;
  name: string;
  emoji: string;
  description: string;
  owner: string; // "rick" si Rick s'énerve quand on le prend
  effect: string;
  color: string;
  isRickItem: boolean;
}

export const GADGETS: Gadget[] = [
  {
    id: "portal_gun",
    name: "Portal Gun",
    emoji: "🔫",
    description: "Ouvre des portails vers n'importe quelle dimension.",
    owner: "rick",
    effect: "Tu ouvres un portail vert. La pièce tremble légèrement.",
    color: "#39ff14",
    isRickItem: true,
  },
  {
    id: "meeseeks_box",
    name: "Boîte à Meeseeks",
    emoji: "📦",
    description: "Appuie pour invoquer un Meeseeks bleu qui exaucera un vœu.",
    owner: "rick",
    effect: "Un Meeseeks bleu apparaît en criant 'Je suis Mr Meeseeks !'",
    color: "#00b4d8",
    isRickItem: true,
  },
  {
    id: "freeze_ray",
    name: "Rayon Glacial",
    emoji: "❄️",
    description: "Congèle instantanément n'importe quoi.",
    owner: "rick",
    effect: "Tout autour de toi se fige dans un bloc de glace.",
    color: "#caf0f8",
    isRickItem: true,
  },
  {
    id: "shrink_ray",
    name: "Rayon Miniaturiseur",
    emoji: "🔬",
    description: "Réduit les objets (ou les personnes) à taille microscopique.",
    owner: "rick",
    effect: "Tout rétrécit autour de toi de façon vertigineuse.",
    color: "#7fff00",
    isRickItem: true,
  },
  {
    id: "interdimensional_cable",
    name: "Câble Interdimensionnel",
    emoji: "📺",
    description: "Reçoit des chaînes de toutes les dimensions.",
    owner: "family",
    effect: "La TV s'allume sur des émissions complètement absurdes.",
    color: "#ffd60a",
    isRickItem: false,
  },
  {
    id: "butter_robot",
    name: "Robot à Beurre",
    emoji: "🤖",
    description: "Un robot dont le seul but est de passer le beurre.",
    owner: "rick",
    effect: "Le robot te regarde et demande tristement : 'Quel est mon but ?'",
    color: "#e85d04",
    isRickItem: true,
  },
  {
    id: "love_potion",
    name: "Potion d'Amour",
    emoji: "💜",
    description: "Potion qui rend fou amoureux... au sens littéral.",
    owner: "rick",
    effect: "Tout le monde autour de toi te regarde avec des yeux de cœur. Puis ça dégénère.",
    color: "#9b5de5",
    isRickItem: true,
  },
  {
    id: "plumbus",
    name: "Plumbus",
    emoji: "🎋",
    description: "Tout le monde en a un chez soi. C'est utile.",
    owner: "family",
    effect: "Tu tiens un Plumbus. Il est chaud et humide. Tout le monde en a un.",
    color: "#90e0ef",
    isRickItem: false,
  },
];

export type RoomId = "garage" | "salon" | "cuisine" | "jardin" | "couloir";

export interface Room {
  id: RoomId;
  name: string;
  emoji: string;
  description: string;
  gadgets: string[]; // gadget IDs
  npcs: string[]; // character IDs usually found here
  backgroundColor: string;
}

export const ROOMS: Record<RoomId, Room> = {
  garage: {
    id: "garage",
    name: "Garage de Rick",
    emoji: "🔧",
    description: "Le labo secret de Rick. Plein d'inventions dangereuses.",
    gadgets: ["portal_gun", "meeseeks_box", "freeze_ray", "shrink_ray", "butter_robot", "love_potion"],
    npcs: ["rick"],
    backgroundColor: "#0d1b2a",
  },
  salon: {
    id: "salon",
    name: "Salon",
    emoji: "🛋️",
    description: "La pièce à vivre de la famille Smith.",
    gadgets: ["interdimensional_cable", "plumbus"],
    npcs: ["jerry", "beth"],
    backgroundColor: "#1a1a2e",
  },
  cuisine: {
    id: "cuisine",
    name: "Cuisine",
    emoji: "🍳",
    description: "Beth cuisine des plats pour la famille.",
    gadgets: [],
    npcs: ["beth"],
    backgroundColor: "#16213e",
  },
  jardin: {
    id: "jardin",
    name: "Jardin",
    emoji: "🌿",
    description: "Le jardin de la maison Smith. Plus calme que le reste.",
    gadgets: [],
    npcs: ["summer", "morty"],
    backgroundColor: "#1b2a1b",
  },
  couloir: {
    id: "couloir",
    name: "Couloir",
    emoji: "🚪",
    description: "Le couloir central. On passe d'une pièce à l'autre.",
    gadgets: [],
    npcs: [],
    backgroundColor: "#1a1a1a",
  },
};
