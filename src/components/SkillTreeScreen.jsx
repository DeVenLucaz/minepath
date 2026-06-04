import React, { useState, useEffect } from 'react';
import { playerStore } from '../store/playerStore';
import { inventoryStore } from '../store/inventoryStore';
import { SKILLS } from '../data/skills';
import TopBar from './TopBar';
import { audio } from '../audio/engine';
import HelpModal from './HelpModal';

const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 37.3 + 11) % 100}%`,
  top:  `${(i * 53.7 + 7)  % 100}%`,
  size: `${(i % 3) + 2}px`,
  delay: `${(i * 0.27) % 3}s`,
  dur:   `${1.6 + (i % 5) * 0.3}s`,
}));

export default function SkillTreeScreen({ onBack }) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [feathers, setFeathers] = useState(0);
  const [unlockedSkills, setUnlockedSkills] = useState([]);
  const [ownedSkins, setOwnedSkins] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setLevel(playerStore.getPlayerLevel());
    setXp(playerStore.getXP());
    setFeathers(playerStore.getFeathers());
    setUnlockedSkills(playerStore.getSkills());
    setOwnedSkins(inventoryStore.getUnlockedSkins());
  }, []);

  const handleUnlock = (skill) => {
    if (isLockedByTier(skill)) return;
    if (skill.path === 'skin' && !ownedSkins.includes(skill.skinId)) return;

    if (feathers >= skill.cost && !unlockedSkills.includes(skill.id)) {
      playerStore.spendFeathers(skill.cost);
      playerStore.unlockSkill(skill.id);
      setFeathers(playerStore.getFeathers());
      setUnlockedSkills(playerStore.getSkills());
      audio.skillUnlock();
    }
  };

  const isLockedByTier = (skill) => {
    const pathSkills = SKILLS.filter(s => 
      s.path === skill.path && (s.path !== 'skin' || s.skinId === skill.skinId)
    );
    
    if (skill.rarity === 'rare') {
      const basicSkill = pathSkills.find(s => s.rarity === 'basic');
      return !basicSkill || !unlockedSkills.includes(basicSkill.id);
    }
    if (skill.rarity === 'epic') {
      const rareSkill = pathSkills.find(s => s.rarity === 'rare');
      return !rareSkill || !unlockedSkills.includes(rareSkill.id);
    }
    return false;
  };

  const xpToNext = playerStore.getXPToNextLevel(level);
  const xpPct = (xp / xpToNext) * 100;

  const paths = ['scout', 'tank', 'merchant'];
  const skinIds = ['space', 'ninja', 'royal', 'ghost'];
  const skinNames = {
    space: 'Space Chicken',
    ninja: 'Ninja Chicken',
    royal: 'Royal Chicken',
    ghost: 'Ghost Chicken'
  };

  const rarityColors = {
    basic: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0'
  };

  const rarityTiers = {
    basic: 'Tier 1',
    rare: 'Tier 2',
    epic: 'Tier 3'
  };

  const renderSkillNode = (skill) => {
    const isUnlocked = unlockedSkills.includes(skill.id);
    const tierLocked = !isUnlocked && isLockedByTier(skill);
    const skinLocked = skill.path === 'skin' && !ownedSkins.includes(skill.skinId);
    const isLocked = tierLocked || skinLocked;
    const canAfford = feathers >= skill.cost;

    const rarityClasses = {
      basic: 'text-accent-green border-accent-green/30 bg-accent-green/10',
      rare: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10',
      epic: 'text-accent-purple border-accent-purple/30 bg-accent-purple/10'
    };
    
    return (
      <div key={skill.id} className={`st-node ${isUnlocked ? 'st-node--unlocked' : ''}`} style={isLocked ? { opacity: 0.6 } : {}}>
        <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border w-fit mb-1 tracking-wider ${rarityClasses[skill.rarity]}`}>
          {skill.rarity} • {rarityTiers[skill.rarity]}
        </div>
        <div className="st-node-icon">{skill.icon}</div>
        <div className="st-node-name">
          {isLocked && !isUnlocked && <span className="mr-1">🔒</span>}
          {skill.name}
        </div>
        <div className="text-[11px] text-secondary mt-1 mb-2 min-h-[32px] leading-tight">
          {skill.description}
        </div>
        
        {isUnlocked ? (
          <div className="text-accent-green font-black text-xs mt-1 uppercase tracking-tighter">Unlocked</div>
        ) : (
          <button 
            className="st-unlock-btn" 
            onClick={() => handleUnlock(skill)}
            disabled={isLocked || !canAfford}
          >
            {isLocked ? `Locked` : `Unlock (${skill.cost}🪶)`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="skill-tree-screen">
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

      <TopBar title="SKILL TREE" onBack={onBack} showSeeds={false} />

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>
      
      <div className="st-header">
        <div className="st-player-info">
          <div className="text-primary font-black text-lg">Level {level}</div>
          <div className="st-xp-bar">
            <div className="st-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="text-muted text-[10px] font-bold mt-1 uppercase tracking-widest">
            {xp} / {xpToNext} XP
          </div>
        </div>
        <div className="st-stat-badge">
          <span className="text-lg">🪶</span> <span>{feathers}</span>
        </div>
      </div>
      
      <div className="text-center text-[10px] text-muted px-6 mt-2 mb-4 leading-relaxed font-medium uppercase tracking-tight">
        🪶 Earn feathers: Level up (+1 each) • Hatch Brown eggs (20% chance) • Hatch Blue eggs (40% chance)
      </div>

      <div className="st-path-container">
        {paths.map(pathId => (
          <div key={pathId} className="st-path">
            <div className="st-path-title">{pathId} Path</div>
            <div className="st-nodes">
              {SKILLS.filter(s => s.path === pathId).map(skill => renderSkillNode(skill))}
            </div>
          </div>
        ))}

        <div className="mt-8 mb-2 pt-6 border-t border-white/10 text-center text-lg font-black text-gold tracking-widest uppercase">
          Skin Skills
        </div>

        {skinIds.map(skinId => {
          const isSkinOwned = ownedSkins.includes(skinId);
          return (
            <div key={skinId} className="st-path mb-6">
              <div className="st-path-title" style={{ opacity: isSkinOwned ? 1 : 0.4 }}>
                {skinNames[skinId]}
              </div>
              <div className="st-nodes">
                {SKILLS.filter(s => s.path === 'skin' && s.skinId === skinId).map(skill => renderSkillNode(skill))}
              </div>
            </div>
          );
        })}
      </div>

      {showHelp && (
        <HelpModal
          title="Skill Tree Guide"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Paths', text: 'Three paths — Scout (information), Tank (survival), Merchant (economy). Each has 3 skills.' },
            { heading: 'Rarity', text: 'Skills have Basic, Rare, and Epic rarity. Higher rarity = stronger effect and higher cost.' },
            { heading: 'Tier Lock', text: 'You must unlock Basic before Rare, and Rare before Epic within each path.' },
            { heading: 'Skin Skills', text: 'Each paid skin has 3 exclusive skills. You must own the skin AND have it equipped for these to activate.' },
            { heading: 'Feathers', text: 'Skills cost Feathers. Earn feathers by leveling up (+1), hatching Brown eggs (20% chance), hatching Blue eggs (40% chance).' },
          ]}
        />
      )}
    </div>
  );
}
