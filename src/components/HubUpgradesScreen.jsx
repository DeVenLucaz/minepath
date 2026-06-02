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
      const buildings = gameStore.getBuildings();
      const playgroundLvl = buildings.playground || 0;
      const abilityPower = 1 + (playgroundLvl * 0.25);

      if (egg.eggType === 'golden_egg') {
        const unlocked = gameStore.getUnlockedPets();
        const available = PETS.filter(p => !unlocked.includes(p.id));
        
        // roll for rarity
        const roll = Math.random();
        let targetRarity = 'common';
        if (roll < 0.1) targetRarity = 'epic';
        else if (roll < 0.3) targetRarity = 'rare';

        let pool = available.filter(p => p.rarity === targetRarity);
        if (pool.length === 0) pool = available; // Fallback

        if (pool.length > 0) {
          const reward = pool[Math.floor(Math.random() * pool.length)];
          gameStore.unlockPet(reward.id);
          alert(`GOLDEN EGG: Hatched a ${reward.rarity} friend: ${reward.name} ${reward.emoji}!`);
        } else {
          const seedsReward = Math.floor(1000 * abilityPower);
          gameStore.addSeeds(seedsReward);
          alert(`GOLDEN EGG: All pets unlocked! Gained ${seedsReward} Seeds!`);
        }
      } else if (egg.eggType === 'blue_egg') {
        const unlocked = gameStore.getUnlockedPets();
        let msg = '';
        if (unlocked.length > 0) {
          const target = unlocked[Math.floor(Math.random() * unlocked.length)];
          const petObj = PETS.find(p => p.id === target);
          const newLvl = gameStore.upgradePet(target);
          msg = `BLUE EGG: Upgraded ${petObj.name} to Level ${newLvl}! Ability boosted.`;
        } else {
          const seedsReward = Math.floor(300 * abilityPower);
          gameStore.addSeeds(seedsReward);
          msg = `BLUE EGG: No pets to upgrade. Gained ${seedsReward} Seeds!`;
        }

        // Feather roll
        if (Math.random() < 0.40) {
          const fAmt = Math.floor(Math.random() * 3) + 2; // 2-4
          playerStore.addFeathers(fAmt);
          msg += ` Also found ${fAmt} 🪶 Feathers!`;
        }
        alert(msg);
      } else {
        // Brown egg
        const seedsReward = Math.floor((100 + Math.random() * 200) * abilityPower);
        gameStore.addSeeds(seedsReward);
        let msg = `BROWN EGG: Found ${seedsReward} Seeds inside! 🌾`;
        
        // Feather roll
        if (Math.random() < 0.20) {
          const fAmt = Math.floor(Math.random() * 2) + 1; // 1-2
          playerStore.addFeathers(fAmt);
          msg += ` Also found ${fAmt} 🪶 Feathers!`;
        }
        alert(msg);
      }

      gameStore.removeEgg(index);
      setEggs(gameStore.getEggs());
      setSeeds(gameStore.getSeeds());
      audio.levelComplete();
    }
  };

  const buildingInfo = {
    silo: { 
      desc: "Stores seeds and generates passive income.", 
      stat: `Passive: ${buildings.silo * 5}/hr • Bonus: +${buildings.silo * 10}%` 
    },
    nest: { 
      desc: "Reduces timer speed and egg hatch time.", 
      stat: `Timer: -${buildings.nest * 5}% • Hatch: -${buildings.nest * 15}%` 
    },
    playground: { 
      desc: "Boosts pet abilities and start-level rewards.", 
      stat: `Power: +${buildings.playground * 25}% • Luck: +${buildings.playground * 10}%` 
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
          {Object.entries(buildingInfo).map(([id, info]) => (
            <div key={id} className="building-card">
              <div className="building-icon">{id === 'silo' ? '🌾' : id === 'nest' ? '🪺' : '🎠'}</div>
              <div className="building-name">
                {id === 'silo' ? 'Seed Silo' : id === 'nest' ? 'Training Nest' : 'Pet Playground'}
              </div>
              <div className="building-desc">{info.desc}</div>
              <div className="building-stat">{info.stat}</div>
              <div className="building-lvl">Lvl {buildings[id]}</div>
              <button 
                className="building-upgrade-btn" 
                onClick={() => handleUpgrade(id)}
                disabled={seeds < (buildings[id] + 1) * 500}
              >
                <span>UPGRADE</span>
                <span>{(buildings[id] + 1) * 500} 🌾</span>
              </button>
            </div>
          ))}
        </div>

        {/* HATCHERY */}
        <div className="sanctuary-section-title">🐣 Hatchery</div>
        <div className="hatchery-container">
          <div className="hatchery-list">
            {eggs.length > 0 ? eggs.map((egg, i) => (
              <div key={i} className={`egg-card egg-type-${egg.eggType || 'brown_egg'}`}>
                <div className="egg-icon">
                  {egg.eggType === 'golden_egg' ? '✨' : egg.eggType === 'blue_egg' ? '💎' : '🥚'}
                </div>
                <div className="egg-name">
                  {egg.eggType === 'golden_egg' ? 'Golden Egg' : egg.eggType === 'blue_egg' ? 'Blue Egg' : 'Brown Egg'}
                </div>
                {egg.status === 'ready' ? (
                  <button className="egg-ready-btn" onClick={() => handleHatch(i)}>HATCH!</button>
                ) : (
                  <div className="egg-timer">
                    {Math.ceil((egg.hatchTime - Date.now()) / (60000))} mins left
                  </div>
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
