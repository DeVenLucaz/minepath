import React, { useEffect, useState } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';

export default function HomeScreen({ onPlay, onShop, onLeaderboard, onSettings, onDaily, onAchievements }) {
  const [seeds, setSeeds] = useState(0);
  const [bounce, setBounce] = useState(false);
  const [daily, setDaily] = useState(gameStore.getDailyChallenge());
  const [ach, setAch] = useState(gameStore.getAchievements());

  useEffect(() => {
    setSeeds(gameStore.getSeeds());
    setDaily(gameStore.getDailyChallenge());
    setAch(gameStore.getAchievements());
    audio.startBackground();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setBounce(b => !b), 800);
    return () => clearInterval(interval);
  }, []);

  const bestLevel = gameStore.getBestLevel();
  const unlockedFeathers = Object.values(ach).filter(v => v === true || v >= 20 || (typeof v === 'number' && v >= 500)).length;

  return (
    <div className="home-screen">
      <div className="stars-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
          }} />
        ))}
      </div>

      <div className="home-content">
        <div className="logo-container">
          <div className="logo-text">MINE</div>
          <div className="logo-text logo-path">PATH</div>
          <div className="logo-subtitle">🌾 Step carefully, little chicken! 🌾</div>
        </div>

        <div className={`home-chicken ${bounce ? 'bounce-up' : 'bounce-down'}`}>
          <div className="chicken-body-main">
            <div className="chicken-head-main">
              <div className="chicken-eye-main left" />
              <div className="chicken-eye-main right" />
              <div className="chicken-beak-main" />
              <div className="chicken-comb-main" />
            </div>
            <div className="chicken-wing-main left-wing" />
            <div className="chicken-wing-main right-wing" />
            <div className="chicken-feet-main">
              <div className="chicken-foot" />
              <div className="chicken-foot" />
            </div>
          </div>
        </div>

        <div className="home-stats-bar">
          <div className="home-stat-chip">
            <span className="stat-icon">🌾</span>
            <span className="stat-val">{seeds}</span>
          </div>
          <div className="home-stat-chip" onClick={onAchievements} style={{ cursor: 'pointer' }}>
            <span className="stat-icon">🪶</span>
            <span className="stat-val">{unlockedFeathers}</span>
          </div>
        </div>

        <div className="home-buttons">
          {!daily.played ? (
            <button className="btn-daily-challenge" onClick={onDaily}>
              📅 DAILY CHALLENGE
            </button>
          ) : (
            <div className="daily-done">✅ Daily: {daily.score}🌾</div>
          )}

          <button
            className="btn-primary btn-play"
            onTouchStart={(e) => { e.preventDefault(); audio.init(); onPlay(); }}
            onClick={() => { audio.init(); onPlay(); }}
          >
            🎮 PLAY
          </button>
          <div className="home-buttons-row">
            <button
              className="btn-secondary btn-shop"
              onTouchStart={(e) => { e.preventDefault(); onShop(); }}
              onClick={onShop}
            >
              🛒 SHOP
            </button>
            <button
              className="btn-secondary btn-leader"
              onTouchStart={(e) => { e.preventDefault(); onLeaderboard(); }}
              onClick={onLeaderboard}
            >
              🏆 SCORES
            </button>
            <button
              className="btn-secondary btn-settings"
              style={{ flex: '0 0 55px' }}
              onTouchStart={(e) => { e.preventDefault(); onSettings(); }}
              onClick={onSettings}
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="home-hint">
          Tap tiles to move 🐔 | Long press to peek 👁️
        </div>
      </div>
    </div>
  );
}
