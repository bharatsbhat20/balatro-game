import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './hooks/useGameStore';
import { TitleScreen } from './components/TitleScreen';
import { BlindSelect } from './components/BlindSelect';
import { PlayScreen } from './components/PlayScreen';
import { ScoringOverlay } from './components/ScoringOverlay';
import { Shop } from './components/Shop';
import { GameOver } from './components/GameOver';

import './styles/theme.css';
import './styles/cards.css';
import './styles/layout.css';

export default function App() {
  const phase = useGameStore(s => s.phase);

  return (
    <div className="game-container">
      <AnimatePresence mode="wait">
        {phase === 'title' && <TitleScreen key="title" />}
        {phase === 'blind-select' && <BlindSelect key="blind" />}
        {(phase === 'playing' || phase === 'scoring') && <PlayScreen key="play" />}
        {phase === 'shop' && <Shop key="shop" />}
        {phase === 'game-over' && <GameOver key="gameover" />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'scoring' && <ScoringOverlay key="scoring" />}
      </AnimatePresence>
    </div>
  );
}
