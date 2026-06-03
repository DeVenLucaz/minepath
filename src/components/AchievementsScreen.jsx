import React, { useState, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { FEATS } from '../data/achievements';
import TopBar from './TopBar';
import HelpModal from './HelpModal';

// Pre-generate stars
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 47.3 + 9) % 100}%`,
  top:  `${(i * 61.7 + 13) % 100}%`,
  size: `${(i % 3) + 2}px`,
  delay: `${(i * 0.31) % 3}s`,
  dur:   `${1.8 + (i % 4) * 0.35}s`,
}));

// Badge component — scalloped circle with icon
function FeatBadge({ feat, done, progress, target }) {
  const pct = typeof target === 'number'
    ? Math.min(1, progress / target)
    : done ? 1 : 0;

  return (
    <div
      className="af-badge"
      style={{
        '--badge-color': done ? feat.color : '#546E7A',
        '--badge-glow': done ? `${feat.color}66` : 'transparent',
      }}
    >
      {/* Scalloped border via repeating conic gradient */}
      <div className="af-badge-ring"/>
      <div className="af-badge-inner">
        {done
          ? <span className="af-badge-icon">{feat.icon}</span>
          : <span className="af-badge-lock">🔒</span>
        }
      </div>
      {/* Progress arc overlay when in-progress */}
      {!done && typeof target === 'number' && pct > 0 && (
        <svg className="af-badge-arc" viewBox="0 0 44 44">
          <circle
            cx="22" cy="22" r="18"
            fill="none"
            stroke={feat.color}
            strokeWidth="3"
            strokeDasharray={`${pct * 113} 113`}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            opacity="0.7"
          />
        </svg>
      )}
    </div>
  );
}

export default function AchievementsScreen({ onBack }) {
  const [achievements, setAchievements] = useState(gameStore.getAchievements());
  const [claimAnim, setClaimAnim] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const { completed, total } = useMemo(() => {
    const claimed = achievements._claimed || {};
    let c = 0;
    FEATS.forEach(f => { if (claimed[f.key]) c++; });
    return { completed: c, total: FEATS.length };
  }, [achievements]);

  const getProgress = (feat) => {
    const val = achievements[feat.key];
    if (typeof feat.target === 'boolean') return val === true ? 1 : 0;
    return typeof val === 'number' ? val : 0;
  };

  const isDone = (feat) => {
    const prog = getProgress(feat);
    if (typeof feat.target === 'boolean') return prog === 1;
    return prog >= feat.target;
  };

  const isClaimed = (feat) => {
    return !!(achievements._claimed && achievements._claimed[feat.key]);
  };

  const handleClaim = (feat) => {
    const ok = gameStore.claimFeat(feat.key, feat.reward);
    if (ok) {
      setAchievements(gameStore.getAchievements());
      setClaimAnim(feat.key);
      setTimeout(() => setClaimAnim(null), 1200);
    }
  };

  const progressPct = Math.round((completed / total) * 100);

  return (
    <div className="achievements-screen">

      {/* Stars */}
      <div className="stars-bg" aria-hidden="true">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}/>
        ))}
      </div>

      {/* Top bar — no seeds chip needed here */}
      <TopBar title="FEATS" onBack={onBack} showSeeds={false}/>

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>

      {/* Big title */}
      <div className="af-title">🐔 CHICKEN FEATS</div>

      {/* Summary card */}
      <div className="af-summary">
        <div className="af-summary-top">
          <span className="af-summary-label">Total Feats</span>
          <span className="af-summary-count">
            <span className="af-summary-done">{completed}</span>
            <span className="af-summary-sep">/{total}</span>
          </span>
          <span className="af-summary-pct">{progressPct}%</span>
        </div>
        <div className="af-progress-track">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className="af-progress-seg"
              style={{ background: i < completed ? 'var(--gold)' : 'rgba(255,255,255,0.05)' }}
            />
          ))}
        </div>
      </div>

      {/* Feat list */}
      <div className="af-list">
        {FEATS.map(feat => {
          const done     = isDone(feat);
          const claimed  = isClaimed(feat);
          const progress = getProgress(feat);
          const isAnim   = claimAnim === feat.key;
          const pctFill  = typeof feat.target === 'number'
            ? Math.min(100, Math.round((progress / feat.target) * 100))
            : done ? 100 : 0;

          return (
            <div
              key={feat.key}
              className={`af-card ${done ? 'af-card--done' : ''} ${claimed ? 'af-card--claimed' : ''} ${isAnim ? 'af-card--pop' : ''}`}
            >
              <FeatBadge feat={feat} done={done} progress={progress} target={feat.target}/>

              <div className="af-card-info">
                <div className="af-card-name">{feat.name}</div>
                <div className="af-card-desc">{feat.desc}</div>

                {/* Progress bar */}
                <div className="af-bar-track">
                  <div
                    className="af-bar-fill"
                    style={{
                      width: `${pctFill}%`,
                      background: done ? feat.color : '#546E7A',
                    }}
                  />
                  <span className="af-bar-label">
                    {typeof feat.target === 'number'
                      ? `${Math.min(progress, feat.target)}/${feat.target}`
                      : done ? 'Complete!' : 'In progress'
                    }
                  </span>
                </div>
              </div>

              {/* Right side action */}
              <div className="af-card-action">
                {claimed ? (
                  <div className="af-stamp">DONE</div>
                ) : done ? (
                  <button
                    className="af-claim-btn"
                    onClick={() => handleClaim(feat)}
                  >
                    <span>CLAIM</span>
                    <span className="af-claim-reward">
                      +{feat.reward}🌾 {feat.featherReward ? `+${feat.featherReward}🪶` : ''}
                    </span>
                  </button>
                ) : (
                  <div className="af-lock">🔒</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showHelp && (
        <HelpModal
          title="Achievements"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Feats', text: 'Complete challenges to earn Feats. Each feat rewards you with seeds and XP.' },
            { heading: 'Progress', text: 'Track your progress on each feat. Some require multiple completions.' },
            { heading: 'XP and Levels', text: 'Earning XP levels you up. Each level up rewards 1 feather.' },
            { heading: 'Tip', text: 'Check back regularly — completing feats is one of the best ways to earn seeds quickly.' },
          ]}
        />
      )}
    </div>
  );
}
