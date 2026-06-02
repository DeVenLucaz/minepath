import React, { useState, useEffect } from 'react';
import { playerStore } from '../store/playerStore';
import { SKILLS } from '../data/skills';
import TopBar from './TopBar';
import { audio } from '../audio/engine';

export default function SkillTreeScreen({ onBack }) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [feathers, setFeathers] = useState(0);
  const [unlockedSkills, setUnlockedSkills] = useState([]);

  useEffect(() => {
    setLevel(playerStore.getPlayerLevel());
    setXp(playerStore.getXP());
    setFeathers(playerStore.getFeathers());
    setUnlockedSkills(playerStore.getSkills());
  }, []);

  const handleUnlock = (skill) => {
    if (feathers >= skill.cost && !unlockedSkills.includes(skill.id)) {
      playerStore.spendFeathers(skill.cost);
      playerStore.unlockSkill(skill.id);
      setFeathers(playerStore.getFeathers());
      setUnlockedSkills(playerStore.getSkills());
      audio.powerupCollect();
    }
  };

  const xpToNext = playerStore.getXPToNextLevel(level);
  const xpPct = (xp / xpToNext) * 100;

  const paths = ['scout', 'tank', 'merchant'];

  return (
    <div className="skill-tree-screen">
      <TopBar title="SKILL TREE" onBack={onBack} />
      
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

      <div className="st-path-container">
        {paths.map(pathId => (
          <div key={pathId} className="st-path">
            <div className="st-path-title">{pathId.toUpperCase()} PATH</div>
            <div className="st-nodes">
              {SKILLS.filter(s => s.path === pathId).map(skill => {
                const isUnlocked = unlockedSkills.includes(skill.id);
                const canAfford = feathers >= skill.cost;
                
                return (
                  <div key={skill.id} className={`st-node ${isUnlocked ? 'st-node--unlocked' : ''}`}>
                    <div className="st-node-icon">{skill.icon}</div>
                    <div className="st-node-name">{skill.name}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: '4px 0' }}>{skill.description}</div>
                    {isUnlocked ? (
                      <div style={{ color: '#4CAF50', fontWeight: 900, fontSize: '11px' }}>UNLOCKED</div>
                    ) : (
                      <button 
                        className="st-unlock-btn" 
                        onClick={() => handleUnlock(skill)}
                        disabled={!canAfford}
                      >
                        UNLOCK ({skill.cost}🪶)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
