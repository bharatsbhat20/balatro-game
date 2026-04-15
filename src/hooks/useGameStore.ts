import { create } from 'zustand';
import { createDeck, shuffle } from '../game/deck';
import type { Card } from '../game/deck';
import { evaluateHand, HAND_BASE } from '../game/hands';
import type { HandType } from '../game/hands';
import type { Joker } from '../game/jokers';
import { getSmallBlind, getBigBlind, getBossBlind } from '../game/blinds';
import type { Blind } from '../game/blinds';
import { calculateScore, getDefaultHandLevels } from '../game/engine';
import type { HandLevel, ScoreResult } from '../game/engine';
import { generateShop, buyPlanet } from '../game/shop';
import type { ShopItems, PlanetCard } from '../game/shop';

export type Phase = 'title' | 'blind-select' | 'playing' | 'scoring' | 'shop' | 'game-over';

interface GameState {
  phase: Phase;
  deck: Card[];
  hand: Card[];
  selectedIndices: number[];
  jokers: Joker[];
  money: number;
  ante: number;
  round: number;
  blind: Blind | null;
  roundScore: number;
  handsLeft: number;
  discardsLeft: number;
  handLevels: Record<HandType, HandLevel>;
  lastScore: ScoreResult | null;
  shopItems: ShopItems | null;
  won: boolean;
  handSize: number;
  maxJokers: number;

  // Preview
  previewHand: string;

  // Actions
  startRun: () => void;
  selectBlind: (type: 'small' | 'big' | 'boss') => void;
  toggleCard: (index: number) => void;
  playHand: () => void;
  discard: () => void;
  finishScoring: () => void;
  buyJoker: (joker: Joker) => void;
  buyPlanetCard: (planet: PlanetCard) => void;
  sellJoker: (jokerId: string) => void;
  nextRound: () => void;
  rerollShop: () => void;
}

const INITIAL_MONEY = 4;
const HAND_SIZE = 8;
const HANDS_PER_ROUND = 4;
const DISCARDS_PER_ROUND = 3;
const MAX_JOKERS = 5;
const MAX_ANTE = 8;

function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'title',
  deck: [],
  hand: [],
  selectedIndices: [],
  jokers: [],
  money: INITIAL_MONEY,
  ante: 1,
  round: 1,
  blind: null,
  roundScore: 0,
  handsLeft: HANDS_PER_ROUND,
  discardsLeft: DISCARDS_PER_ROUND,
  handLevels: getDefaultHandLevels(),
  lastScore: null,
  shopItems: null,
  won: false,
  handSize: HAND_SIZE,
  maxJokers: MAX_JOKERS,
  previewHand: '',

  startRun: () => {
    set({
      phase: 'blind-select',
      deck: shuffle(createDeck()),
      hand: [],
      selectedIndices: [],
      jokers: [],
      money: INITIAL_MONEY,
      ante: 1,
      round: 1,
      blind: null,
      roundScore: 0,
      handsLeft: HANDS_PER_ROUND,
      discardsLeft: DISCARDS_PER_ROUND,
      handLevels: getDefaultHandLevels(),
      lastScore: null,
      shopItems: null,
      won: false,
    });
  },

  selectBlind: (type) => {
    const { ante } = get();
    let blind: Blind;
    if (type === 'small') blind = getSmallBlind(ante);
    else if (type === 'big') blind = getBigBlind(ante);
    else blind = getBossBlind(ante);

    const deck = shuffle(createDeck());
    const { drawn, remaining } = drawCards(deck, HAND_SIZE);

    set({
      phase: 'playing',
      blind,
      deck: remaining,
      hand: drawn,
      selectedIndices: [],
      roundScore: 0,
      handsLeft: HANDS_PER_ROUND,
      discardsLeft: DISCARDS_PER_ROUND,
      lastScore: null,
    });
  },

  toggleCard: (index) => {
    const { selectedIndices } = get();
    if (selectedIndices.includes(index)) {
      set({ selectedIndices: selectedIndices.filter(i => i !== index) });
    } else if (selectedIndices.length < 5) {
      set({ selectedIndices: [...selectedIndices, index] });
    }

    // Update preview
    const state = get();
    const selectedCards = state.selectedIndices.map(i => state.hand[i]);
    if (selectedCards.length > 0) {
      const result = evaluateHand(selectedCards);
      const level = state.handLevels[result.type];
      set({ previewHand: `${HAND_BASE[result.type].label} (lvl ${level.level})` });
    } else {
      set({ previewHand: '' });
    }
  },

  playHand: () => {
    const { hand, selectedIndices, jokers, handLevels, handsLeft, roundScore } = get();
    if (selectedIndices.length === 0 || handsLeft <= 0) return;

    const playedCards = selectedIndices.map(i => hand[i]);
    const score = calculateScore(playedCards, jokers, handLevels);

    // Update scaling jokers
    const updatedJokers = jokers.map(j => {
      if (j.effect.type === 'scaling_mult') {
        return { ...j, counter: (j.counter || 0) + j.effect.value };
      }
      return j;
    });

    const newScore = roundScore + score.totalScore;

    set({
      phase: 'scoring',
      lastScore: score,
      roundScore: newScore,
      handsLeft: handsLeft - 1,
      jokers: updatedJokers,
    });
  },

  discard: () => {
    const { hand, selectedIndices, deck, discardsLeft, handSize } = get();
    if (selectedIndices.length === 0 || discardsLeft <= 0) return;

    const remaining = hand.filter((_, i) => !selectedIndices.includes(i));
    const toDraw = handSize - remaining.length;
    const { drawn, remaining: newDeck } = drawCards(deck, toDraw);

    set({
      hand: [...remaining, ...drawn],
      deck: newDeck,
      selectedIndices: [],
      discardsLeft: discardsLeft - 1,
      previewHand: '',
    });
  },

  finishScoring: () => {
    const { roundScore, blind, hand, selectedIndices, deck, handsLeft, handSize, ante, jokers, money } = get();

    if (blind && roundScore >= blind.chips) {
      // Won the round - go to shop
      const jokerMoney = jokers.reduce((sum, j) => {
        if (j.effect.type === 'economy') return sum + j.effect.value;
        return sum;
      }, 0);
      const reward = blind.reward + jokerMoney;
      // Reduce scaling jokers that decrease
      const updatedJokers = jokers.map(j => {
        if (j.effect.type === 'scaling_chips' && j.effect.value < 0) {
          return { ...j, counter: Math.max(0, (j.counter || 0) + j.effect.value) };
        }
        return j;
      });

      set({
        phase: 'shop',
        money: money + reward,
        jokers: updatedJokers,
        shopItems: generateShop(jokers.map(j => j.name)),
        hand: [],
        selectedIndices: [],
        previewHand: '',
      });
    } else if (handsLeft <= 0) {
      // No hands left and didn't meet blind - game over
      set({ phase: 'game-over', won: false });
    } else {
      // Continue playing - remove played cards and draw new ones
      const remaining = hand.filter((_, i) => !selectedIndices.includes(i));
      const toDraw = handSize - remaining.length;
      const { drawn, remaining: newDeck } = drawCards(deck, toDraw);

      set({
        phase: 'playing',
        hand: [...remaining, ...drawn],
        deck: newDeck,
        selectedIndices: [],
        previewHand: '',
      });
    }
  },

  buyJoker: (joker) => {
    const { money, jokers, shopItems, maxJokers } = get();
    if (money < joker.cost || jokers.length >= maxJokers) return;
    set({
      money: money - joker.cost,
      jokers: [...jokers, joker],
      shopItems: shopItems ? {
        ...shopItems,
        jokers: shopItems.jokers.filter(j => j.id !== joker.id),
      } : null,
    });
  },

  buyPlanetCard: (planet) => {
    const { money, handLevels, shopItems } = get();
    if (money < planet.cost) return;
    set({
      money: money - planet.cost,
      handLevels: buyPlanet(planet, handLevels),
      shopItems: shopItems ? {
        ...shopItems,
        planets: shopItems.planets.filter(p => p.id !== planet.id),
      } : null,
    });
  },

  sellJoker: (jokerId) => {
    const { jokers, money } = get();
    const joker = jokers.find(j => j.id === jokerId);
    if (!joker) return;
    const sellPrice = Math.max(1, Math.floor(joker.cost / 2));
    set({
      jokers: jokers.filter(j => j.id !== jokerId),
      money: money + sellPrice,
    });
  },

  nextRound: () => {
    const { ante, round } = get();
    const newRound = round + 1;
    // Every 3 rounds, increase ante
    const newAnte = newRound % 3 === 1 && newRound > 1 ? ante + 1 : ante;

    if (newAnte > MAX_ANTE) {
      set({ phase: 'game-over', won: true });
      return;
    }

    set({
      phase: 'blind-select',
      ante: newAnte,
      round: newRound,
    });
  },

  rerollShop: () => {
    const { money, jokers } = get();
    if (money < 5) return;
    set({
      money: money - 5,
      shopItems: generateShop(jokers.map(j => j.name)),
    });
  },
}));
