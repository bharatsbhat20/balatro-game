import type { HandType } from './hands';
import { getRandomJokers } from './jokers';
import type { Joker } from './jokers';
import { levelUpHand } from './engine';
import type { HandLevel } from './engine';

export interface PlanetCard {
  id: string;
  name: string;
  handType: HandType;
  cost: number;
  emoji: string;
}

const PLANET_NAMES: Record<HandType, { name: string; emoji: string }> = {
  high_card:       { name: 'Pluto',   emoji: '🪐' },
  pair:            { name: 'Mercury', emoji: '☿️' },
  two_pair:        { name: 'Uranus',  emoji: '⛢' },
  three_of_a_kind: { name: 'Mars',    emoji: '♂️' },
  straight:        { name: 'Saturn',  emoji: '🪐' },
  flush:           { name: 'Jupiter', emoji: '♃' },
  full_house:      { name: 'Earth',   emoji: '🌍' },
  four_of_a_kind:  { name: 'Neptune', emoji: '🔱' },
  straight_flush:  { name: 'Venus',   emoji: '♀️' },
  royal_flush:     { name: 'Sun',     emoji: '☀️' },
  five_of_a_kind:  { name: 'Planet X', emoji: '🌑' },
};

let planetId = 0;
export function getRandomPlanets(count: number): PlanetCard[] {
  const handTypes = Object.keys(PLANET_NAMES) as HandType[];
  const shuffled = [...handTypes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(ht => ({
    id: `planet_${planetId++}`,
    name: PLANET_NAMES[ht].name,
    handType: ht,
    cost: 3,
    emoji: PLANET_NAMES[ht].emoji,
  }));
}

export interface ShopItems {
  jokers: Joker[];
  planets: PlanetCard[];
}

export function generateShop(ownedJokerNames: string[]): ShopItems {
  return {
    jokers: getRandomJokers(2, ownedJokerNames),
    planets: getRandomPlanets(2),
  };
}

export function buyPlanet(
  planet: PlanetCard,
  handLevels: Record<HandType, HandLevel>,
): Record<HandType, HandLevel> {
  return levelUpHand(handLevels, planet.handType);
}
