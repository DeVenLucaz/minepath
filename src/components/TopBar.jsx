import React from 'react';
import { gameStore } from '../store/gameStore';

// Title letter colors — each screen gets its own palette
const TITLE_PALETTES = {
  SHOP:     ['#FF5C5C','#FFB347','#FFD700','#5CFF8F'],
  SCORES:   ['#5CB8FF','#A78BFA','#FF5CDB','#FFD700'],
  SETTINGS: ['#5CFF8F','#FFD700','#FF5C5C','#5CB8FF'],
  FEATS:    ['#FFD700','#FF5C5C','#A78BFA','#5CFF8F','#FFB347'],
  DEFAULT:  ['#FFD700','#FF5C5C','#5CFF8F','#5CB8FF'],
};

function BubblyTitle({ text, palette }) {
  const colors = palette || TITLE_PALETTES.DEFAULT;
  return (
    <div className="topbar-title">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="topbar-title-letter"
          style={{ color: colors[i % colors.length] }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export default function TopBar({ title, onBack, showSeeds = true }) {
  const seeds = gameStore.getSeeds();
  const palette = TITLE_PALETTES[title.toUpperCase()] || TITLE_PALETTES.DEFAULT;

  return (
    <div className="topbar">
      <button className="topbar-back" onClick={onBack}>
        <span className="topbar-back-arrow">‹</span>
        <span className="topbar-back-text">Back</span>
      </button>

      <BubblyTitle text={title} palette={palette} />

      {showSeeds ? (
        <div className="topbar-seeds">
          <span className="topbar-seeds-icon">🌾</span>
          <span className="topbar-seeds-val">{seeds}</span>
        </div>
      ) : (
        <div className="topbar-seeds-spacer" />
      )}
    </div>
  );
}
