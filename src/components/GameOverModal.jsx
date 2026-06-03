import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import ChickenSVG from './ChickenSVG';

// Confetti particles — pre-seeded so no rerender flicker
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37.1 + 5) % 100}%`,
  color: ['#FF5C5C','#FFD700','#5CFF8F','#5CB8FF','#FF9A3C','#A78BFA','#FF5CDB'][i % 7],
  size: `${(i % 4) + 6}px`,
  delay: `${(i * 0.11) % 1.2}s`,
  dur: `${1.4 + (i % 5) * 0.18}s`,
  shape: i % 3 === 0 ? 'star' : 'circle',
}));

export default function GameOverModal({ level, seeds, onRetry, onHome, skinId = 'classic' }) {
  const [totalSeeds, setTotalSeeds] = useState(0);
  const [bestLevel, setBestLevel]   = useState(0);
  const isRecord = useMemo(() => level >= bestLevel && level > 0, [level, bestLevel]);

  useEffect(() => {
    setTotalSeeds(gameStore.getSeeds());
    setBestLevel(gameStore.getBestLevel());
  }, []);

  return (
    <motion.div 
      className="modal-backdrop modal-backdrop--visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >

      {/* Confetti scattered behind modal */}
      {CONFETTI.map(c => (
        <div key={c.id} className="modal-confetti" style={{
          left: c.left,
          width: c.size, height: c.size,
          background: c.color,
          borderRadius: c.shape === 'star' ? '2px' : '50%',
          animationDelay: c.delay,
          animationDuration: c.dur,
          transform: c.shape === 'star' ? 'rotate(45deg)' : 'none',
        }}/>
      ))}

      {/* Modal card */}
      <motion.div 
        className="modal-card modal-card--in"
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
      >

        {/* OH NO title above card */}
        <div className="mo-title">OH NO!</div>

        {/* Chicken art panel */}
        <div className="mo-art-panel">
          <div className="mo-art-bg"/>
          <ChickenSVG skinId={skinId} mood="sad" size={130} className="mo-chicken"/>
          {isRecord && (
            <div className="mo-record-badge">🏆 NEW RECORD!</div>
          )}
        </div>

        {/* Stats */}
        <div className="mo-stats">
          <div className="mo-stat-row">
            <span className="mo-stat-label">FINAL SCORE:</span>
            <span className="mo-stat-val">{(level * seeds).toLocaleString()}</span>
          </div>
          <div className="mo-stat-divider"/>
          <div className="mo-stat-row">
            <span className="mo-stat-label">SEEDS COLLECTED:</span>
            <span className="mo-stat-val">{seeds} 🌾</span>
          </div>
        </div>

        {/* Buttons */}
        <button
          className="mo-btn mo-btn--retry"
          onClick={onRetry}
        >
          <span>🔄</span>
          <span>RETRY</span>
        </button>
        <button
          className="mo-btn mo-btn--home"
          onClick={() => onHome()}
        >
          <span>🏠</span>
          <span>HOME</span>
        </button>

      </motion.div>
    </motion.div>
  );
}
