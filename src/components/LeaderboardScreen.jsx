import React, { useEffect, useState, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import TopBar from './TopBar';
import ChickenSVG from './ChickenSVG';

// ── Seeded fake global players (deterministic, always same list) ──
const GLOBAL_PLAYERS = [
  { name: 'GoldClucker',  level: 42, seeds: 9875000, skin: 'royal'   },
  { name: 'SilverPeck',   level: 39, seeds: 8950420, skin: 'ninja'   },
  { name: 'BronzeBeak',   level: 36, seeds: 8120100, skin: 'space'   },
  { name: 'SpeedyHen',    level: 33, seeds: 7500250, skin: 'classic' },
  { name: 'LuckyLayer',   level: 30, seeds: 7110890, skin: 'ghost'   },
  { name: 'FeatherFinder',level: 27, seeds: 6805300, skin: 'classic' },
  { name: 'CluckMaster',  level: 24, seeds: 6200100, skin: 'royal'   },
  { name: 'EggSprinter',  level: 21, seeds: 5750400, skin: 'ninja'   },
  { name: 'TurboTalons',  level: 18, seeds: 5100200, skin: 'space'   },
  { name: 'PeckQueen',    level: 15, seeds: 4620050, skin: 'classic' },
];

const PODIUM_COLORS = {
  0: { bg: '#FFD700', shadow: '#B8860B', crown: '👑', label: '1' },
  1: { bg: '#C0C0C0', shadow: '#808080', crown: '🥈', label: '2' },
  2: { bg: '#CD7F32', shadow: '#8B4513', crown: '🥉', label: '3' },
};

// Podium heights
const PODIUM_H = [110, 80, 65]; // 1st, 2nd, 3rd
const PODIUM_ORDER = [1, 0, 2]; // visual order: 2nd left, 1st center, 3rd right

const STARS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 43.7 + 7) % 100}%`,
  top:  `${(i * 59.3 + 11) % 100}%`,
  size: `${(i % 3) + 2}px`,
  delay: `${(i * 0.28) % 3}s`,
  dur: `${1.7 + (i % 5) * 0.3}s`,
}));

export default function LeaderboardScreen({ onBack }) {
  const [tab, setTab]             = useState('global');
  const [myRuns, setMyRuns]       = useState([]);
  const [bestLevel, setBestLevel] = useState(0);
  const [playerName]              = useState('MyChick');
  const equippedSkin              = useMemo(() => gameStore.getEquippedSkin(), []);

  useEffect(() => {
    setMyRuns(gameStore.getLeaderboard());
    setBestLevel(gameStore.getBestLevel());
  }, []);

  // Find player rank in global list based on best level
  const myGlobalRank = useMemo(() => {
    const rank = GLOBAL_PLAYERS.findIndex(p => bestLevel > p.level);
    return rank === -1 ? GLOBAL_PLAYERS.length + 1 : rank + 1;
  }, [bestLevel]);

  const myBestSeeds = useMemo(() => {
    if (!myRuns.length) return 0;
    return Math.max(...myRuns.map(r => r.seeds || 0));
  }, [myRuns]);

  return (
    <div className="leaderboard-screen">

      {/* Stars */}
      <div className="stars-bg" aria-hidden="true">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: s.delay, animationDuration: s.dur,
          }}/>
        ))}
      </div>

      <TopBar title="SCORES" onBack={onBack} />

      {/* Big title */}
      <div className="lb-big-title">🐔 TOP CHICKENS</div>

      {/* Tab toggle */}
      <div className="lb-tabs">
        <button
          className={`lb-tab ${tab === 'global' ? 'lb-tab--active' : ''}`}
          onClick={() => setTab('global')}
        >Global</button>
        <button
          className={`lb-tab ${tab === 'myruns' ? 'lb-tab--active' : ''}`}
          onClick={() => setTab('myruns')}
        >My Runs</button>
      </div>

      {/* ── GLOBAL TAB ── */}
      {tab === 'global' && (
        <div className="lb-global">

          {/* Podium */}
          <div className="lb-podium">
            {PODIUM_ORDER.map(rank => {
              const player = GLOBAL_PLAYERS[rank];
              const pc     = PODIUM_COLORS[rank];
              const h      = PODIUM_H[rank];
              return (
                <div key={rank} className="lb-podium-slot">
                  {/* Crown */}
                  <div className="lb-podium-crown">{pc.crown}</div>
                  {/* Chicken avatar */}
                  <div className="lb-podium-chicken">
                    <ChickenSVG skinId={player.skin} mood="happy" size={rank === 0 ? 72 : 58}/>
                  </div>
                  {/* Name + score */}
                  <div className="lb-podium-name">{player.name}</div>
                  <div className="lb-podium-score">{player.seeds.toLocaleString()}</div>
                  {/* Pedestal */}
                  <div
                    className="lb-pedestal"
                    style={{ height: h, background: pc.bg, boxShadow: `0 6px 0 ${pc.shadow}` }}
                  >
                    <span className="lb-pedestal-num">{pc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rankings 4+ list */}
          <div className="lb-rankings-wrap">
            <div className="lb-rankings-label">Rankings 4+</div>
            <div className="lb-rankings-list">
              {GLOBAL_PLAYERS.slice(3).map((p, i) => (
                <div key={i} className="lb-row">
                  <span className="lb-row-rank">{i + 4}</span>
                  <div className="lb-row-avatar">
                    <ChickenSVG skinId={p.skin} mood="normal" size={32}/>
                  </div>
                  <span className="lb-row-name">{p.name}</span>
                  <span className="lb-row-score">{p.seeds.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Player's own pinned row */}
            <div className="lb-my-row">
              <span className="lb-row-rank lb-my-rank">{myGlobalRank}</span>
              <div className="lb-row-avatar lb-my-avatar">
                <ChickenSVG skinId={equippedSkin} mood="normal" size={32}/>
              </div>
              <span className="lb-row-name lb-my-name">{playerName}</span>
              <span className="lb-row-score lb-my-score">
                {myBestSeeds > 0 ? myBestSeeds.toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── MY RUNS TAB ── */}
      {tab === 'myruns' && (
        <div className="lb-myruns">
          {myRuns.length === 0 ? (
            <div className="lb-empty">
              <ChickenSVG skinId={equippedSkin} mood="sad" size={100}/>
              <div className="lb-empty-text">No runs yet!</div>
              <div className="lb-empty-sub">Play a game to see your history here</div>
            </div>
          ) : (
            <>
              {/* Personal best banner */}
              <div className="lb-pb-banner">
                <span className="lb-pb-label">🏆 Personal Best</span>
                <span className="lb-pb-val">Level {bestLevel}</span>
              </div>
              {/* Runs list */}
              <div className="lb-runs-list">
                <div className="lb-runs-header">
                  <span>Rank</span>
                  <span>Level</span>
                  <span>Seeds 🌾</span>
                  <span>Date</span>
                </div>
                {myRuns.map((run, i) => (
                  <div key={i} className={`lb-run-row ${i === 0 ? 'lb-run-row--best' : ''}`}>
                    <span className="lb-run-rank">#{i + 1}</span>
                    <span className="lb-run-level">Lv.{run.level}</span>
                    <span className="lb-run-seeds">{(run.seeds || 0).toLocaleString()}</span>
                    <span className="lb-run-date">{run.date}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
