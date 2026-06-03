import React, { useEffect, useState } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { PETS } from '../data/pets';
import TopBar from './TopBar';

export default function HubUpgradesScreen({ onBack }) {
  const [seeds, setSeeds] = useState(0);
  const [buildings, setBuildings] = useState({ silo: 0, nest: 0, playground: 0 });
  const [eggs, setEggs] = useState([]);
  const [hatchState, setHatchState] = useState({ index: null, stage: null, reward: null });

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
    if (egg.status === 'ready' && hatchState.index === null) {
      const buildings = gameStore.getBuildings();
      const playgroundLvl = buildings.playground || 0;
      const abilityPower = 1 + (playgroundLvl * 0.25);
      let resultMsg = '';
      let rewardEmoji = '🎁';

      if (egg.eggType === 'golden_egg') {
        const unlocked = gameStore.getUnlockedPets();
        const available = PETS.filter(p => !unlocked.includes(p.id));
        const roll = Math.random();
        let targetRarity = 'common';
        if (roll < 0.1) targetRarity = 'epic';
        else if (roll < 0.3) targetRarity = 'rare';

        let pool = available.filter(p => p.rarity === targetRarity);
        if (pool.length === 0) pool = available;

        if (pool.length > 0) {
          const reward = pool[Math.floor(Math.random() * pool.length)];
          gameStore.unlockPet(reward.id);
          rewardEmoji = reward.emoji;
          resultMsg = `GOLDEN EGG: Hatched a ${reward.rarity} friend: ${reward.name} ${reward.emoji}!`;
        } else {
          const seedsReward = Math.floor(1000 * abilityPower);
          gameStore.addSeeds(seedsReward);
          rewardEmoji = '🌾';
          resultMsg = `GOLDEN EGG: All pets unlocked! Gained ${seedsReward} Seeds!`;
        }
      } else if (egg.eggType === 'blue_egg') {
        const unlocked = gameStore.getUnlockedPets();
        rewardEmoji = '💎';
        if (unlocked.length > 0) {
          const target = unlocked[Math.floor(Math.random() * unlocked.length)];
          const petObj = PETS.find(p => p.id === target);
          const newLvl = gameStore.upgradePet(target);
          resultMsg = `BLUE EGG: Upgraded ${petObj.name} to Level ${newLvl}! Ability boosted.`;
        } else {
          const seedsReward = Math.floor(300 * abilityPower);
          gameStore.addSeeds(seedsReward);
          resultMsg = `BLUE EGG: No pets to upgrade. Gained ${seedsReward} Seeds!`;
        }
        if (Math.random() < 0.40) {
          const fAmt = Math.floor(Math.random() * 3) + 2;
          playerStore.addFeathers(fAmt);
          resultMsg += ` Also found ${fAmt} 🪶 Feathers!`;
        }
      } else {
        const seedsReward = Math.floor((100 + Math.random() * 200) * abilityPower);
        gameStore.addSeeds(seedsReward);
        rewardEmoji = '🌾';
        resultMsg = `BROWN EGG: Found ${seedsReward} Seeds inside! 🌾`;
        if (Math.random() < 0.20) {
          const fAmt = Math.floor(Math.random() * 2) + 1;
          playerStore.addFeathers(fAmt);
          resultMsg += ` Also found ${fAmt} 🪶 Feathers!`;
        }
      }

      // START HATCH SEQUENCE
      setHatchState({ index, stage: 'shake', reward: rewardEmoji });
      audio.mineExplosion(); // For shake sound

      setTimeout(() => {
        setHatchState(prev => ({ ...prev, stage: 'explode' }));
        audio.obstacleScramble(); // For pop sound
      }, 400);

      setTimeout(() => {
        setHatchState(prev => ({ ...prev, stage: 'reward' }));
      }, 700);

      setTimeout(() => {
        alert(resultMsg);
        gameStore.removeEgg(index);
        setEggs(gameStore.getEggs());
        setSeeds(gameStore.getSeeds());
        setHatchState({ index: null, stage: null, reward: null });
        audio.levelComplete();
      }, 1100);
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

  const getCrackColor = (type) => {
    if (type === 'golden_egg') return '#FFD700';
    if (type === 'blue_egg') return '#29B6F6';
    return '#8B4513';
  };

  return (
    <div className="screen-base hub-upgrades-screen">
      <TopBar title="MY SANCTUARY" onBack={onBack} />
      
      <style>{`
        @keyframes egg-wobble {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(-8deg); }
          40% { transform: rotate(8deg); }
          60% { transform: rotate(-6deg); }
          80% { transform: rotate(6deg); }
        }
        @keyframes egg-crack-appear {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes egg-shake-hatch {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes egg-explode {
          0% { transform: scale(1); opacity: 1; }
          40% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes reward-pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .egg-wobble { animation: egg-wobble 0.8s ease-in-out infinite; }
        .egg-shake-hatch { animation: egg-shake-hatch 0.4s linear infinite; }
        .egg-explode { animation: egg-explode 0.3s ease-out forwards; }
        .reward-pop { animation: reward-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        .egg-crack {
          position: absolute;
          width: 20px;
          height: 2px;
          animation: egg-crack-appear 0.3s forwards;
          pointer-events: none;
        }
        .egg-crack-1 { top: 30%; left: 20%; transform: rotate(45deg); }
        .egg-crack-2 { top: 50%; right: 20%; transform: rotate(-30deg); }
        .egg-crack-3 { bottom: 30%; left: 40%; transform: rotate(10deg); }
      `}</style>

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
            {eggs.length > 0 ? eggs.map((egg, i) => {
              const isHatching = hatchState.index === i;
              const isReady = egg.status === 'ready';
              const readyTime = isReady ? (Date.now() - egg.hatchTime) : 0;
              const numCracks = isReady ? (readyTime > 60000 ? 3 : readyTime > 30000 ? 2 : 1) : 0;
              const crackColor = getCrackColor(egg.eggType);

              let animClass = '';
              if (isHatching) {
                if (hatchState.stage === 'shake') animClass = 'egg-shake-hatch';
                else if (hatchState.stage === 'explode') animClass = 'egg-explode';
              } else if (isReady) {
                animClass = 'egg-wobble';
              }

              return (
                <div key={i} className={`egg-card egg-type-${egg.eggType || 'brown_egg'} ${animClass}`}>
                  <div className="egg-icon-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                    {isHatching && hatchState.stage === 'reward' ? (
                      <div className="reward-pop" style={{ fontSize: '40px' }}>{hatchState.reward}</div>
                    ) : (
                      <>
                        <div className="egg-icon">
                          {egg.eggType === 'golden_egg' ? '✨' : egg.eggType === 'blue_egg' ? '💎' : '🥚'}
                        </div>
                        {numCracks >= 1 && <div className="egg-crack egg-crack-1" style={{ backgroundColor: crackColor }} />}
                        {numCracks >= 2 && <div className="egg-crack egg-crack-2" style={{ backgroundColor: crackColor }} />}
                        {numCracks >= 3 && <div className="egg-crack egg-crack-3" style={{ backgroundColor: crackColor }} />}
                      </>
                    )}
                  </div>
                  <div className="egg-name">
                    {egg.eggType === 'golden_egg' ? 'Golden Egg' : egg.eggType === 'blue_egg' ? 'Blue Egg' : 'Brown Egg'}
                  </div>
                  {egg.status === 'ready' ? (
                    <button 
                      className="egg-ready-btn" 
                      onClick={() => handleHatch(i)}
                      disabled={hatchState.index !== null}
                    >
                      {isHatching ? '...' : 'HATCH!'}
                    </button>
                  ) : (
                    <div className="egg-timer">
                      {Math.ceil((egg.hatchTime - Date.now()) / (60000))} mins left
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="egg-empty">No eggs found yet. Play levels to find them!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
