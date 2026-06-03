import React, { useState, useEffect } from 'react';
import { playerStore } from '../store/playerStore';
import { inventoryStore } from '../store/inventoryStore';
import { SKILLS } from '../data/skills';
import TopBar from './TopBar';
import { audio } from '../audio/engine';
import HelpModal from './HelpModal';

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
    
    return (
      <div key={skill.id} className={`st-node ${isUnlocked ? 'st-node--unlocked' : ''}`} style={isLocked ? { opacity: 0.7 } : {}}>
        <div style={{ 
          backgroundColor: rarityColors[skill.rarity],
          color: 'white',
          fontSize: '8px',
          padding: '2px 6px',
          borderRadius: '10px',
          marginBottom: '4px',
          fontWeight: 900,
          textTransform: 'uppercase'
        }}>
          {skill.rarity} • {rarityTiers[skill.rarity]}
        </div>
        <div className="st-node-icon">{skill.icon}</div>
        <div className="st-node-name">
          {isLocked && !isUnlocked && <span style={{ marginRight: '4px' }}>🔒</span>}
          {skill.name}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: '4px 0', minHeight: '30px' }}>
          {skill.description}
        </div>
        
        {isUnlocked ? (
          <div style={{ color: '#4CAF50', fontWeight: 900, fontSize: '11px', marginTop: '4px' }}>UNLOCKED</div>
        ) : (
          <button 
            className="st-unlock-btn" 
            onClick={() => handleUnlock(skill)}
            disabled={isLocked || !canAfford}
            style={isLocked ? { background: '#444', color: '#888', cursor: 'not-allowed' } : {}}
          >
            {isLocked ? `LOCKED (${skill.cost}🪶)` : `UNLOCK (${skill.cost}🪶)`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="skill-tree-screen screen-base">
      <TopBar title="SKILL TREE" onBack={onBack} />

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>
      
      <div className="st-header">
        <div className="st-player-info">
          <div style={{ color: 'white', fontWeight: 900, fontSize: '18px' }}>Level {level}</div>
          <div className="st-xp-bar">
            <div className="st-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '2px' }}>
            {xp} / {xpToNext} XP
          </div>
        </div>
        <div className="st-stat-badge">
          <span>🪶</span> {feathers}
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        fontSize: '10px', 
        color: 'rgba(255,255,255,0.4)', 
        marginTop: '-10px', 
        marginBottom: '10px',
        padding: '0 20px',
        lineHeight: '1.4'
      }}>
        🪶 Earn feathers: Level up (+1 each) • Hatch Brown eggs (20% chance) • Hatch Blue eggs (40% chance)
      </div>

      <div className="st-path-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
        {paths.map(pathId => (
          <div key={pathId} className="st-path">
            <div className="st-path-title">{pathId.toUpperCase()} PATH</div>
            <div className="st-nodes">
              {SKILLS.filter(s => s.path === pathId).map(skill => renderSkillNode(skill))}
            </div>
          </div>
        ))}

        <div style={{ 
          margin: '30px 20px 10px', 
          paddingTop: '20px', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 900,
          color: '#FFD700',
          letterSpacing: '2px'
        }}>
          SKIN SKILLS
        </div>

        {skinIds.map(skinId => {
          const isSkinOwned = ownedSkins.includes(skinId);
          return (
            <div key={skinId} className="st-path" style={{ marginBottom: '20px' }}>
              <div className="st-path-title" style={{ opacity: isSkinOwned ? 1 : 0.5 }}>
                {skinNames[skinId].toUpperCase()}
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
