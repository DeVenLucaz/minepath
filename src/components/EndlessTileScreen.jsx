import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { TILE_STYLES } from '../data/skins.js';
import ChickenSVG from './ChickenSVG';
import TopBar from './TopBar';

const THEMES = {
  CLASSIC: { id: 'classic', name: 'Classic', color: '#4a90e2', icon: '🐔', hazard: 'none' },
  LAVA: { id: 'lava', name: 'Lava', color: '#ff4d4d', icon: '🔥', hazard: 'lava' },
  ICE: { id: 'ice', name: 'Ice', color: '#a5f3fc', icon: '❄️', hazard: 'ice' },
  JUNGLE: { id: 'jungle', name: 'Jungle', color: '#22c55e', icon: '🌿', hazard: 'jungle' },
  GALAXY: { id: 'galaxy', name: 'Galaxy', color: '#8b5cf6', icon: '🌌', hazard: 'galaxy' },
};

const THEME_LIST = Object.values(THEMES);

const GRID_SIZE = 6;
const ROWS_PER_FLOOR = 6;
const INITIAL_SCROLL_SPEED = 0.5; // rows per second

const SPECIAL_THEMES = THEME_LIST.filter(t => t.id !== 'classic');

export default function EndlessTileScreen({ onBack }) {
  // --- SESSION STATE ---
  const [floor, setFloor] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [theme, setTheme] = useState(THEMES.CLASSIC);
  const [difficulty, setDifficulty] = useState(100); // Percentage
  const [scrollSpeed, setScrollSpeed] = useState(INITIAL_SCROLL_SPEED);
  
  const [rows, setRows] = useState([]); // Array of rows, each is an array of 6 tiles
  const [chicken, setChicken] = useState({ r: 2, c: 2 }); // r is row index in 'rows' array
  const [scrollPos, setScrollPos] = useState(0); // 0 to 1
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs for stale closures and tracking
  const isPausedRef = useRef(isPaused);
  const isGameOverRef = useRef(isGameOver);
  const chickenPosRef = useRef(chicken);
  const totalRowsRef = useRef(0);
  const activeSpecialThemeRef = useRef(SPECIAL_THEMES[0]);
  
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { chickenPosRef.current = chicken; }, [chicken]);

  const [lavaTimer, setLavaTimer] = useState(0);
  const [windOffset, setWindOffset] = useState(0);
  
  const lastUpdateRef = useRef(Date.now());
  const requestRef = useRef();
  const lavaStartTimeRef = useRef(null);
  const updateRef = useRef();
  
  const equippedSkin = useMemo(() => gameStore.getEquippedSkin(), []);

  const generateRow = useCallback((rowNum, diff) => {
    const currentFloor = Math.ceil(rowNum / ROWS_PER_FLOOR);
    const isSafeFloor = currentFloor % 5 === 0;
    
    let mineRate = 0;
    if (!isSafeFloor) {
      if (currentFloor <= 25) {
        mineRate = 0.10;
      } else if (currentFloor <= 50) {
        mineRate = 0.25;
      } else if (currentFloor <= 60) {
        mineRate = 0.35;
      } else {
        // After floor 60, increase 5% every 10 floors
        const blocks = Math.floor((currentFloor - 61) / 10) + 1;
        mineRate = 0.35 + (blocks * 0.05);
      }
    }
    // Cap mineRate at 75%
    mineRate = Math.min(mineRate, 0.75);

    const newRow = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const isMine = !isSafeFloor && Math.random() < mineRate;
      newRow.push({
        id: Math.random().toString(36).substr(2, 9),
        isMine,
        state: 'hidden', // hidden, revealed
        rowNum,
      });
    }
    return newRow;
  }, []);

  const triggerGameOver = () => {
    setIsGameOver(true);
    isGameOverRef.current = true;
    audio.stopEndlessBackground();
    audio.gameOver();
    if (floor > gameStore.getBestLevel()) {
        gameStore.updateBestLevel(floor);
    }
  };

  const moveChicken = (dr, dc) => {
    if (isGameOverRef.current) return;
    
    setChicken(prev => {
        const nextR = Math.min(rows.length - 1, Math.max(-1, prev.r + dr));
        const nextC = Math.min(GRID_SIZE - 1, Math.max(0, prev.c + dc));
        
        const targetRow = rows[nextR];
        if (targetRow) {
            const tile = targetRow[nextC];
            if (tile.isMine) {
                triggerGameOver();
            } else {
                if (tile.state === 'hidden') {
                    audio.safeTap();
                    setRows(currentRows => {
                        const newRows = [...currentRows];
                        newRows[nextR][nextC].state = 'revealed';
                        if (theme.hazard === 'ice' && Math.random() < 0.3) {
                            setTimeout(() => moveChicken(dr, dc), 150);
                        }
                        return newRows;
                    });
                }
                
                lavaStartTimeRef.current = Date.now();
                const nextPos = { r: nextR, c: nextC };
                chickenPosRef.current = nextPos;
                return nextPos;
            }
        }
        return prev;
    });
  };

  const update = (dt) => {
    setScrollPos(prev => {
      let next = prev + scrollSpeed * dt;
      if (next >= 1) {
        next -= 1;
        
        totalRowsRef.current += 1;
        const nextRowNum = totalRowsRef.current + rows.length;
        const currentFloor = Math.ceil(totalRowsRef.current / ROWS_PER_FLOOR);
        
        setRows(currentRows => {
          const newRows = [...currentRows.slice(1), generateRow(nextRowNum, difficulty)];
          return newRows;
        });
        setChicken(prevC => ({ ...prevC, r: prevC.r - 1 }));
        setRowCount(totalRowsRef.current);
        
        setFloor(prevF => {
            const nextF = Math.ceil(totalRowsRef.current / ROWS_PER_FLOOR);
            
            // Theme rotation logic
            if (nextF % 5 === 0) {
                setTheme(THEMES.CLASSIC);
            } else if (nextF % 5 === 1 && nextF !== prevF) {
                // New active block starts
                const nextTheme = SPECIAL_THEMES[Math.floor(Math.random() * SPECIAL_THEMES.length)];
                activeSpecialThemeRef.current = nextTheme;
                setTheme(nextTheme);
            } else if (nextF % 5 !== 0) {
                // Ensure we are using the active special theme
                setTheme(activeSpecialThemeRef.current);
            }

            // Speed and Difficulty scaling
            if (nextF !== prevF) {
                if (nextF % 5 === 0) {
                    audio.safeFloor();
                }
                // Speed increases by 7% every 10 floors starting at Floor 60
                if (nextF >= 60 && nextF % 10 === 0) {
                    setScrollSpeed(s => s * 1.07);
                }

                // Update difficulty display percentage
                let newDiff = 40; // 10% mine rate
                if (nextF > 25 && nextF <= 50) {
                    newDiff = 100; // 25% mine rate
                } else if (nextF > 50 && nextF <= 60) {
                    newDiff = 140; // 35% mine rate
                } else if (nextF > 60) {
                    const blocks = Math.floor((nextF - 61) / 10) + 1;
                    newDiff = 140 + (blocks * 20); // Each 5% mine increase is +20% difficulty
                }
                setDifficulty(newDiff);
            }
            return nextF;
        });
      }
      return next;
    });

    // Death check: if chicken falls below the screen (below bottom edge)
    const chickenVisualY = chickenPosRef.current.r * 60 - scrollPos * 60;
    if (chickenVisualY < -10) {
      triggerGameOver();
      return;
    }

    // Hazard: Lava
    if (theme.hazard === 'lava') {
        if (chicken.r !== chickenPosRef.current.r || chicken.c !== chickenPosRef.current.c) {
            lavaStartTimeRef.current = Date.now();
        }
        if (lavaStartTimeRef.current) {
            const elapsed = (Date.now() - lavaStartTimeRef.current) / 1000;
            setLavaTimer(elapsed);
            if (elapsed > 4) triggerGameOver();
        } else {
            lavaStartTimeRef.current = Date.now();
        }
    } else {
        setLavaTimer(0);
        lavaStartTimeRef.current = null;
    }

    // Hazard: Galaxy (Wind)
    if (theme.hazard === 'galaxy') {
        if (Math.random() < 0.02 * (difficulty / 100)) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            moveChicken(0, dir);
        }
    }
  };
  
  updateRef.current = update;

  const gameLoop = () => {
    const now = Date.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    if (!isPausedRef.current && !isGameOverRef.current) {
      if (updateRef.current) updateRef.current(dt);
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const initGame = () => {
    totalRowsRef.current = 1;
    activeSpecialThemeRef.current = THEMES.CLASSIC; // Start with Classic
    
    const initialRows = [];
    for (let i = 1; i <= 10; i++) {
      initialRows.push(generateRow(i, 100));
    }
    initialRows[2].forEach(t => t.isMine = false);
    initialRows[2][2].state = 'revealed';
    setRows(initialRows);
    setChicken({ r: 2, c: 2 });
    chickenPosRef.current = { r: 2, c: 2 };
    setFloor(1);
    setRowCount(1);
    setTheme(THEMES.CLASSIC);
    setDifficulty(40);
    setScrollSpeed(INITIAL_SCROLL_SPEED);
    setIsGameOver(false);
    isGameOverRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    lastUpdateRef.current = Date.now();
    requestRef.current = requestAnimationFrame(gameLoop);
    audio.startEndlessBackground();
  };

  useEffect(() => {
    initGame();
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleTileClick = (r, c) => {
    if (isPaused || isGameOver) return;
    const dr = r - chicken.r;
    const dc = c - chicken.c;
    if ((Math.abs(dr) === 1 && dc === 0) || (dr === 0 && Math.abs(dc) === 1)) {
        moveChicken(dr, dc);
    }
  };

  const isSafeFloor = floor % 5 === 0;

  return (
    <div className={`endless-screen theme-${theme.id}`} style={{ backgroundColor: theme.color }}>
      <TopBar title="ENDLESS" onBack={onBack} />
      
      <div className="endless-hud">
        <div className="hud-item">
            <span className="hud-label">FLOOR</span>
            <span className="hud-val">{floor}</span>
        </div>
        <div className="hud-item" style={{ textAlign: 'center' }}>
            <span className="hud-label">THEME</span>
            <span className="hud-val">{theme.icon} {theme.name}</span>
        </div>
        <div className="hud-item" style={{ textAlign: 'right' }}>
            <span className="hud-label">DIFF</span>
            <span className="hud-val">{difficulty}%</span>
        </div>
        <div className="hud-progress-wrap">
            <div className="hud-progress-bar" style={{ width: `${((floor - 1) % 5) / 5 * 100}%` }} />
        </div>
      </div>

      <div className="endless-grid-container">
        <div 
            className="endless-grid" 
            style={{ 
                transform: `translateY(${scrollPos * 60}px)`, 
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gap: '2px',
                padding: '2px',
            }}
        >
            {rows.slice().reverse().map((row, rIdx) => {
                const actualR = rows.length - 1 - rIdx;
                const currentTileStyle = TILE_STYLES.find(s => s.id === theme.id) || TILE_STYLES[0];
                return row.map((tile, cIdx) => {
                    const isChickenHere = chicken.r === actualR && chicken.c === cIdx;
                    const tileVisual = {
                        backgroundColor: tile.state === 'revealed' ? currentTileStyle.safeColor : currentTileStyle.hiddenColor,
                        borderColor: currentTileStyle.borderColor,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                    };
                    if (isGameOver && tile.isMine) tileVisual.backgroundColor = currentTileStyle.mineColor;

                    return (
                        <div 
                            key={tile.id}
                            className={`endless-tile ${tile.state} ${tile.isMine && isGameOver ? 'mine' : ''} ${theme.hazard === 'jungle' && tile.state === 'hidden' ? 'fog' : ''}`}
                            onClick={() => handleTileClick(actualR, cIdx)}
                            style={tileVisual}
                        >
                            {tile.state === 'revealed' && !tile.isMine && <span className="tile-check">✓</span>}
                            {isGameOver && tile.isMine && '💣'}
                            {isChickenHere && (
                                <div className="chicken-wrap">
                                    <ChickenSVG skinId={equippedSkin} size={45} mood={isGameOver ? 'sad' : 'normal'} />
                                    {theme.hazard === 'lava' && lavaTimer > 0 && (
                                        <div className="lava-timer-bar">
                                            <div className="lava-timer-fill" style={{ width: `${(lavaTimer / 4) * 100}%` }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                });
            })}
        </div>
        <div className="death-line" style={{ bottom: '0px' }} />
      </div>

      <div className="endless-controls">
        {isSafeFloor && !isGameOver && (
            <button className="btn-pause" onClick={() => { setIsPaused(prev => !prev); isPausedRef.current = !isPausedRef.current; audio.init(); }}>
                {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
        )}
        {!isSafeFloor && !isGameOver && (
            <button className="btn-end" onClick={() => { audio.stopEndlessBackground(); onBack(); }}>END RUN</button>
        )}
      </div>

      {isPaused && (
          <div className="pause-overlay">
              <h2>PAUSED</h2>
              <p>Safe Floor {floor}</p>
              <button onClick={() => { setIsPaused(false); isPausedRef.current = false; }}>RESUME</button>
              <button onClick={() => { audio.stopEndlessBackground(); onBack(); }}>QUIT</button>
          </div>
      )}

      {isGameOver && (
        <div className="gameover-overlay">
            <h2 className="shake">GAME OVER</h2>
            <p>You reached Floor {floor}</p>
            <div className="gameover-stats">
                <div>Theme: {theme.name}</div>
                <div>Diff: {difficulty}%</div>
            </div>
            <button className="btn-retry" onClick={initGame}>TRY AGAIN</button>
            <button className="btn-exit" onClick={onBack}>HOME</button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .endless-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            transition: background-color 1s ease;
        }
        .endless-hud {
            padding: 15px;
            background: rgba(0,0,0,0.5);
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            backdrop-filter: blur(5px);
            border-bottom: 2px solid rgba(255,255,255,0.1);
        }
        .hud-item { display: flex; flex-direction: column; }
        .hud-label { font-size: 10px; opacity: 0.7; letter-spacing: 1px; }
        .hud-val { font-size: 16px; font-weight: bold; }
        .hud-progress-wrap {
            grid-column: span 3;
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-top: 5px;
        }
        .hud-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #fff, #aaa);
            transition: width 0.3s ease;
        }
        .endless-grid-container {
            flex: 1;
            position: relative;
            margin: 10px;
            border: 8px solid rgba(0,0,0,0.2);
            border-radius: 12px;
            background: rgba(0,0,0,0.3);
            overflow: hidden;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
        }
        .endless-grid {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .endless-tile {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            position: relative;
            box-sizing: border-box;
        }

        .endless-tile.fog {
            filter: blur(8px);
            opacity: 0.4;
        }
        .tile-check { font-weight: bold; color: rgba(255,255,255,0.5); }
        .chicken-wrap {
            position: relative;
            z-index: 10;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
        }
        .lava-timer-bar {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 4px;
            background: rgba(0,0,0,0.5);
            border-radius: 2px;
            overflow: hidden;
        }
        .lava-timer-fill {
            height: 100%;
            background: #ff4d4d;
        }
        .death-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(to top, red, transparent);
            box-shadow: 0 0 15px red;
            z-index: 5;
            animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
            from { opacity: 0.6; }
            to { opacity: 1; }
        }
        .endless-controls {
            padding: 20px;
            display: flex;
            justify-content: center;
            gap: 20px;
        }
        .btn-pause, .btn-end {
            padding: 12px 40px;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
            transition: transform 0.1s;
        }
        .btn-pause:active, .btn-end:active { transform: translateY(2px); }
        .btn-pause { background: #fff; color: #333; }
        .btn-end { background: #ff4d4d; color: #fff; }
        .pause-overlay, .gameover-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        .shake { animation: shake 0.5s infinite; }
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
        }
        .gameover-overlay h2 { font-size: 48px; color: #ff4d4d; margin-bottom: 5px; }
        .gameover-stats { margin: 20px 0; font-size: 18px; opacity: 0.8; text-align: center; }
        .gameover-overlay button {
            margin: 8px;
            padding: 12px 50px;
            font-size: 18px;
            font-weight: bold;
            border: none;
            border-radius: 12px;
            cursor: pointer;
        }
        .btn-retry { background: #fff; color: #333; }
        .btn-exit { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
      ` }} />
    </div>
  );
}
