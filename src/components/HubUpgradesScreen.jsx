import React, { useEffect, useState } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import { PETS } from '../data/pets';
import TopBar from './TopBar';

export default function HubUpgradesScreen({ onBack }) {
  const [seeds, setSeeds] = useState(0);
  const [buildings, setBuildings] = useState({ silo: 0, nest: 0, playground: 0 });
  const [eggs, setEggs] = useState([]);

  useEffect(() => {
    setSeeds(gameStore.getSeeds());
    setBuildings(gameStore.getBuildings());
    
    // Check egg statuses
    const currentEggs = gameStore.getEggs();
    const now = Date.now();
    let updated = false;
    const processedEggs = currentEggs.map(egg => {
      if (egg.status === 'incubating' && now >= egg.hatchTime) {
        updated = true;
        return { ...egg, status: 'ready' };
      }
      return egg;
    });
    if (updated) gameStore.updateEggs(processedEggs);
    setEggs(processedEggs);
  }, []);

  const handleUpgrade = (id) => {
    const cost = (buildings[id] + 1) * 500;
    if (gameStore.spendSeeds(cost)) {
      const newLvl = gameStore.upgradeBuilding(id);
      setBuildings(prev => ({ ...prev, [id]: newLvl }));
      setSeeds(gameStore.getSeeds());
      audio.powerupCollect();
    }
  };

  const handleHatch = (index) => {
    const egg = eggs[index];
    if (egg.status === 'ready') {
      const unlocked = gameStore.getUnlockedPets();
      const available = PETS.filter(p => !unlocked.includes(p.id));
      if (available.length > 0) {
        const reward = available[Math.floor(Math.random() * available.length)];
        gameStore.unlockPet(reward.id);
        alert(`Hatched a new friend: ${reward.name} ${reward.emoji}!`);
      } else {
        gameStore.addSeeds(500);
        alert(`Hatched 500 Seeds!`);
      }
      gameStore.removeEgg(index);
      setEggs(gameStore.getEggs());
      setSeeds(gameStore.getSeeds());
      audio.levelComplete();
    }
  };

  return (
    <div className="screen-base hub-upgrades-screen">
      <TopBar title="MY SANCTUARY" onBack={onBack} />
      
      <div className="sanctuary-content">
        {/* SEEDS CHIP */}
        <div className="home-chip home-chip-seeds" style={{ marginBottom: '10px' }}>
          <span className="home-chip-icon">🌾</span>
          <span className="home-chip-val">{seeds}</span>
        </div>

        {/* BUILDINGS */}
        <div className="sanctuary-section-title">🏙️ Sanctuary Buildings</div>
        <div className="sanctuary-grid">
          <div className="building-card">
            <div className="building-icon">🌾</div>
            <div className="building-name">Seed Silo</div>
            <div className="building-lvl">Lvl {buildings.silo}</div>
            <button 
              className="building-upgrade-btn" 
              onClick={() => handleUpgrade('silo')}
              disabled={seeds < (buildings.silo + 1) * 500}
            >
              <span>UPGRADE</span>
              <span>{(buildings.silo + 1) * 500} 🌾</span>
            </button>
          </div>
          <div className="building-card">
            <div className="building-icon">🪺</div>
            <div className="building-name">Training Nest</div>
            <div className="building-lvl">Lvl {buildings.nest}</div>
            <button 
              className="building-upgrade-btn" 
              onClick={() => handleUpgrade('nest')}
              disabled={seeds < (buildings.nest + 1) * 500}
            >
              <span>UPGRADE</span>
              <span>{(buildings.nest + 1) * 500} 🌾</span>
            </button>
          </div>
          <div className="building-card">
            <div className="building-icon">🎠</div>
            <div className="building-name">Pet Playground</div>
            <div className="building-lvl">Lvl {buildings.playground}</div>
            <button 
              className="building-upgrade-btn" 
              onClick={() => handleUpgrade('playground')}
              disabled={seeds < (buildings.playground + 1) * 500}
            >
              <span>UPGRADE</span>
              <span>{(buildings.playground + 1) * 500} 🌾</span>
            </button>
          </div>
        </div>

        {/* HATCHERY */}
        <div className="sanctuary-section-title">🐣 Hatchery</div>
        <div className="hatchery-container">
          <div className="hatchery-list">
            {eggs.length > 0 ? eggs.map((egg, i) => (
              <div key={i} className="egg-card">
                <div className="egg-icon">🥚</div>
                {egg.status === 'ready' ? (
                  <button className="egg-ready-btn" onClick={() => handleHatch(i)}>HATCH!</button>
                ) : (
                  <div className="egg-timer">Incubating...</div>
                )}
              </div>
            )) : (
              <div className="egg-empty">No eggs found yet. Play levels to find them!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
