import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import ChickenSVG from './ChickenSVG';
import TopBar from './TopBar';

export default function EndlessTowerScreen({ onBack }) {
  const [rows, setRows] = useState([]);
  const [chicken, setChicken] = useState({ r: 5, c: 3 });
  const [floor, setFloor] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seeds, setSeeds] = useState(0);
  const [goldenSeeds, setGoldenSeeds] = useState(0);

  const COLS = 7;
  const VISIBLE_ROWS = 10;
  const scrollRef = useRef(0);
  const gameRef = useRef({ active: true });

  const generateRow = (rIndex) => {
    const row = [];
    const isBossFloor = rIndex > 0 && rIndex % 50 === 0;
    for (let c = 0; c < COLS; c++) {
      const isMine = Math.random() < 0.25;
      row.push({
        r: rIndex,
        c,
        isMine,
        state: 'hidden',
        hasSeed: !isMine && Math.random() < 0.1,
        hasGolden: !isMine && Math.random() < 0.02,
        isBoss: isBossFloor && c === 3
      });
    }
    // Ensure at least one path
    if (row.every(t => t.isMine)) {
      row[Math.floor(Math.random() * COLS)].isMine = false;
    }
    return row;
  };

  useEffect(() => {
    const initialRows = [];
    for (let i = 0; i < 15; i++) {
      initialRows.push(generateRow(i));
    }
    setRows(initialRows);
    setChicken({ r: 2, c: 3 });
    audio.startBackground();

    const scrollInterval = setInterval(() => {
      if (!gameRef.current.active) return;
      setScrollOffset(prev => {
        const next = prev + 0.5;
        if (next > 44) { // Row height approx 44
          setRows(current => {
            const lastRow = current[current.length - 1];
            return [...current.slice(1), generateRow(lastRow.r + 1)];
          });
          setChicken(prevC => ({ ...prevC, r: prevC.r - 1 }));
          setFloor(f => f + 1);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(scrollInterval);
  }, []);

  useEffect(() => {
    if (chicken.r < 0 && !gameOver) {
      handleGameOver();
    }
  }, [chicken.r]);

  const handleGameOver = () => {
    gameRef.current.active = false;
    setGameOver(true);
    playerStore.updateTowerBest(floor);
    playerStore.addSeeds(seeds);
    playerStore.addGoldenSeeds(goldenSeeds);
    audio.gameOver();
  };

  const handleTileClick = (tile) => {
    if (!gameRef.current.active) return;
    const dr = tile.r - chicken.r;
    const dc = Math.abs(tile.c - chicken.c);
    
    // Can only move to adjacent OR forward
    if (dr >= 0 && dr <= 1 && dc <= 1) {
      if (tile.isMine) {
        handleGameOver();
      } else {
        setChicken({ r: tile.r, c: tile.c });
        if (tile.hasSeed) setSeeds(s => s + 1);
        if (tile.hasGolden) setGoldenSeeds(g => g + 1);
        audio.safeTap();
      }
    }
  };

  return (
    <div className="screen-base tower-screen">
      <TopBar title={`FLOOR ${floor}`} onBack={onBack} />
      
      <div className="tower-hud">
        <div className="hud-chip">🌾 {seeds}</div>
        <div className="hud-chip gold">✨ {goldenSeeds}</div>
      </div>

      <div className="tower-grid-container">
        <div className="tower-grid" style={{ transform: `translateY(${scrollOffset}px)` }}>
          {rows.map((row, ri) => (
            <div key={row[0].r} className="tower-row">
              {row.map((tile, ci) => (
                <div 
                  key={ci} 
                  className={`tower-tile ${tile.isMine ? 'mine' : ''} ${chicken.r === tile.r && chicken.c === tile.c ? 'occupied' : ''}`}
                  onClick={() => handleTileClick(tile)}
                >
                  {tile.hasSeed && '🌾'}
                  {tile.hasGolden && '✨'}
                  {tile.isBoss && '👹'}
                  {chicken.r === tile.r && chicken.c === tile.c && (
                    <div className="tower-chicken">
                      <ChickenSVG size={30} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {gameOver && (
        <div className="modal-backdrop modal-backdrop--visible">
          <div className="modal-card modal-card--in">
            <h2 className="mo-title">FALLEN!</h2>
            <div className="mo-stats">
              <div className="mo-stat-row">
                <span className="mo-stat-label">MAX FLOOR</span>
                <span className="mo-stat-val">{floor}</span>
              </div>
              <div className="mo-stat-row">
                <span className="mo-stat-label">SEEDS FOUND</span>
                <span className="mo-stat-val">{seeds} 🌾</span>
              </div>
              <div className="mo-stat-row">
                <span className="mo-stat-label">GOLDEN SEEDS</span>
                <span className="mo-stat-val">{goldenSeeds} ✨</span>
              </div>
            </div>
            <button className="mo-btn mo-btn--retry" onClick={() => window.location.reload()}>TRY AGAIN</button>
            <button className="mo-btn mo-btn--home" onClick={onBack}>BACK TO SANCTUARY</button>
          </div>
        </div>
      )}
    </div>
  );
}
