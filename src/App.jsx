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
import { gameStore } from './store/gameStore';
import './styles/game.css';

export default function App() {
  const [screen, setScreen]             = useState('home');
  const [gameOverData, setGameOverData] = useState(null);
  const [levelClearData, setLevelClearData] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDaily, setIsDaily]           = useState(false);

  // ── Navigation helpers ──
  const goHome = useCallback(() => {
    setCurrentLevel(1);
    setIsDaily(false);
    setGameOverData(null);
    setLevelClearData(null);
    setScreen('home');
  }, []);

  const goPlay = useCallback(() => {
    if (!gameStore.isTutorialComplete()) {
      setShowTutorial(true);
    } else {
      setCurrentLevel(1);
      setIsDaily(false);
      setGameOverData(null);
      setLevelClearData(null);
      setScreen('game');
    }
  }, []);

  const goDaily = useCallback(() => {
    const daily = gameStore.getDailyChallenge();
    if (!daily.played) {
      setIsDaily(true);
      setCurrentLevel(10);
      setGameOverData(null);
      setLevelClearData(null);
      setScreen('game');
    }
  }, []);

  const goShop          = useCallback(() => setScreen('shop'), []);
  const goLeaderboard   = useCallback(() => setScreen('leaderboard'), []);
  const goSettings      = useCallback(() => setScreen('settings'), []);
  const goAchievements  = useCallback(() => setScreen('achievements'), []);

  // ── Game over — show overlay on top of frozen game board ──
  const handleGameOver = useCallback((data) => {
    if (isDaily) gameStore.setDailyPlayed(data.seeds);
    gameStore.addLeaderboardEntry({ level: data.level, seeds: data.seeds });
    gameStore.updateBestLevel(data.level);
    setGameOverData(data);
    // Keep screen === 'game' so the grid shows blurred behind the modal
  }, [isDaily]);

  // ── Level clear — show overlay, player taps Next or Replay ──
  const handleLevelComplete = useCallback((data) => {
    if (isDaily) {
      gameStore.addSeeds(data.seeds);
      gameStore.setDailyPlayed(data.seeds);
      setGameOverData({ level: data.level, seeds: data.seeds });
      return;
    }
    gameStore.addSeeds(data.seeds);
    gameStore.updateBestLevel(data.level);
    setLevelClearData({ level: data.level, seeds: data.seeds, timeLeft: data.timeLeft || 0 });
    // Keep screen === 'game' so grid stays behind modal
  }, [isDaily]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCurrentLevel(1);
    setIsDaily(false);
    setScreen('game');
  };

  // Retry: dismiss modal, restart from level 1
  const handleRetry = useCallback(() => {
    setGameOverData(null);
    setLevelClearData(null);
    setCurrentLevel(1);
    setIsDaily(false);
    // Re-mount GameplayScreen via key change
    setScreen('home');
    requestAnimationFrame(() => setScreen('game'));
  }, []);

  // Next level: dismiss modal, advance level
  const handleNextLevel = useCallback(() => {
    const next = (levelClearData?.level || currentLevel) + 1;
    setLevelClearData(null);
    setCurrentLevel(next);
  }, [levelClearData, currentLevel]);

  // Replay same level
  const handleReplay = useCallback(() => {
    const lvl = levelClearData?.level || currentLevel;
    setLevelClearData(null);
    setCurrentLevel(lvl);
    setScreen('home');
    requestAnimationFrame(() => setScreen('game'));
  }, [levelClearData, currentLevel]);

  const equippedSkin = gameStore.getEquippedSkin();

  return (
    <div className="app-root">

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
            frozen={!!(gameOverData || levelClearData)}
          />

          {/* GameOver overlay */}
          {gameOverData && (
            <GameOverModal
              level={gameOverData.level}
              seeds={gameOverData.seeds}
              skinId={equippedSkin}
              onRetry={handleRetry}
              onHome={goHome}
            />
          )}

          {/* LevelClear overlay */}
          {levelClearData && (
            <LevelClearModal
              level={levelClearData.level}
              seeds={levelClearData.seeds}
              timeLeft={levelClearData.timeLeft}
              skinId={equippedSkin}
              onReplay={handleReplay}
              onNext={handleNextLevel}
            />
          )}
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
