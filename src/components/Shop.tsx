import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { JokerCard } from './JokerCard';
import { HAND_BASE } from '../game/hands';

export function Shop() {
  const {
    money, shopItems, jokers, handLevels, maxJokers,
    buyJoker, buyPlanetCard, sellJoker, nextRound, rerollShop,
  } = useGameStore();

  if (!shopItems) return null;

  return (
    <div className="shop-screen">
      <div className="shop-header">
        <h2>Shop</h2>
        <span className="money" style={{ fontSize: '24px' }}>${money}</span>
      </div>

      {/* Jokers for sale */}
      <div className="shop-section">
        <h3>Jokers</h3>
        <div className="shop-items">
          {shopItems.jokers.map((joker, i) => (
            <motion.div
              key={joker.id}
              className="shop-item"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => buyJoker(joker)}
            >
              <div className="shop-joker-details">{joker.description}</div>
              <JokerCard joker={joker} />
              <div className={`item-price ${money < joker.cost || jokers.length >= maxJokers ? 'cant-afford' : ''}`}>
                ${joker.cost}
              </div>
            </motion.div>
          ))}
          {shopItems.jokers.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sold out</div>
          )}
        </div>
      </div>

      {/* Planets for sale */}
      <div className="shop-section">
        <h3>Planet Cards</h3>
        <div className="shop-items">
          {shopItems.planets.map((planet, i) => (
            <motion.div
              key={planet.id}
              className="shop-item"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => buyPlanetCard(planet)}
            >
              <div className="planet-card">
                <div className="planet-emoji">{planet.emoji}</div>
                <div className="planet-name">{planet.name}</div>
                <div className="planet-type">
                  {HAND_BASE[planet.handType].label}
                  <br />
                  Lvl {handLevels[planet.handType].level} → {handLevels[planet.handType].level + 1}
                </div>
              </div>
              <div className={`item-price ${money < planet.cost ? 'cant-afford' : ''}`}>
                ${planet.cost}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Owned Jokers */}
      {jokers.length > 0 && (
        <div className="shop-section">
          <h3>Your Jokers ({jokers.length}/{maxJokers})</h3>
          <div className="owned-jokers">
            {jokers.map(j => (
              <div key={j.id} className="shop-item" style={{ position: 'relative' }}>
                <JokerCard joker={j} mini onClick={() => sellJoker(j.id)} showSell />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '16px' }}>
        <motion.button
          className="btn btn-primary btn-sm"
          onClick={rerollShop}
          disabled={money < 5}
          whileTap={{ scale: 0.95 }}
        >
          Reroll ($5)
        </motion.button>
        <motion.button
          className="btn btn-green"
          onClick={nextRound}
          whileTap={{ scale: 0.95 }}
        >
          Next Round
        </motion.button>
      </div>
    </div>
  );
}
