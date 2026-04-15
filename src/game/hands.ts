import { rankValue } from './deck';
import type { Card } from './deck';

export type HandType =
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush'
  | 'five_of_a_kind';

export interface HandResult {
  type: HandType;
  scoringCards: Card[];
  label: string;
}

export const HAND_BASE: Record<HandType, { chips: number; mult: number; label: string }> = {
  high_card:       { chips: 5,   mult: 1,  label: 'High Card' },
  pair:            { chips: 10,  mult: 2,  label: 'Pair' },
  two_pair:        { chips: 20,  mult: 2,  label: 'Two Pair' },
  three_of_a_kind: { chips: 30,  mult: 3,  label: 'Three of a Kind' },
  straight:        { chips: 30,  mult: 4,  label: 'Straight' },
  flush:           { chips: 35,  mult: 4,  label: 'Flush' },
  full_house:      { chips: 40,  mult: 4,  label: 'Full House' },
  four_of_a_kind:  { chips: 60,  mult: 7,  label: 'Four of a Kind' },
  straight_flush:  { chips: 100, mult: 8,  label: 'Straight Flush' },
  royal_flush:     { chips: 100, mult: 8,  label: 'Royal Flush' },
  five_of_a_kind:  { chips: 120, mult: 12, label: 'Five of a Kind' },
};

function getRankCounts(cards: Card[]): Map<string, Card[]> {
  const map = new Map<string, Card[]>();
  for (const c of cards) {
    const existing = map.get(c.rank) || [];
    existing.push(c);
    map.set(c.rank, existing);
  }
  return map;
}

function isFlush(cards: Card[]): boolean {
  return cards.length >= 5 && cards.every(c => c.suit === cards[0].suit);
}

function isStraight(cards: Card[]): { is: boolean; cards: Card[] } {
  const sorted = [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
  const values = sorted.map(c => rankValue(c.rank));
  const unique = [...new Set(values)];

  if (unique.length < 5) return { is: false, cards: [] };

  // Check for A-2-3-4-5 (wheel)
  if (unique.includes(14) && unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) {
    const wheelCards = [
      sorted.find(c => rankValue(c.rank) === 14)!,
      ...sorted.filter(c => rankValue(c.rank) >= 2 && rankValue(c.rank) <= 5),
    ].slice(0, 5);
    return { is: true, cards: wheelCards };
  }

  // Check consecutive
  for (let i = unique.length - 1; i >= 4; i--) {
    if (unique[i] - unique[i - 4] === 4) {
      const startVal = unique[i - 4];
      const straightCards: Card[] = [];
      for (let v = startVal; v <= startVal + 4; v++) {
        straightCards.push(sorted.find(c => rankValue(c.rank) === v)!);
      }
      return { is: true, cards: straightCards };
    }
  }

  return { is: false, cards: [] };
}

export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length === 0) {
    return { type: 'high_card', scoringCards: [], label: 'High Card' };
  }

  const rankCounts = getRankCounts(cards);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b.length - a.length);
  const flushCheck = isFlush(cards);
  const straightCheck = isStraight(cards);

  // Five of a Kind
  if (counts[0] && counts[0].length >= 5) {
    return { type: 'five_of_a_kind', scoringCards: counts[0].slice(0, 5), label: 'Five of a Kind' };
  }

  // Royal Flush
  if (flushCheck && straightCheck.is) {
    const vals = straightCheck.cards.map(c => rankValue(c.rank));
    if (vals.includes(14) && vals.includes(13)) {
      return { type: 'royal_flush', scoringCards: straightCheck.cards, label: 'Royal Flush' };
    }
    return { type: 'straight_flush', scoringCards: straightCheck.cards, label: 'Straight Flush' };
  }

  // Four of a Kind
  if (counts[0] && counts[0].length === 4) {
    return { type: 'four_of_a_kind', scoringCards: counts[0], label: 'Four of a Kind' };
  }

  // Full House
  if (counts[0] && counts[0].length === 3 && counts[1] && counts[1].length >= 2) {
    return { type: 'full_house', scoringCards: [...counts[0], ...counts[1].slice(0, 2)], label: 'Full House' };
  }

  // Flush
  if (flushCheck) {
    return { type: 'flush', scoringCards: cards.slice(0, 5), label: 'Flush' };
  }

  // Straight
  if (straightCheck.is) {
    return { type: 'straight', scoringCards: straightCheck.cards, label: 'Straight' };
  }

  // Three of a Kind
  if (counts[0] && counts[0].length === 3) {
    return { type: 'three_of_a_kind', scoringCards: counts[0], label: 'Three of a Kind' };
  }

  // Two Pair
  if (counts[0] && counts[0].length === 2 && counts[1] && counts[1].length === 2) {
    return { type: 'two_pair', scoringCards: [...counts[0], ...counts[1]], label: 'Two Pair' };
  }

  // Pair
  if (counts[0] && counts[0].length === 2) {
    return { type: 'pair', scoringCards: counts[0], label: 'Pair' };
  }

  // High Card
  const highest = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  return { type: 'high_card', scoringCards: [highest[0]], label: 'High Card' };
}
