import React, { useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import PetSVG from './PetSVG';
import { BackIcon, SeedIcon } from './Icons';

const TITLE_PALETTES = {
  SHOP:     ['#FFFFFF'],
  SCORES:   ['#FFFFFF'],
  SETTINGS: ['#FFFFFF'],
  FEATS:    ['#FFFFFF'],
  DEFAULT:  ['#FFFFFF'],
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

export default function TopBar({ title, onBack, showSeeds = true, mood = 'normal' }) {
  const seeds = gameStore.getSeeds();
  const palette = TITLE_PALETTES[title.toUpperCase()] || TITLE_PALETTES.DEFAULT;
  const equippedPet = useMemo(() => gameStore.getEquippedPet(), []);

  return (
    <div className="topbar" style={{ zIndex: 100 }}>
      <button 
        type="button"
        className="topbar-back" 
        onClick={(e) => { e.stopPropagation(); onBack && onBack(); }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <BackIcon size={16} className="mr-1" />
        <span className="topbar-back-text">Back</span>
      </button>

      <BubblyTitle text={title} palette={palette} />

      <div className="flex items-center gap-3">
        {showSeeds && (
          <div className="topbar-seeds">
            <SeedIcon size={16} className="topbar-seeds-icon text-gold" />
            <span className="topbar-seeds-val">{seeds}</span>
          </div>
        )}

        {equippedPet && (
          <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center overflow-hidden backdrop-blur-md">
            <PetSVG petId={equippedPet} size={32} mood={mood} />
          </div>
        )}
        
        {!equippedPet && !showSeeds && <div className="topbar-seeds-spacer" />}
      </div>
    </div>
  );
}
