import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { formatChips } from '../game/blinds';
import { useEffect } from 'react';

export function ScoringOverlay() {
  const { lastScore, finishScoring } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(finishScoring, 2000);
    return () => clearTimeout(timer);
  }, [finishScoring]);

  if (!lastScore) return null;

  return (
    <motion.div
      className="scoring-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={finishScoring}
    >
      <motion.div
        className="scoring-hand-type"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {lastScore.handResult.label}
      </motion.div>

      <motion.div
        className="scoring-calculation"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="scoring-chips">{lastScore.totalChips}</span>
        <span className="scoring-x">x</span>
        <span className="scoring-mult">{lastScore.totalMult.toFixed(1)}</span>
      </motion.div>

      <motion.div
        className="scoring-total"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
      >
        +{formatChips(lastScore.totalScore)}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2 }}
        style={{ fontSize: '14px', color: 'var(--text-muted)' }}
      >
        Tap to continue
      </motion.div>
    </motion.div>
  );
}
