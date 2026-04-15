import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { getSmallBlind, getBigBlind, getBossBlind, formatChips } from '../game/blinds';

export function BlindSelect() {
  const { ante, round, selectBlind, money } = useGameStore();
  const small = getSmallBlind(ante);
  const big = getBigBlind(ante);
  const boss = getBossBlind(ante);

  return (
    <div className="blind-select">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Ante {ante} - Round {round}
      </motion.h2>

      <div className="top-bar" style={{ background: 'transparent', border: 'none', justifyContent: 'center' }}>
        <span className="money">${money}</span>
      </div>

      <div className="blind-options">
        {[
          { blind: small, type: 'small' as const, label: 'Small Blind' },
          { blind: big, type: 'big' as const, label: 'Big Blind' },
          { blind: boss, type: 'boss' as const, label: boss.name },
        ].map(({ blind, type, label }, i) => (
          <motion.div
            key={type}
            className={`blind-option ${type === 'boss' ? 'boss' : ''}`}
            onClick={() => selectBlind(type)}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="blind-name">{label}</div>
            <div className="blind-chips">{formatChips(blind.chips)}</div>
            <div className="blind-reward">Reward: ${blind.reward}</div>
            {blind.description && (
              <div className="blind-desc">{blind.description}</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
