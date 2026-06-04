import React, { useEffect, useState } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { PETS } from '../data/pets';
import TopBar from './TopBar';
import HelpModal from './HelpModal';
import RewardModal from './RewardModal';
import PetSVG from './PetSVG';
import { SeedIcon, HubIcon, CarouselIcon, EggIcon, GemIcon, GiftIcon, CheckIcon, StarIcon } from './Icons';

const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 43.3 + 7) % 100}%`,
  top:  `${(i * 57.7 + 13) % 100}%`,
  size: `${(i % 3) + 2}px`,
  delay: `${(i * 0.31) % 3}s`,
  dur:   `${2 + (i % 4) * 0.4}s`,
}));

const getEggIcon = (eggType) => {
  if (eggType === 'golden_egg') return <EggIcon size={44} className="text-gold mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }} />;
  if (eggType === 'blue_egg') return <EggIcon size={44} className="text-accent-blue mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }} />;
  return <EggIcon size={44} className="text-amber-800 mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,26,0.4))' }} />;
};


export default function HubUpgradesScreen({ onBack }) {
  const [seeds, setSeeds] = useState(0);
  const [buildings, setBuildings] = useState({ silo: 0, nest: 0, playground: 0 });
  const [eggs, setEggs] = useState([]);
  const [hatchState, setHatchState] = useState({ index: null, stage: null, reward: null });
  const [showHelp, setShowHelp] = useState(false);
  const [rewardModal, setRewardModal] = useState({ open: false, title: '', message: '', emoji: null });
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    setSeeds(gameStore.getSeeds());
    setBuildings(gameStore.getBuildings());
    
    // Heartbeat for real-time timers
    const timerInterval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Check egg statuses in real-time
      setEggs(prevEggs => {
        let updated = false;
        const newEggs = prevEggs.map(egg => {
          if (egg.status === 'incubating' && now >= egg.hatchTime) {
            updated = true;
            return { ...egg, status: 'ready' };
          }
          return egg;
        });
        if (updated) gameStore.updateEggs(newEggs);
        return newEggs;
      });
    }, 1000);

    // Initial egg load
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

    return () => clearInterval(timerInterval);
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
      let rewardEmoji = <GiftIcon size={64} className="text-primary mx-auto" />;
      let title = 'EGG HATCHED!';

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
          rewardEmoji = <div className="flex justify-center"><PetSVG petId={reward.id} size={96} mood="happy" /></div>;
          resultMsg = `Hatched a ${reward.rarity} friend: ${reward.name}! Check your Shop.`;
          title = 'NEW PET UNLOCKED!';
        } else {
          const seedsReward = Math.floor(1000 * abilityPower);
          gameStore.addSeeds(seedsReward);
          rewardEmoji = <SeedIcon size={64} className="text-gold mx-auto" />;
          resultMsg = `All pets unlocked! You gained ${seedsReward} Seeds instead.`;
        }
      } else if (egg.eggType === 'blue_egg') {
        const unlocked = gameStore.getUnlockedPets();
        rewardEmoji = <GemIcon size={64} className="text-accent-blue mx-auto" />;
        if (unlocked.length > 0) {
          const target = unlocked[Math.floor(Math.random() * unlocked.length)];
          const petObj = PETS.find(p => p.id === target);
          const newLvl = gameStore.upgradePet(target);
          resultMsg = `Upgraded ${petObj.name} to Level ${newLvl}! Ability boosted.`;
          title = 'PET UPGRADED!';
        } else {
          const seedsReward = Math.floor(300 * abilityPower);
          gameStore.addSeeds(seedsReward);
          resultMsg = `No pets to upgrade. Gained ${seedsReward} Seeds!`;
        }
        if (Math.random() < 0.40) {
          const fAmt = Math.floor(Math.random() * 3) + 2;
          playerStore.addFeathers(fAmt);
          audio.featherEarned();
          resultMsg += ` Also found ${fAmt} Feathers!`;
        }
      } else {
        const seedsReward = Math.floor((100 + Math.random() * 200) * abilityPower);
        gameStore.addSeeds(seedsReward);
        rewardEmoji = <SeedIcon size={64} className="text-gold mx-auto" />;
        resultMsg = `Found ${seedsReward} Seeds inside!`;
        title = 'BROWN EGG BURST!';
        if (Math.random() < 0.20) {
          const fAmt = Math.floor(Math.random() * 2) + 1;
          playerStore.addFeathers(fAmt);
          audio.featherEarned();
          resultMsg += ` Also found ${fAmt} Feathers!`;
        }
      }

      // START HATCH SEQUENCE
      setHatchState({ index, stage: 'shake', reward: rewardEmoji });
      audio.eggHatch(); // For shake sound

      setTimeout(() => {
        setHatchState(prev => ({ ...prev, stage: 'explode' }));
        audio.obstacleScramble(); // For pop sound
      }, 400);

      setTimeout(() => {
        setHatchState(prev => ({ ...prev, stage: 'reward' }));
      }, 700);

      setTimeout(() => {
        setRewardModal({ open: true, title, message: resultMsg, emoji: rewardEmoji });
        gameStore.removeEgg(index);
        setEggs(gameStore.getEggs());
        setSeeds(gameStore.getSeeds());
        setHatchState({ index: null, stage: null, reward: null });
        audio.levelComplete();
      }, 1100);
    }
  };

  const getBuildingInfo = (id) => {
    switch(id) {
      case 'silo': return { name: 'Seed Silo', icon: SeedIcon, desc: 'Passively gathers seeds while you are away.' };
      case 'nest': return { name: 'Hatchery Nest', icon: EggIcon, desc: 'Warm nests that speed up egg hatching and boost clear XP by +20%/lvl.' };
      case 'playground': return { name: 'Pet Playground', icon: CarouselIcon, desc: 'Increases the power of pet abilities.' };
      default: return { name: '', icon: null, desc: '' };
    }
  };

  const getBuildingStat = (id, lvl) => {
    switch(id) {
      case 'silo': return `+${lvl * 10} seeds/hr`;
      case 'nest': return `-${lvl * 15}% hatch time`;
      case 'playground': return `+${lvl * 25}% power`;
      default: return '';
    }
  };

  const formatTime = (ms) => {
    const sec = Math.ceil(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hub-screen">
      <div className="stars-bg">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}/>
        ))}
      </div>

      <TopBar title="MY HUB" onBack={onBack} seeds={seeds} />

      <div className="hub-content">
        {/* Buildings Section */}
        <div className="sanctuary-section-title">Sanctuary Buildings</div>
        <div className="sanctuary-grid">
          {Object.entries(buildings).map(([id, lvl]) => {
            const info = getBuildingInfo(id);
            const cost = (lvl + 1) * 500;
            const Icon = info.icon;
            return (
              <div key={id} className="building-card">
                <div className="building-icon">
                  {Icon && <Icon size={40} className="text-secondary mx-auto" />}
                </div>
                <div className="building-name">{info.name}</div>
                <div className="building-desc">{info.desc}</div>
                <div className="building-lvl">Level {lvl}</div>
                <div className="building-stat">{getBuildingStat(id, lvl)}</div>
                <button 
                  className="building-upgrade-btn flex items-center justify-center gap-1.5"
                  onClick={() => handleUpgrade(id)}
                  disabled={seeds < cost}
                >
                  <span>UPGRADE</span>
                  <span className="flex items-center gap-0.5">
                    {cost}
                    <SeedIcon size={12} className="text-gold" />
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Hatchery Section */}
        <div className="sanctuary-section-title">Hatchery & Eggs</div>
        <div className="hatchery-container">
          <div className="hatchery-list">
            {eggs.length > 0 ? eggs.map((egg, i) => {
              const isHatching = hatchState.index === i;
              const timeLeft = Math.max(0, egg.hatchTime - currentTime);

              return (
                <div key={i} className={`egg-card egg-type-${egg.eggType}`}>
                  {egg.status === 'ready' && !isHatching && <div className="egg-indicator-dot" />}
                  
                  <div className="egg-name">{egg.eggType.replace('_', ' ')}</div>
                  
                  <div className={`egg-icon flex items-center justify-center ${isHatching ? `hatch-${hatchState.stage}` : ''}`} style={{ minHeight: '60px' }}>
                    {isHatching && hatchState.stage === 'reward' ? hatchState.reward : getEggIcon(egg.eggType)}
                  </div>

                  {egg.status === 'incubating' ? (
                    <div className="egg-timer">{formatTime(timeLeft)}</div>
                  ) : (
                    <button 
                      className="egg-ready-btn"
                      onClick={() => handleHatch(i)}
                      disabled={isHatching}
                    >
                      {isHatching ? '...' : 'HATCH!'}
                    </button>
                  )}
                </div>
              );
            }) : (
              <div className="egg-empty">No eggs found yet. Play levels to find them!</div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>

      {showHelp && (
        <HelpModal
          title="Hatchery Guide"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Egg Slots', text: 'Place eggs in slots to incubate them. Each slot hatches one egg at a time.' },
            { heading: 'Brown Eggs', text: 'Common eggs. Hatch for seeds with a 20% chance of bonus feathers.' },
            { heading: 'Blue Eggs', text: 'Rarer eggs with a chance to upgrade your pet. 40% chance of bonus feathers.' },
            { heading: 'Golden Eggs', text: 'Rare eggs that can unlock brand new pets.' },
            { heading: 'Finding Eggs', text: 'Eggs drop randomly on level complete (40% chance). Higher levels give rarer eggs.' },
          ]}
        />
      )}

      <RewardModal
        isOpen={rewardModal.open}
        title={rewardModal.title}
        message={rewardModal.message}
        rewardEmoji={rewardModal.emoji}
        onConfirm={() => setRewardModal({ ...rewardModal, open: false })}
      />
    </div>
  );
}
