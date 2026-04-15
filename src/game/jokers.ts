import type { HandType } from './hands';
import type { Card } from './deck';

export interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare';
  cost: number;
  emoji: string;
  effect: JokerEffect;
  counter?: number; // for scaling jokers
}

export interface JokerEffect {
  type: 'flat_chips' | 'flat_mult' | 'x_mult' | 'conditional_mult' | 'conditional_chips' | 'economy' | 'scaling_mult' | 'scaling_chips';
  value: number;
  condition?: (hand: HandType, cards: Card[]) => boolean;
  conditionLabel?: string;
}

export interface ScoreModifier {
  chips: number;
  mult: number;
  xMult: number;
  money: number;
}

export function applyJokers(jokers: Joker[], handType: HandType, playedCards: Card[]): ScoreModifier {
  const mod: ScoreModifier = { chips: 0, mult: 0, xMult: 1, money: 0 };

  for (const joker of jokers) {
    const e = joker.effect;
    switch (e.type) {
      case 'flat_chips':
        mod.chips += e.value;
        break;
      case 'flat_mult':
        mod.mult += e.value;
        break;
      case 'x_mult':
        mod.xMult *= e.value;
        break;
      case 'conditional_mult':
        if (e.condition?.(handType, playedCards)) mod.mult += e.value;
        break;
      case 'conditional_chips':
        if (e.condition?.(handType, playedCards)) mod.chips += e.value;
        break;
      case 'economy':
        mod.money += e.value;
        break;
      case 'scaling_mult':
        mod.mult += (joker.counter || 0);
        break;
      case 'scaling_chips':
        mod.chips += (joker.counter || 0);
        break;
    }
  }

  return mod;
}

const hasHeart = (_h: HandType, cards: Card[]) => cards.some(c => c.suit === 'hearts');
const hasSpade = (_h: HandType, cards: Card[]) => cards.some(c => c.suit === 'spades');
const hasFaceCard = (_h: HandType, cards: Card[]) => cards.some(c => ['J', 'Q', 'K'].includes(c.rank));
const isPairOrBetter = (h: HandType) => h !== 'high_card';
const isThreeOrBetter = (h: HandType) => !['high_card', 'pair', 'two_pair'].includes(h);

export const JOKER_POOL: Omit<Joker, 'id'>[] = [
  {
    name: 'Joker', emoji: '🃏', description: '+4 Mult', rarity: 'common', cost: 2,
    effect: { type: 'flat_mult', value: 4 },
  },
  {
    name: 'Greedy Joker', emoji: '💰', description: '+3 Mult if hand has a Diamond', rarity: 'common', cost: 5,
    effect: { type: 'conditional_mult', value: 3, condition: (_h, cards) => cards.some(c => c.suit === 'diamonds'), conditionLabel: 'Diamond in hand' },
  },
  {
    name: 'Lusty Joker', emoji: '❤️', description: '+3 Mult if hand has a Heart', rarity: 'common', cost: 5,
    effect: { type: 'conditional_mult', value: 3, condition: hasHeart, conditionLabel: 'Heart in hand' },
  },
  {
    name: 'Wrathful Joker', emoji: '♠️', description: '+3 Mult if hand has a Spade', rarity: 'common', cost: 5,
    effect: { type: 'conditional_mult', value: 3, condition: hasSpade, conditionLabel: 'Spade in hand' },
  },
  {
    name: 'Sly Joker', emoji: '🎭', description: '+50 Chips if hand is a Pair+', rarity: 'common', cost: 3,
    effect: { type: 'conditional_chips', value: 50, condition: isPairOrBetter, conditionLabel: 'Pair or better' },
  },
  {
    name: 'Wily Joker', emoji: '🦊', description: '+100 Chips if hand is Three+', rarity: 'uncommon', cost: 4,
    effect: { type: 'conditional_chips', value: 100, condition: isThreeOrBetter, conditionLabel: 'Three of a Kind or better' },
  },
  {
    name: 'Jolly Joker', emoji: '😄', description: '+8 Mult if hand has a Pair+', rarity: 'common', cost: 3,
    effect: { type: 'conditional_mult', value: 8, condition: isPairOrBetter, conditionLabel: 'Pair or better' },
  },
  {
    name: 'Zany Joker', emoji: '🤪', description: '+12 Mult if hand is Three+', rarity: 'uncommon', cost: 4,
    effect: { type: 'conditional_mult', value: 12, condition: isThreeOrBetter, conditionLabel: 'Three of a Kind or better' },
  },
  {
    name: 'Mad Joker', emoji: '😡', description: '+10 Mult if hand has a Face card', rarity: 'uncommon', cost: 4,
    effect: { type: 'conditional_mult', value: 10, condition: hasFaceCard, conditionLabel: 'Face card in hand' },
  },
  {
    name: 'Crazy Joker', emoji: '🤡', description: '+12 Mult if hand is a Straight+', rarity: 'uncommon', cost: 4,
    effect: { type: 'conditional_mult', value: 12, condition: (h) => ['straight', 'flush', 'full_house', 'four_of_a_kind', 'straight_flush', 'royal_flush', 'five_of_a_kind'].includes(h), conditionLabel: 'Straight or better' },
  },
  {
    name: 'Half Joker', emoji: '🌗', description: '+20 Mult if hand has 3 or fewer cards', rarity: 'common', cost: 5,
    effect: { type: 'conditional_mult', value: 20, condition: (_h, cards) => cards.length <= 3, conditionLabel: '3 or fewer cards' },
  },
  {
    name: 'Banner', emoji: '🚩', description: '+30 Chips for each discard remaining', rarity: 'common', cost: 5,
    effect: { type: 'flat_chips', value: 30 },
  },
  {
    name: 'Mystic Summit', emoji: '🏔️', description: '+15 Mult if 0 discards left', rarity: 'common', cost: 5,
    effect: { type: 'flat_mult', value: 15 },
  },
  {
    name: 'Egg', emoji: '🥚', description: 'Gains $3 of sell value at end of round', rarity: 'common', cost: 3,
    effect: { type: 'economy', value: 3 },
  },
  {
    name: 'Golden Joker', emoji: '👑', description: 'Earn $4 at end of round', rarity: 'uncommon', cost: 6,
    effect: { type: 'economy', value: 4 },
  },
  {
    name: 'Steel Joker', emoji: '⚙️', description: 'x1.5 Mult', rarity: 'rare', cost: 7,
    effect: { type: 'x_mult', value: 1.5 },
  },
  {
    name: 'Supernova', emoji: '💥', description: '+1 Mult per hand played this round (scaling)', rarity: 'uncommon', cost: 5,
    effect: { type: 'scaling_mult', value: 1 }, counter: 0,
  },
  {
    name: 'Ice Cream', emoji: '🍦', description: '+100 Chips (loses 5 per round)', rarity: 'common', cost: 5,
    effect: { type: 'scaling_chips', value: -5 }, counter: 100,
  },
];

let jokerIdCounter = 0;
export function createJoker(template: Omit<Joker, 'id'>): Joker {
  return { ...template, id: `joker_${jokerIdCounter++}`, counter: template.counter };
}

export function getRandomJokers(count: number, exclude: string[]): Joker[] {
  const available = JOKER_POOL.filter(j => !exclude.includes(j.name));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(createJoker);
}
