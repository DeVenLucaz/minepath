import React, { useEffect, useState, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import ChickenSVG from './ChickenSVG';
import PetSVG from './PetSVG';
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

export default function SanctuaryScreen({ onPlay, onEndless, onShop, onLeaderboard, onSettings, onDaily, onAchievements, onSkillTree, onHubUpgrades }) {
  const [seeds, setSeeds] = useState(gameStore.getSeeds());
  const [equippedSkin, setEquippedSkin] = useState(gameStore.getEquippedSkin());
  const [equippedPet, setEquippedPet] = useState(gameStore.getEquippedPet());
  const [isGolden, setIsGolden] = useState(gameStore.hasGoldenHomeMascot());
  const [bounce, setBounce] = useState(false);
  const [hasReadyEggs, setHasReadyEggs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dailyStatus, setDailyStatus] = useState(gameStore.getDailyChallenge());
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    // Fresh pull on every mount/nav
    setSeeds(gameStore.getSeeds());
    setEquippedSkin(gameStore.getEquippedSkin());
    setEquippedPet(gameStore.getEquippedPet());
    setIsGolden(gameStore.hasGoldenHomeMascot());
    setDailyStatus(gameStore.getDailyChallenge());
    
    // Check if any eggs are ready for visual feedback
    const eggs = gameStore.getEggs();
    const now = Date.now();
    setHasReadyEggs(eggs.some(e => e.status === 'ready' || now >= e.hatchTime));

    const bounceT = setInterval(() => setBounce(b => !b), 900);
    const focusT  = setInterval(() => {
      const dirs = ['left', 'right', null, null];
      setFocus(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 2500);

    return () => { clearInterval(bounceT); clearInterval(focusT); };
  }, []);

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
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={onSettings}
          className="w-11 h-11 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-xl shadow-lg active:scale-90 transition-transform"
        >
          ⚙️
        </button>
      </div>

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
      >
        ?
      </button>

      <div className="sanctuary-content">
        {/* LOGO */}
        <div className="home-logo">
          {"MINEPATH".split('').map((char, i) => (
            <span key={i} className="home-logo-letter">{char}</span>
          ))}
        </div>

        {/* CHICKEN & PET */}
        <div className={`home-chicken-wrap ${bounce ? 'bounce-up' : 'bounce-down'} ${isGolden ? 'golden-mascot' : ''} my-2`}>
          <ChickenSVG skinId={isGolden ? 'classic' : equippedSkin} size={140} focus={focus} />
          {equippedPet && (
            <div 
              className="absolute -right-6 bottom-4 filter drop-shadow-xl"
              style={{ width: 60, height: 60, transform: 'scaleX(-1)' }} // Mirror pet to face chicken
            >
              <PetSVG petId={equippedPet} size="100%" mood="normal" />
            </div>
          )}
        </div>

        {/* SEEDS CHIP */}
        <div className="home-chip home-chip-seeds">
          <span className="home-chip-icon">🌾</span>
          <span className="home-chip-val">{seeds}</span>
        </div>

        {/* NAVIGATION GRID */}
        <div className="sanctuary-nav">
          <button className="sanctuary-btn-main" onClick={() => { audio.init(); onPlay(); }}>
            <span>🎮</span> PLAY
          </button>

          <div className="flex gap-2 w-full">
            <button className="sanctuary-btn-main flex-1 !text-lg relative" 
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }} 
              onClick={onDaily}
              disabled={dailyStatus.played}
            >
              <div className="flex flex-col items-center leading-tight">
                <span className="text-[10px] uppercase font-black opacity-70 tracking-widest mb-0.5">
                  {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  DAILY
                </div>
              </div>
              {!dailyStatus.played && <div className="egg-indicator-dot" />}
            </button>

            <button className="sanctuary-btn-main flex-1 !text-lg" 
              style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309)' }} 
              onClick={() => { audio.init(); onEndless(); }}
            >
              <span>🌀</span> ENDLESS
            </button>
          </div>
          
          <button className="sanctuary-btn-main w-full !text-lg relative" 
            style={{ background: 'linear-gradient(135deg, #22c55e, #166534)' }} 
            onClick={onHubUpgrades}
          >
            <span>🏙️</span> MY HUB & HATCHERY
            {hasReadyEggs && <div className="egg-indicator-dot" />}
          </button>
          
          <div className="flex gap-2 w-full">
            <button className="sanctuary-btn-sq flex-1" onClick={onShop}>
              <span className="text-xl">🛒</span>
              <span className="sanctuary-btn-sq-label">SHOP</span>
            </button>
            <button className="sanctuary-btn-sq flex-1" onClick={onSkillTree}>
              <span className="text-xl">🌳</span>
              <span className="sanctuary-btn-sq-label">SKILLS</span>
            </button>
            <button className="sanctuary-btn-sq flex-1" onClick={onAchievements}>
              <span className="text-xl">🏆</span>
              <span className="sanctuary-btn-sq-label">FEATS</span>
            </button>
          </div>
        </div>
        
        <div className="home-hint">
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
