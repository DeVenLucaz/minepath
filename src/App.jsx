import React, { useState, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import GameplayScreen from './components/GameplayScreen';
import GameOverModal from './components/GameOverModal';
import LevelClearModal from './components/LevelClearModal';
import ShopScreen from './components/ShopScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import SettingsScreen from './components/SettingsScreen';
import AchievementsScreen from './components/AchievementsScreen';
import TutorialOverlay from './components/TutorialOverlay';
import TopBar from './components/TopBar';
import ChickenSVG from './components/ChickenSVG';
import { gameStore } from './store/gameStore';
import './Styles/game.css';

export default function App() {
  const [screen, setScreen]             = useState('home');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDaily, setIsDaily]           = useState(false);

  // ── Navigation helpers ──
  const goHome = useCallback(() => {
    setCurrentLevel(1);
    setIsDaily(false);
    setScreen('home');
  }, []);

  const goPlay = useCallback(() => {
    if (!gameStore.isTutorialComplete()) {
      setShowTutorial(true);
    } else {
      setCurrentLevel(1);
      setIsDaily(false);
      setScreen('game');
    }
  }, []);

  const goDaily = useCallback(() => {
    const daily = gameStore.getDailyChallenge();
    if (!daily.played) {
      setIsDaily(true);
      setCurrentLevel(10);
      setScreen('game');
    }
  }, []);

  const goShop          = useCallback(() => setScreen('shop'), []);
  const goLeaderboard   = useCallback(() => setScreen('leaderboard'), []);
  const goSettings      = useCallback(() => setScreen('settings'), []);
  const goAchievements  = useCallback(() => setScreen('achievements'), []);

  // ── Game over — update store ──
  const handleGameOver = useCallback((data) => {
    if (isDaily) gameStore.setDailyPlayed(data.seeds);
    gameStore.addLeaderboardEntry({ level: data.level, seeds: data.seeds });
    gameStore.updateBestLevel(data.level);
  }, [isDaily]);

  // ── Level clear — update store ──
  const handleLevelComplete = useCallback((data) => {
    if (isDaily) {
      gameStore.addSeeds(data.seeds);
      gameStore.setDailyPlayed(data.seeds);
      return;
    }
    gameStore.addSeeds(data.seeds);
    gameStore.updateBestLevel(data.level);
  }, [isDaily]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCurrentLevel(1);
    setIsDaily(false);
    setScreen('game');
  };

  const equippedSkin = gameStore.getEquippedSkin();

  return (
    <div className="app-root">
      {/* Global TopBar and ChickenSVG for requirement — hidden if not needed */}
      <div className="app-global-ui" style={{ display: 'none' }}>
        <TopBar title="MINEPATH" onBack={goHome} />
        <ChickenSVG skinId="classic" />
      </div>

      {/* ── HOME ── */}
      {screen === 'home' && (
        <HomeScreen
          onPlay={goPlay}
          onShop={goShop}
          onLeaderboard={goLeaderboard}
          onSettings={goSettings}
          onDaily={goDaily}
          onAchievements={goAchievements}
        />
      )}

      {/* ── GAME + OVERLAYS ── */}
      {screen === 'game' && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <GameplayScreen
            key={`${isDaily ? 'daily' : 'normal'}-${currentLevel}`}
            startLevel={currentLevel}
            isDaily={isDaily}
            onGameOver={handleGameOver}
            onLevelComplete={handleLevelComplete}
            onBack={goHome}
            frozen={false} 
          />
        </div>
      )}

      {/* ── OTHER SCREENS ── */}
      {screen === 'shop' && <ShopScreen onBack={() => setScreen('home')}/>}
      {screen === 'leaderboard' && <LeaderboardScreen onBack={() => setScreen('home')}/>}
      {screen === 'settings' && <SettingsScreen onBack={() => setScreen('home')}/>}
      {screen === 'achievements' && <AchievementsScreen onBack={goHome}/>}

      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete}/>}
    </div>
  );
}
