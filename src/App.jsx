import React, { useState, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import GameplayScreen from './components/GameplayScreen';
import GameOverScreen from './components/GameOverScreen';
import ShopScreen from './components/ShopScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import SettingsScreen from './components/SettingsScreen';
import TutorialOverlay from './components/TutorialOverlay';
import { gameStore } from './store/gameStore';
import './styles/game.css';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameOverData, setGameOverData] = useState({ level: 1, seeds: 0 });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDaily, setIsDaily] = useState(false);

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
      setCurrentLevel(10); // Daily is fixed at Level 10
      setScreen('game');
    }
  }, []);

  const goShop = useCallback(() => setScreen('shop'), []);
  const goLeaderboard = useCallback(() => setScreen('leaderboard'), []);
  const goSettings = useCallback(() => setScreen('settings'), []);

  const handleGameOver = useCallback((data) => {
    setGameOverData(data);
    if (isDaily) {
      gameStore.setDailyPlayed(data.seeds);
    }
    setScreen('gameover');
  }, [isDaily]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCurrentLevel(1);
    setIsDaily(false);
    setScreen('game');
  };

  return (
    <div className="app-root">
      {screen === 'home' && (
        <HomeScreen
          onPlay={goPlay}
          onShop={goShop}
          onLeaderboard={goLeaderboard}
          onSettings={goSettings}
          onDaily={goDaily}
        />
      )}
      {screen === 'game' && (
        <GameplayScreen
          key={isDaily ? `daily-${new Date().toDateString()}` : currentLevel}
          startLevel={currentLevel}
          isDaily={isDaily}
          onGameOver={handleGameOver}
          onLevelComplete={(data) => {
            if (isDaily) {
              gameStore.addSeeds(data.seeds);
              gameStore.setDailyPlayed(data.seeds);
              setGameOverData({ level: data.level, seeds: data.seeds });
              setScreen('gameover');
            } else {
              gameStore.addSeeds(data.seeds);
              gameStore.updateBestLevel(data.level);
              setCurrentLevel(data.level + 1);
            }
          }}
        />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          level={gameOverData.level}
          seeds={gameOverData.seeds}
          onPlayAgain={() => {
            setCurrentLevel(1);
            setScreen('game');
          }}
          onShop={goShop}
          onHome={goHome}
        />
      )}
      {screen === 'shop' && (
        <ShopScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'settings' && (
        <SettingsScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'achievements' && (
        <AchievementsScreen onBack={() => setScreen('home')} />
      )}

      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
    </div>
  );
}
