import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { audio } from './audio/engine';
import './Styles/game.css';

export default function App() {
  const [screen, setScreen]             = useState('home');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDaily, setIsDaily]           = useState(false);

  // ── Navigation helpers ──
  const goHome = useCallback(() => {
    audio.init();
    if (screen === 'game' || screen === 'endless') {
      audio.fadeOutBackground();
      setTimeout(() => {
        audio.startBackground();
      }, 600);
    } else {
      audio.startBackground();
    }
    setCurrentLevel(1);
    setIsDaily(false);
    setScreen('home');
  }, [screen]);

  const goPlay = useCallback(() => {
    if (!gameStore.isTutorialComplete()) {
      setShowTutorial(true);
    } else {
      audio.init();
      audio.fadeInBackground();
      setCurrentLevel(1);
      setIsDaily(false);
      setScreen('game');
    }
  }, []);

  const goDaily = useCallback(() => {
    const daily = gameStore.getDailyChallenge();
    if (!daily.played) {
      audio.init();
      audio.fadeInBackground();
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
  const goEndless       = useCallback(() => {
    audio.init();
    audio.fadeInBackground();
    setScreen('endless');
  }, []);

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
    let foundEgg = null;
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
      
      foundEgg = type;
      gameStore.addEgg(type);
    }
    data.eggFound = foundEgg;
  }, [isDaily]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    audio.init();
    audio.fadeInBackground();
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

      <AnimatePresence mode="sync">
        {/* ── SANCTUARY (HOME) ── */}
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
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
          </motion.div>
        )}

        {/* ── GAME + OVERLAYS ── */}
        {screen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ position: 'relative', width: '100%', height: '100%' }}
          >
            <GameplayScreen
              key={`${isDaily ? 'daily' : 'normal'}-${currentLevel}`}
              startLevel={currentLevel}
              isDaily={isDaily}
              onGameOver={handleGameOver}
              onLevelComplete={handleLevelComplete}
              onBack={goHome}
              frozen={false} 
            />
          </motion.div>
        )}

        {/* ── ENDLESS MODE ── */}
        {screen === 'endless' && (
          <motion.div
            key="endless"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <EndlessTileScreen onBack={goHome} />
          </motion.div>
        )}

        {/* ── OTHER SCREENS ── */}
        {screen === 'shop' && (
          <motion.div
            key="shop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <ShopScreen onBack={goHome}/>
          </motion.div>
        )}
        {screen === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <LeaderboardScreen onBack={goHome}/>
          </motion.div>
        )}
        {screen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <SettingsScreen onBack={goHome}/>
          </motion.div>
        )}
        {screen === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <AchievementsScreen onBack={goHome}/>
          </motion.div>
        )}
        {screen === 'skilltree' && (
          <motion.div
            key="skilltree"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <SkillTreeScreen onBack={goHome}/>
          </motion.div>
        )}
        {screen === 'hub_upgrades' && (
          <motion.div
            key="hub_upgrades"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <HubUpgradesScreen onBack={goHome}/>
          </motion.div>
        )}
      </AnimatePresence>

      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete}/>}
    </div>
  );
}
