import React from 'react';
import { gameStore } from '../store/gameStore';

export default function AchievementsScreen({ onBack }) {
  const ach = gameStore.getAchievements();
  
  const milestones = [
    { key: 'earlyBird', label: 'Early Bird', desc: 'Reach Level 5', target: true, icon: '🥚' },
    { key: 'seedHoarder', label: 'Seed Hoarder', desc: 'Collect 500 total seeds', target: 500, icon: '🌾' },
    { key: 'survivor', label: 'Survivor', desc: 'Play 20 games', target: 20, icon: '🛡️' },
    { key: 'perfectionist', label: 'Perfectionist', desc: 'Complete a level without peeking', target: true, icon: '💎' },
  ];

  const getProgress = (m) => {
    const val = ach[m.key];
    if (typeof m.target === 'boolean') return val ? 100 : 0;
    return Math.min(100, Math.floor((val / m.target) * 100));
  };

  return (
    <div className="achievements-screen">
      <div className="ach-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="ach-title">🪶 FEATHERS</div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="ach-content">
        <div className="ach-summary">
          You have earned {Object.values(ach).filter(v => v === true || v >= 20 || (typeof v === 'number' && v >= 500)).length} / {milestones.length} Feathers
        </div>

        <div className="ach-list">
          {milestones.map(m => {
            const progress = getProgress(m);
            const isDone = progress >= 100;
            return (
              <div key={m.key} className={`ach-item ${isDone ? 'unlocked' : ''}`}>
                <div className="ach-icon">{isDone ? m.icon : '❓'}</div>
                <div className="ach-info">
                  <div className="ach-label">{m.label}</div>
                  <div className="ach-desc">{m.desc}</div>
                  <div className="ach-progress-bar">
                    <div className="ach-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {isDone && <div className="ach-check">✅</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
