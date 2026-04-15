import type { Card } from './deck';
import { evaluateHand, HAND_BASE } from './hands';
import type { HandType, HandResult } from './hands';
import { applyJokers } from './jokers';
import type { Joker } from './jokers';

export interface HandLevel {
  level: number;
  chips: number;
  mult: number;
}

export function getDefaultHandLevels(): Record<HandType, HandLevel> {
  const levels: Partial<Record<HandType, HandLevel>> = {};
  for (const [key, base] of Object.entries(HAND_BASE)) {
    levels[key as HandType] = { level: 1, chips: base.chips, mult: base.mult };
  }
  return levels as Record<HandType, HandLevel>;
}

export interface ScoreResult {
  handResult: HandResult;
  baseChips: number;
  baseMult: number;
  cardChips: number;
  jokerChips: number;
  jokerMult: number;
  xMult: number;
  totalChips: number;
  totalMult: number;
  totalScore: number;
  moneyEarned: number;
}

export function calculateScore(
  playedCards: Card[],
  jokers: Joker[],
  handLevels: Record<HandType, HandLevel>,
): ScoreResult {
  const handResult = evaluateHand(playedCards);
  const level = handLevels[handResult.type];

  const baseChips = level.chips;
  const baseMult = level.mult;
  // In Balatro, all played cards contribute chip values
  const cardChips = playedCards.reduce((sum, c) => sum + c.chipValue, 0);

  const jokerMod = applyJokers(jokers, handResult.type, playedCards);
  const jokerChips = jokerMod.chips;
  const jokerMult = jokerMod.mult;
  const xMult = jokerMod.xMult;

  const totalChips = baseChips + cardChips + jokerChips;
  const totalMult = (baseMult + jokerMult) * xMult;
  const totalScore = Math.floor(totalChips * totalMult);

  return {
    handResult,
    baseChips,
    baseMult,
    cardChips,
    jokerChips,
    jokerMult,
    xMult,
    totalChips,
    totalMult,
    totalScore,
    moneyEarned: jokerMod.money,
  };
}

export function levelUpHand(
  levels: Record<HandType, HandLevel>,
  handType: HandType,
): Record<HandType, HandLevel> {
  const current = levels[handType];
  const base = HAND_BASE[handType];
  return {
    ...levels,
    [handType]: {
      level: current.level + 1,
      chips: current.chips + base.chips,
      mult: current.mult + Math.ceil(base.mult * 0.5),
    },
  };
}
