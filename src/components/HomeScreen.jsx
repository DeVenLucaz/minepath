import React, { useEffect, useState, useMemo, useRef } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import ChickenSVG from './ChickenSVG';
import HelpModal from './HelpModal';

// Pre-generate stars so they don't re-randomize on every render
const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37.3 + 11) % 100}%`,
  top:  `${(i * 53.7 + 7)  % 100}%`,
  size: `${(i % 4) + 2}px`,
  delay: `${(i * 0.27) % 3}s`,
  dur:   `${1.6 + (i % 5) * 0.3}s`,
}));

// Logo letter colours matching mockup
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

export default function HomeScreen({ onPlay, onShop, onLeaderboard, onSettings, onDaily, onAchievements }) {
  const [seeds, setSeeds]   = useState(0);
  const [bounce, setBounce] = useState(false);
  const [daily, setDaily]   = useState({ date: '', played: false, score: 0 });
  const [feats, setFeats]   = useState(0);
  const [isGolden, setIsGolden] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const clickTimes = useRef([]);
  const equippedSkin        = useMemo(() => gameStore.getEquippedSkin(), []);

  useEffect(() => {
    try {
      setSeeds(gameStore.getSeeds());
      setDaily(gameStore.getDailyChallenge());
      setIsGolden(gameStore.hasGoldenHomeMascot());
      // Count claimed feats from new achievements system
      const ach = gameStore.getAchievements();
      const claimed = Object.values(ach).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
      setFeats(claimed);
      audio.startBackground();
    } catch (e) {
      console.error('Home init error:', e);
    }
  }, []);

  // Smooth bounce animation
  useEffect(() => {
    const t = setInterval(() => setBounce(b => !b), 900);
    return () => clearInterval(t);
  }, []);

  const handleChickenClick = () => {
    if (isGolden) return;
    
    const now = Date.now();
    clickTimes.current = [...clickTimes.current.filter(t => now - t < 2000), now];
    
    if (clickTimes.current.length >= 7) {
      gameStore.unlockGoldenMascot();
      setIsGolden(true);
      audio.powerupCollect(); // Play a sound for feedback
    }
  };

  return (
    <div className="home-screen">

      {/* ── STARS BACKGROUND ── */}
      <div className="stars-bg" aria-hidden="true">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}/>
        ))}
      </div>

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-10 h-10 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg z-[60] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>

      {/* ── GROUND GLOW ── */}
      <div className="home-ground-glow" aria-hidden="true"/>

      {/* ── MAIN CONTENT ── */}
      <div className="home-content">

        {/* LOGO */}
        <div className="home-logo">
          {LOGO_LETTERS.map((l, i) => (
            <span key={i} className="home-logo-letter" style={{ color: l.color }}>
              {l.ch}
            </span>
          ))}
        </div>

        {/* CHICKEN */}
        <div 
          className={`home-chicken-wrap ${bounce ? 'bounce-up' : 'bounce-down'} ${isGolden ? 'golden-mascot' : ''}`}
          onClick={handleChickenClick}
        >
          <ChickenSVG
            skinId={isGolden ? 'classic' : equippedSkin} 
            mood="normal"
            size={150}
            className="home-chicken-svg"
          />
          {/* Subtle glow under chicken */}
          <div className="home-chicken-shadow"/>
        </div>

        {/* STATS CHIPS — seeds + feats */}
        <div className="home-chips">
          <div className="home-chip home-chip-seeds">
            <span className="home-chip-icon">🌾</span>
            <span className="home-chip-val">{seeds}</span>
          </div>
          <div
            className="home-chip home-chip-feats"
            onClick={onAchievements}
            role="button"
            tabIndex={0}
          >
            <span className="home-chip-icon">🪶</span>
            <span className="home-chip-val">{feats}</span>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="home-buttons">

          {/* Daily Challenge */}
          {!daily.played ? (
            <button
              className="home-btn-daily"
              onClick={onDaily}
            >
              <span className="home-btn-icon">📅</span>
              <span>DAILY CHALLENGE</span>
            </button>
          ) : (
            <div className="home-daily-done">
              ✅ Daily done! &nbsp;{daily.score} 🌾
            </div>
          )}

          {/* PLAY */}
          <button
            className="home-btn-play"
            onClick={() => { audio.init(); onPlay(); }}
          >
            <span className="home-btn-icon">🎮</span>
            <span>PLAY</span>
          </button>

          {/* Bottom row */}
          <div className="home-btn-row">
            <button
              className="home-btn-sq home-btn-sq--yellow"
              onClick={onShop}
            >
              <span className="home-btn-sq-icon">🛒</span>
              <span className="home-btn-sq-label">SHOP</span>
            </button>
            <button
              className="home-btn-sq home-btn-sq--purple"
              onClick={onLeaderboard}
            >
              <span className="home-btn-sq-icon">🏆</span>
              <span className="home-btn-sq-label">SCORES</span>
            </button>
            <button
              className="home-btn-sq home-btn-sq--red"
              onClick={onSettings}
            >
              <span className="home-btn-sq-icon">⚙️</span>
              <span className="home-btn-sq-label">SETTINGS</span>
            </button>
          </div>

        </div>

        {/* Hint */}
        <div className="home-hint">
          Tap tiles to move 🐔 · Long press to peek 👁️
        </div>

      </div>

      {showHelp && (
        <HelpModal
          title="How to Play"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Goal', text: 'Navigate your chicken from start to the flag without stepping on mines.' },
            { heading: 'Controls', text: 'Tap any adjacent tile to move. Long press to peek at a tile for 1 second.' },
            { heading: 'Seeds', text: 'Earn seeds by completing levels. Use them to buy powerups, skins, and pets in the shop.' },
            { heading: 'Powerups', text: 'Collect powerups on tiles — shields protect you, reveals uncover safe tiles, slow-mo gives extra time.' },
          ]}
        />
      )}
    </div>
  );
}
