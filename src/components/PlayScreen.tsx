import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { PlayingCard } from './Card';
import { JokerCard } from './JokerCard';
import { formatChips } from '../game/blinds';

export function PlayScreen() {
  const {
    hand, selectedIndices, jokers, money, blind, roundScore,
    handsLeft, discardsLeft, previewHand, ante, round,
    toggleCard, playHand, discard,
  } = useGameStore();

  const canPlay = selectedIndices.length > 0 && handsLeft > 0;
  const canDiscard = selectedIndices.length > 0 && discardsLeft > 0;
  const scoreMet = blind ? roundScore >= blind.chips : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', justifyContent: 'center' }}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="stat">
          <span className="stat-label">Ante</span>
          <span className="stat-value">{ante}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Round</span>
          <span className="stat-value">{round}</span>
        </div>
        <span className="money">${money}</span>
      </div>

      {/* Joker Bar */}
      {jokers.length > 0 && (
        <div className="joker-bar">
          <span className="joker-bar-label">JOKERS</span>
          {jokers.map(j => (
            <JokerCard key={j.id} joker={j} mini />
          ))}
        </div>
      )}

      {/* Play Area */}
      <div className="play-area">
        {/* Score Target */}
        {blind && (
          <motion.div
            className="score-target"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="blind-name">{blind.name}</div>
            <div className="score-progress">
              <span className={scoreMet ? 'score-met' : 'score-current'}>
                {formatChips(roundScore)}
              </span>
              <span className="score-divider">/</span>
              <span className="score-needed">{formatChips(blind.chips)}</span>
            </div>
          </motion.div>
        )}

        {/* Hand Preview */}
        <div className="hand-preview">
          {previewHand || '\u00A0'}
        </div>

        {/* Hand */}
        <div className="hand-container">
          <AnimatePresence mode="popLayout">
            {hand.map((card, i) => (
              <PlayingCard
                key={card.id}
                card={card}
                index={i}
                selected={selectedIndices.includes(i)}
                onClick={() => toggleCard(i)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-info">
          <div className="info-item">
            Hands: <span className="hands-count">{handsLeft}</span>
          </div>
          <div className="info-item">
            Discards: <span className="discards-count">{discardsLeft}</span>
          </div>
        </div>
      </div>
      <div className="action-bar" style={{ paddingTop: 0, paddingBottom: 12 }}>
        <motion.button
          className="btn btn-primary"
          onClick={playHand}
          disabled={!canPlay}
          whileTap={{ scale: 0.95 }}
        >
          Play Hand
        </motion.button>
        <motion.button
          className="btn btn-red btn-sm"
          onClick={discard}
          disabled={!canDiscard}
          whileTap={{ scale: 0.95 }}
        >
          Discard
        </motion.button>
      </div>
    </div>
  );
}
