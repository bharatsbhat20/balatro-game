import { motion } from 'framer-motion';
import { suitSymbol, suitColor } from '../game/deck';
import type { Card as CardType } from '../game/deck';

interface Props {
  card: CardType;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
  disabled?: boolean;
}

export function PlayingCard({ card, selected, onClick, index = 0, disabled }: Props) {
  const color = suitColor(card.suit);
  const symbol = suitSymbol(card.suit);

  return (
    <motion.div
      className={`playing-card ${selected ? 'selected' : ''}`}
      onClick={disabled ? undefined : onClick}
      initial={{ opacity: 0, y: 30, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, type: 'spring', stiffness: 300 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      style={{ color, cursor: disabled ? 'default' : 'pointer' }}
    >
      <div className="card-corner">
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div className="card-rank">{card.rank}</div>
      <div className="card-suit">{symbol}</div>
      <div className="card-corner-bottom">
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </motion.div>
  );
}
