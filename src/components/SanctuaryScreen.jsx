import React, { useEffect, useState, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import ChickenSVG from './ChickenSVG';
import { PETS } from '../data/pets';
import HelpModal from './HelpModal';

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37.3 + 11) % 100}%`,
  top:  `${(i * 53.7 + 7)  % 100}%`,
  size: `${(i % 4) + 2}px`,
  delay: `${(i * 0.27) % 3}s`,
  dur:   `${1.6 + (i % 5) * 0.3}s`,
}));

const LOGO_LETTERS = [
  { ch: 'M', color: '#FF5C5C' },
  { ch: 'I', color: '#FF9A3C' },
  { ch: 'N', color: '#FFD700' },
  { ch: 'E', color: '#5CFF8F' },
  { ch: 'P', color: '#5CB8FF' },
  { ch: 'A', color: '#A78BFA' },
  { ch: 'T', color: '#FF5CDB' },
  { ch: 'H', color: '#FFD700' },
];

export default function SanctuaryScreen({ onPlay, onEndless, onShop, onLeaderboard, onSettings, onDaily, onAchievements, onSkillTree, onHubUpgrades }) {
  const [seeds, setSeeds] = useState(0);
  const [equippedSkin, setEquippedSkin] = useState('classic');
  const [equippedPet, setEquippedPet] = useState(null);
  const [isGolden, setIsGolden] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [hasReadyEggs, setHasReadyEggs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setSeeds(gameStore.getSeeds());
    setEquippedSkin(gameStore.getEquippedSkin());
    setEquippedPet(gameStore.getEquippedPet());
    setIsGolden(gameStore.hasGoldenHomeMascot());
    
    // Check if any eggs are ready for visual feedback
    const eggs = gameStore.getEggs();
    const now = Date.now();
    setHasReadyEggs(eggs.some(e => e.status === 'ready' || now >= e.hatchTime));

    audio.startBackground();
    const t = setInterval(() => setBounce(b => !b), 900);
    return () => clearInterval(t);
  }, []);

  const activePet = PETS.find(p => p.id === equippedPet);

  return (
    <div className="sanctuary-screen">
      <div className="stars-bg">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}/>
        ))}
      </div>

      {/* TOP ACTIONS */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
        <button 
          onClick={onSettings}
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: '2px solid rgba(255,255,255,0.2)', 
            borderRadius: '12px', 
            padding: '10px',
            fontSize: '20px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ⚙️
        </button>
      </div>

      <button 
        onClick={() => setShowHelp(true)}
        style={{ 
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          background: 'rgba(255,255,255,0.2)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)', 
          borderRadius: '50%', 
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '900',
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 110,
          cursor: 'pointer'
        }}
      >
        ?
      </button>

      <div className="sanctuary-content" style={{ justifyContent: 'center', gap: '10px' }}>
        {/* LOGO */}
        <div className="home-logo" style={{ transform: 'scale(0.85)' }}>
          {LOGO_LETTERS.map((l, i) => (
            <span key={i} className="home-logo-letter" style={{ color: l.color }}>{l.ch}</span>
          ))}
        </div>

        {/* CHICKEN & PET */}
        <div className={`home-chicken-wrap ${bounce ? 'bounce-up' : 'bounce-down'} ${isGolden ? 'golden-mascot' : ''}`} style={{ margin: '10px 0' }}>
          <ChickenSVG skinId={isGolden ? 'classic' : equippedSkin} size={130} />
          {activePet && (
            <div className="pet-entity" style={{ position: 'absolute', right: -30, bottom: 20, fontSize: '30px' }}>
              {activePet.emoji}
            </div>
          )}
        </div>

        {/* SEEDS CHIP */}
        <div className="home-chip home-chip-seeds">
          <span className="home-chip-icon">🌾</span>
          <span className="home-chip-val">{seeds}</span>
        </div>

        {/* NAVIGATION GRID */}
        <div className="sanctuary-nav" style={{ marginTop: '5px' }}>
          <button className="sanctuary-btn-main" onClick={() => { audio.init(); onPlay(); }}>
            <span>🎮</span> PLAY
          </button>

          <button className="sanctuary-btn-main" 
            style={{ 
              background: 'linear-gradient(135deg, #FF9800, #F57C00)', 
              fontSize: '18px'
            }} 
            onClick={() => { audio.init(); onEndless(); }}
          >
            <span>🌀</span> ENDLESS
          </button>
          
          <button className="sanctuary-btn-main" 
            style={{ 
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', 
              fontSize: '18px',
              gridColumn: 'span 3',
              position: 'relative'
            }} 
            onClick={onHubUpgrades}
          >
            <span>🏙️</span> MY HUB & HATCHERY
            {hasReadyEggs && <div className="egg-indicator-dot" />}
          </button>
          
          <button className="sanctuary-btn-sq" onClick={onShop}>
            <span className="sanctuary-btn-sq-icon">🛒</span>
            <span className="sanctuary-btn-sq-label">SHOP</span>
          </button>
          <button className="sanctuary-btn-sq" onClick={onSkillTree}>
            <span className="sanctuary-btn-sq-icon">🌳</span>
            <span className="sanctuary-btn-sq-label">SKILLS</span>
          </button>
          <button className="sanctuary-btn-sq" onClick={onAchievements}>
            <span className="sanctuary-btn-sq-icon">🏆</span>
            <span className="sanctuary-btn-sq-label">FEATS</span>
          </button>
        </div>
        
        <div className="home-hint" style={{ opacity: 0.5, fontSize: '10px' }}>
          Tap tiles to move • Long press to peek
        </div>
      </div>

      {showHelp && (
        <HelpModal
          title="Hub Guide"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Your Hub', text: 'This is your base. Access all game features from here.' },
            { heading: 'Endless Mode', text: 'Challenge yourself with the endless survival mode.' },
            { heading: 'Skill Tree', text: 'Spend feathers to unlock passive skills that help in gameplay.' },
            { heading: 'Hatchery', text: 'Go to My Hub and Hatchery to manage your eggs and pets.' },
          ]}
        />
      )}
    </div>
  );
}
