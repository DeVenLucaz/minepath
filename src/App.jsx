import React, { useState, useCallback } from 'react';
import SanctuaryScreen from './components/SanctuaryScreen';
import HubUpgradesScreen from './components/HubUpgradesScreen';
import SkillTreeScreen from './components/SkillTreeScreen';
import GameplayScreen from './components/GameplayScreen';
import EndlessTileScreen from './components/EndlessTileScreen';
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
import { playerStore } from './store/playerStore';
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
  const goSkillTree     = useCallback(() => setScreen('skilltree'), []);
  const goHubUpgrades    = useCallback(() => setScreen('hub_upgrades'), []);
  const goEndless       = useCallback(() => setScreen('endless'), []);

  React.useEffect(() => {
    // Collect passive income
    const passive = gameStore.collectPassiveIncome();
    if (passive > 0) {
      alert(`While you were away, your Seed Silo gathered ${passive} seeds! 🌾`);
    }
  }, []);

  // ── Game over — update store ──
  const handleGameOver = useCallback((data) => {
    if (isDaily) gameStore.setDailyPlayed(data.seeds);
    gameStore.addLeaderboardEntry({ level: data.level, seeds: data.seeds });
    gameStore.updateBestLevel(data.level);
    
    // V4: Add XP on game over
    const xpGained = data.level * 5;
    playerStore.addXP(xpGained);
  }, [isDaily]);

  // ── Level clear — update store ──
  const handleLevelComplete = useCallback((data) => {
    if (isDaily) {
      gameStore.addSeeds(data.seeds);
      gameStore.setDailyPlayed(data.seeds);
      return;
    }

    // Apply Training Nest XP Multiplier
    const buildings = gameStore.getBuildings();
    const nestLvl = buildings.nest || 0;
    const xpMult = 1 + (nestLvl * 0.2); // +20% per level

    gameStore.addSeeds(data.seeds);
    gameStore.updateBestLevel(data.level);
    
    // V4: Add XP on level clear
    const xpGained = Math.floor(data.level * 20 * xpMult);
    playerStore.addXP(xpGained);

    // V4: Chance to find an egg
    if (Math.random() < 0.40) {
      const level = data.level;
      const roll = Math.random() * 100;
      let type = 'brown_egg';

      if (level <= 5) {
        if (roll < 3) type = 'golden_egg';
        else if (roll < 13) type = 'blue_egg';
      } else if (level <= 15) {
        if (roll < 7) type = 'golden_egg';
        else if (roll < 25) type = 'blue_egg';
      } else if (level <= 30) {
        if (roll < 12) type = 'golden_egg';
        else if (roll < 37) type = 'blue_egg';
      } else {
        if (roll < 18) type = 'golden_egg';
        else if (roll < 50) type = 'blue_egg';
      }
      
      gameStore.addEgg(type);
    }
  }, [isDaily]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setCurrentLevel(1);
    setIsDaily(false);
    setScreen('game');
  };

  return (
    <div className="app-root">
      {/* Global TopBar and ChickenSVG for requirement — hidden if not needed */}
      <div className="app-global-ui" style={{ display: 'none' }}>
        <TopBar title="MINEPATH" onBack={goHome} />
        <ChickenSVG skinId="classic" />
      </div>

      {/* ── SANCTUARY (HOME) ── */}
      {screen === 'home' && (
        <SanctuaryScreen
          onPlay={goPlay}
          onEndless={goEndless}
          onShop={goShop}
          onLeaderboard={goLeaderboard}
          onSettings={goSettings}
          onDaily={goDaily}
          onAchievements={goAchievements}
          onSkillTree={goSkillTree}
          onHubUpgrades={goHubUpgrades}
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

      {/* ── ENDLESS MODE ── */}
      {screen === 'endless' && (
        <EndlessTileScreen onBack={goHome} />
      )}

      {/* ── OTHER SCREENS ── */}
      {screen === 'shop' && <ShopScreen onBack={() => setScreen('home')}/>}
      {screen === 'leaderboard' && <LeaderboardScreen onBack={() => setScreen('home')}/>}
      {screen === 'settings' && <SettingsScreen onBack={() => setScreen('home')}/>}
      {screen === 'achievements' && <AchievementsScreen onBack={goHome}/>}
      {screen === 'skilltree' && <SkillTreeScreen onBack={goHome}/>}
      {screen === 'hub_upgrades' && <HubUpgradesScreen onBack={goHome}/>}

      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete}/>}
    </div>
  );
}
