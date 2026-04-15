# Balatro

A stylish poker roguelike inspired by [Balatro](https://www.playbalatro.com/), built with React, TypeScript, and modern web technologies. Play poker hands, collect jokers, and conquer 8 antes.

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?logo=npm&logoColor=white)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Play

1. **Choose a blind** (Small, Big, or Boss) - each has a chip target to beat
2. **Select up to 5 cards** from your hand of 8
3. **Play poker hands** (pairs, straights, flushes, etc.) to score chips
4. **Discard** unwanted cards to draw new ones
5. **Beat the blind** before running out of hands
6. **Visit the shop** to buy jokers and planet cards between rounds
7. **Conquer all 8 antes** to win the run

### Scoring Formula

```
Total Score = (Base Chips + Card Chips + Joker Chips) x (Base Mult + Joker Mult) x xMult
```

## Architecture

```
balatro/
├── index.html                    Entry HTML
├── vite.config.ts                Vite config (React plugin, port)
├── tsconfig.json                 TypeScript config
├── package.json                  Dependencies & scripts
│
└── src/
    ├── main.tsx                  React DOM entry point
    ├── App.tsx                   Root component & screen router
    │
    ├── game/                     Pure game logic (no React)
    │   ├── deck.ts               Card types, deck creation, shuffle
    │   ├── hands.ts              Poker hand detection & ranking
    │   ├── engine.ts             Score calculation, hand levels
    │   ├── jokers.ts             Joker definitions & effect system
    │   ├── blinds.ts             Ante/blind progression & formatting
    │   └── shop.ts               Shop generation, planet cards
    │
    ├── hooks/
    │   └── useGameStore.ts       Zustand store (all game state & actions)
    │
    ├── components/
    │   ├── TitleScreen.tsx        Title screen with "New Run" button
    │   ├── BlindSelect.tsx        Choose small/big/boss blind
    │   ├── PlayScreen.tsx         Main gameplay - hand, cards, actions
    │   ├── Card.tsx               Playing card with animations
    │   ├── JokerCard.tsx          Joker card display
    │   ├── ScoringOverlay.tsx     Chips x Mult score animation
    │   ├── Shop.tsx               Between-round shop
    │   └── GameOver.tsx           Win/lose screen
    │
    └── styles/
        ├── theme.css              CSS variables, colors, scanline overlay
        ├── cards.css              Playing card, joker, planet card styles
        └── layout.css             Layout, buttons, responsive breakpoints
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     useGameStore (Zustand)               │
│                                                         │
│  State: phase, deck, hand, jokers, money, score, ...    │
│  Actions: startRun, selectBlind, playHand, discard, ... │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          v            v            v
   ┌────────────┐ ┌─────────┐ ┌─────────┐
   │ game/      │ │ game/   │ │ game/   │
   │ hands.ts   │ │ engine  │ │ jokers  │
   │ evaluate   │ │ score   │ │ apply   │
   │ hand type  │ │ calc    │ │ effects │
   └────────────┘ └─────────┘ └─────────┘
```

### Game Loop

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  Title   │────>│  Blind   │────>│   Play   │────>│ Scoring  │
  │  Screen  │     │  Select  │     │  Phase   │     │ Overlay  │
  └──────────┘     └──────────┘     └────┬─────┘     └────┬─────┘
                        ^                │                 │
                        │                │  select cards   │
                        │                │  play / discard │
                        │                v                 │
                   ┌────┴─────┐    ┌──────────┐           │
                   │  Shop    │<───│  Round   │<──────────┘
                   │  Phase   │    │  Won?    │
                   └──────────┘    └────┬─────┘
                                       │ no hands left
                                       v
                                  ┌──────────┐
                                  │  Game    │
                                  │  Over    │
                                  └──────────┘
```

## Features

| Feature | Details |
|---------|---------|
| **Poker Hands** | High Card, Pair, Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush, Five of a Kind |
| **18 Jokers** | Flat bonuses, conditional multipliers, scaling effects, economy jokers, and xMult jokers |
| **Planet Cards** | Level up any hand type to increase its base chips and mult |
| **8 Antes** | Progressive difficulty with boss blinds that have special rules |
| **Shop System** | Buy jokers, planet cards, reroll, and sell owned jokers |
| **Responsive** | Plays on mobile (375px+), tablet, and desktop |
| **Animations** | Card dealing, selection glow, score popups via Framer Motion |

## Tech Stack

- **[Vite](https://vite.dev/)** - Build tool & dev server
- **[React 18](https://react.dev/)** - UI components
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Zustand](https://zustand.docs.pmnd.rs/)** - Lightweight state management
- **[Framer Motion](https://www.framer.com/motion/)** - Animations

## License

MIT
