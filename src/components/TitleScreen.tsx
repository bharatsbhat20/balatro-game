import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export function TitleScreen() {
  const startRun = useGameStore(s => s.startRun);

  return (
    <div className="title-screen">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="title-logo">BALATRO</div>
        <div className="title-subtitle">Poker Roguelike</div>
      </motion.div>

      <motion.button
        className="btn btn-gold"
        onClick={startRun}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        New Run
      </motion.button>
    </div>
  );
}
