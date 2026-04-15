export interface Blind {
  name: string;
  chips: number;
  reward: number;
  isBoss: boolean;
  description?: string;
}

const ANTE_BASES = [100, 300, 800, 2000, 5000, 11000, 20000, 50000];

export function getSmallBlind(ante: number): Blind {
  const base = ANTE_BASES[Math.min(ante - 1, ANTE_BASES.length - 1)];
  return {
    name: 'Small Blind',
    chips: base,
    reward: 3,
    isBoss: false,
  };
}

export function getBigBlind(ante: number): Blind {
  const base = ANTE_BASES[Math.min(ante - 1, ANTE_BASES.length - 1)];
  return {
    name: 'Big Blind',
    chips: Math.floor(base * 1.5),
    reward: 4,
    isBoss: false,
  };
}

const BOSS_BLINDS = [
  { name: 'The Hook', description: 'Discards 2 random cards per hand' },
  { name: 'The Wall', description: 'Extra large blind' },
  { name: 'The Wheel', description: '1 in 7 cards drawn face down' },
  { name: 'The Arm', description: 'Decreases level of played hand' },
  { name: 'The Psychic', description: 'Must play 5 cards' },
  { name: 'The Goad', description: 'All Spades are debuffed' },
  { name: 'The Water', description: 'Start with 0 discards' },
  { name: 'The Needle', description: 'Play only 1 hand' },
];

export function getBossBlind(ante: number): Blind {
  const base = ANTE_BASES[Math.min(ante - 1, ANTE_BASES.length - 1)];
  const boss = BOSS_BLINDS[(ante - 1) % BOSS_BLINDS.length];
  return {
    name: boss.name,
    chips: base * 2,
    reward: 5,
    isBoss: true,
    description: boss.description,
  };
}

export function formatChips(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
