import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export function GameOver() {
  const { won, ante, round, jokers, startRun } = useGameStore();

  return (
    <div className="game-over-screen">
      <motion.div
        className={`game-over-title ${won ? 'win' : 'lose'}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {won ? 'YOU WIN!' : 'GAME OVER'}
      </motion.div>

      <motion.div
        className="game-over-stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div>Reached Ante {ante} - Round {round}</div>
        <div>Jokers collected: {jokers.length}</div>
        {won && <div style={{ color: 'var(--accent-gold)' }}>Conquered all 8 Antes!</div>}
      </motion.div>

      <motion.button
        className="btn btn-gold"
        onClick={startRun}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Play Again
      </motion.button>
    </div>
  );
}
