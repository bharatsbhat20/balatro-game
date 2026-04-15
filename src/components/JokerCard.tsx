import type { Joker } from '../game/jokers';

interface Props {
  joker: Joker;
  mini?: boolean;
  onClick?: () => void;
  showSell?: boolean;
}

export function JokerCard({ joker, mini, onClick, showSell }: Props) {
  const rarityClass = joker.rarity;

  return (
    <div
      className={`joker-card ${rarityClass} ${mini ? 'joker-mini' : ''} shop-item`}
      onClick={onClick}
      title={joker.description}
    >
      {showSell && (
        <div className="sell-badge">${Math.max(1, Math.floor(joker.cost / 2))}</div>
      )}
      <div className="joker-emoji">{joker.emoji}</div>
      <div className="joker-name">{joker.name}</div>
    </div>
  );
}
