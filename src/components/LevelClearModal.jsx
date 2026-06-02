import React, { useEffect, useState } from 'react';
import ChickenSVG from './ChickenSVG';

// Confetti for level clear — more colourful
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 27.3 + 3) % 100}%`,
  color: ['#FF5C5C','#FFD700','#5CFF8F','#5CB8FF','#FF9A3C','#A78BFA','#FF5CDB','#FFFFFF'][i % 8],
  size: `${(i % 5) + 5}px`,
  delay: `${(i * 0.09) % 1.4}s`,
  dur: `${1.2 + (i % 6) * 0.15}s`,
  shape: i % 4 === 0 ? 'star' : i % 4 === 1 ? 'rect' : 'circle',
}));

// Sparkle positions inside the art panel
const SPARKLES = ['✦','✦','✦','✧','✦'].map((s, i) => ({
  id: i, sym: s,
  style: {
    top: `${15 + (i * 17) % 55}%`,
    left: `${10 + (i * 23) % 75}%`,
    fontSize: `${12 + (i % 3) * 6}px`,
    animationDelay: `${i * 0.2}s`,
  }
}));

export default function LevelClearModal({ level, seeds, timeLeft, onReplay, onNext, skinId = 'classic' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Time bonus string
  const timeBonusStr = timeLeft > 0 ? `+${timeLeft}s` : '—';

  return (
    <div className={`modal-backdrop ${visible ? 'modal-backdrop--visible' : ''}`}>

      {/* Confetti */}
      {CONFETTI.map(c => (
        <div key={c.id} className="modal-confetti" style={{
          left: c.left,
          width: c.size, height: c.size,
          background: c.color,
          borderRadius: c.shape === 'circle' ? '50%' : c.shape === 'star' ? '2px' : '1px',
          animationDelay: c.delay,
          animationDuration: c.dur,
          transform: c.shape === 'star' ? 'rotate(45deg)' : c.shape === 'rect' ? `rotate(${c.id * 15}deg)` : 'none',
        }}/>
      ))}

      {/* Modal card */}
      <div className={`modal-card ${visible ? 'modal-card--in' : ''}`}>

        {/* LEVEL CLEAR title */}
        <div className="lc-title">LEVEL CLEAR!</div>

        {/* Art panel — happy chicken with sparkles */}
        <div className="lc-art-panel">
          <div className="lc-art-bg"/>
          {SPARKLES.map(sp => (
            <span key={sp.id} className="lc-sparkle" style={sp.style}>{sp.sym}</span>
          ))}
          <ChickenSVG skinId={skinId} mood="happy" size={130} className="lc-chicken"/>
          <div className="lc-chicken-shadow"/>
        </div>

        {/* Stats row */}
        <div className="lc-stats-row">
          <div className="lc-stat">
            <span className="lc-stat-icon">🌾</span>
            <div>
              <div className="lc-stat-label">Seeds Collected</div>
              <div className="lc-stat-val">{seeds}</div>
            </div>
          </div>
          <div className="lc-stat-divider"/>
          <div className="lc-stat">
            <span className="lc-stat-icon">⏱️</span>
            <div>
              <div className="lc-stat-label">Time Bonus</div>
              <div className="lc-stat-val">{timeBonusStr}</div>
            </div>
          </div>
        </div>

        {/* Level badge */}
        <div className="lc-level-badge">Level {level} Complete!</div>

        {/* Buttons */}
        <div className="lc-btns">
          <button
            className="lc-btn lc-btn--replay"
            onClick={onReplay}
          >
            REPLAY
          </button>
          <button
            className="lc-btn lc-btn--next"
            onClick={onNext}
          >
            NEXT LEVEL
          </button>
        </div>

      </div>
    </div>
  );
}
