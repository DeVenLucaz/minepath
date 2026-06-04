import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChickenSVG from './ChickenSVG';
import { SeedIcon, FeatIcon, DoubleScoreIcon, ReloadIcon, PlayIcon, PawIcon, StarIcon, EggIcon } from './Icons';

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

export default function LevelClearModal({ 
  level, 
  seeds, 
  timeLeft, 
  onReplay, 
  onNext, 
  skinId = 'classic', 
  eggFound = null,
  tileSeedsCollected = 0,
  baseLevelReward = 0,
  petBonusSeeds = 0,
  skillBonusSeeds = 0,
  multiplierBonusSeeds = 0
}) {
  // Time bonus string
  const timeBonusStr = timeLeft > 0 ? `+${timeLeft}s` : '—';

  const eggConfig = {
    brown_egg: { text: 'Brown Egg added to Hatchery', bg: 'rgba(121, 85, 72, 0.15)', border: '#795548', color: '#8d5c1a' },
    blue_egg: { text: 'Blue Egg added to Hatchery', bg: 'rgba(33, 150, 243, 0.15)', border: '#2196F3', color: '#2196F3' },
    golden_egg: { text: 'Golden Egg added to Hatchery', bg: 'rgba(255, 215, 0, 0.15)', border: '#FFD700', color: '#FFD700' },
  };

  const currentEgg = eggFound ? eggConfig[eggFound] : null;

  return (
    <motion.div 
      className="modal-backdrop modal-backdrop--visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >

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
      <motion.div 
        className="modal-card modal-card--in"
        initial={{ scale: 0.6, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.6, duration: 0.6 }}
      >

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

        {/* Stats Section — Breakdown */}
        <div className="lc-stats-section">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary flex items-center gap-1.5">
                <SeedIcon size={14} className="text-gold" /> Tile Seeds
              </span>
              <span className="font-bold text-primary">{tileSeedsCollected}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary flex items-center gap-1.5">
                <FeatIcon size={14} className="text-gold" /> Level Reward
              </span>
              <span className="font-bold text-primary">{baseLevelReward}</span>
            </div>
            {multiplierBonusSeeds > 0 && (
              <div className="flex justify-between items-center text-sm text-gold">
                <span className="flex items-center gap-1.5">
                  <DoubleScoreIcon size={14} className="text-gold" /> Multipliers
                </span>
                <span className="font-bold">+{multiplierBonusSeeds}</span>
              </div>
            )}
            {petBonusSeeds > 0 && (
              <div className="flex justify-between items-center text-sm text-accent-green">
                <span className="flex items-center gap-1.5">
                  <PawIcon size={12} className="text-accent-green" /> Pet Bonus
                </span>
                <span className="font-bold">+{petBonusSeeds}</span>
              </div>
            )}
            {skillBonusSeeds > 0 && (
              <div className="flex justify-between items-center text-sm text-accent-blue">
                <span className="flex items-center gap-1.5">
                  <StarIcon size={12} className="text-accent-blue" /> Skill Bonus
                </span>
                <span className="font-bold">+{skillBonusSeeds}</span>
              </div>
            )}
            
            <div className="h-px bg-white/10 my-2" />
            
            <div className="flex justify-between items-center text-lg font-black">
              <span className="text-primary">TOTAL</span>
              <span className="text-gold flex items-center gap-1" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>
                {tileSeedsCollected + baseLevelReward + petBonusSeeds + skillBonusSeeds + multiplierBonusSeeds}
                <SeedIcon size={18} className="text-gold inline-block" />
              </span>
            </div>
          </div>
        </div>

        {/* Egg Found Section */}
        {currentEgg && (
          <motion.div 
            className="lc-egg-found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '10px 20px',
              padding: '10px 14px',
              background: currentEgg.bg,
              border: `1px dashed ${currentEgg.border}`,
              borderRadius: '12px',
              textAlign: 'left'
            }}
          >
            <EggIcon size={32} style={{ color: currentEgg.color, filter: currentEgg.color === '#FFD700' ? 'drop-shadow(0 0 6px rgba(255,215,0,0.6))' : 'none' }} className="inline-block" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: currentEgg.border, letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>EGG FOUND!</div>
              <div className="text-primary font-bold text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{currentEgg.text}</div>
            </div>
          </motion.div>
        )}

        {/* Level badge */}
        <div className="lc-level-badge">Level {level} Complete!</div>

        {/* Buttons */}
        <div className="lc-btns">
          <button
            className="lc-btn lc-btn--replay flex items-center justify-center gap-1.5"
            onClick={onReplay}
          >
            <ReloadIcon size={14} />
            <span>REPLAY</span>
          </button>
          <button
            className="lc-btn lc-btn--next flex items-center justify-center gap-1.5"
            onClick={onNext}
          >
            <PlayIcon size={14} className="text-green-950" />
            <span>NEXT LEVEL</span>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
