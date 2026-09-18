export interface Order {
  id: string;
  dish: string;
  emoji: string;
  timeLeft: number;
  maxTime: number;
  status: "cooking" | "ready" | "burned" | "sent_back";
  stationIdx: number;
}

export interface Station {
  id: number;
  name: string;
  emoji: string;
  order: Order | null;
  onFire: boolean;
  smokeLevel: number;
}

export interface GameState {
  round: number;
  ordersCompleted: number;
  ordersBurned: number;
  ordersSentBack: number;
  crowdMeter: number;
  maxCrowd: number;
  isExploded: boolean;
  isRageQuit: boolean;
  activeChaos: Set<string>;
  gameStarted: boolean;
  worstChaos: string;
}

export const DISHES = [
  { dish: "Wagyu Steak", emoji: "stk" },
  { dish: "Lobster Bisque", emoji: "lob" },
  { dish: "Truffle Risotto", emoji: "ris" },
  { dish: "Salmon Tartare", emoji: "sal" },
  { dish: "Duck Confit", emoji: "dck" },
  { dish: "Pasta Carbonara", emoji: "pst" },
  { dish: "Creme Brulee", emoji: "crm" },
  { dish: "Caesar Salad", emoji: "csr" },
  { dish: "French Onion Soup", emoji: "sup" },
  { dish: "Beef Wellington", emoji: "bwl" },
];

export const STATION_TEMPLATES = [
  { name: "Grill", emoji: "grl" },
  { name: "Stove 1", emoji: "st1" },
  { name: "Stove 2", emoji: "st2" },
  { name: "Prep", emoji: "prp" },
  { name: "Oven", emoji: "ovn" },
  { name: "Fryer", emoji: "fry" },
];
