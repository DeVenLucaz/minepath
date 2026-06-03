import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { TILE_STYLES } from '../data/skins.js';
import ChickenSVG from './ChickenSVG';
import TopBar from './TopBar';
import HelpModal from './HelpModal';
import '../Styles/endless.css';

const THEMES = {
  CLASSIC: { id: 'classic', name: 'Classic', color: '#0f172a', icon: '🐔', hazard: 'none' },
  LAVA: { id: 'lava', name: 'Lava', color: '#450a0a', icon: '🔥', hazard: 'lava' },
  ICE: { id: 'ice', name: 'Ice', color: '#083344', icon: '❄️', hazard: 'ice' },
  JUNGLE: { id: 'jungle', name: 'Jungle', color: '#064e3b', icon: '🌿', hazard: 'jungle' },
  GALAXY: { id: 'galaxy', name: 'Galaxy', color: '#2e1065', icon: '🌌', hazard: 'galaxy' },
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
  const [showHelp, setShowHelp] = useState(false);
  const [focus, setFocus] = useState(null);
  
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
  
  const lastUpdateRef = useRef(Date.now());
  const requestRef = useRef();
  const lavaStartTimeRef = useRef(null);
  const updateRef = useRef();
  
  const equippedSkin = useMemo(() => gameStore.getEquippedSkin(), []);

  const generateRow = useCallback((rowNum) => {
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
        const blocks = Math.floor((currentFloor - 61) / 10) + 1;
        mineRate = 0.35 + (blocks * 0.05);
      }
    }
    mineRate = Math.min(mineRate, 0.75);

    const newRow = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const isMine = !isSafeFloor && Math.random() < mineRate;
      newRow.push({
        id: Math.random().toString(36).substr(2, 9),
        isMine,
        state: 'hidden', 
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
                
                // Focus direction
                if (dr < 0) setFocus('up');
                else if (dr > 0) setFocus('down');
                else if (dc < 0) setFocus('left');
                else if (dc > 0) setFocus('right');
                setTimeout(() => setFocus(null), 300);

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
        
        setRows(currentRows => {
          const newRows = [...currentRows.slice(1), generateRow(nextRowNum)];
          return newRows;
        });
        setChicken(prevC => ({ ...prevC, r: prevC.r - 1 }));
        setRowCount(totalRowsRef.current);
        
        setFloor(prevF => {
            const nextF = Math.ceil(totalRowsRef.current / ROWS_PER_FLOOR);
            
            if (nextF % 5 === 0) {
                setTheme(THEMES.CLASSIC);
            } else if (nextF % 5 === 1 && nextF !== prevF) {
                const nextTheme = SPECIAL_THEMES[Math.floor(Math.random() * SPECIAL_THEMES.length)];
                activeSpecialThemeRef.current = nextTheme;
                setTheme(nextTheme);
            } else if (nextF % 5 !== 0) {
                setTheme(activeSpecialThemeRef.current);
            }

            if (nextF !== prevF) {
                if (nextF % 5 === 0) audio.safeFloor();
                if (nextF >= 60 && nextF % 10 === 0) setScrollSpeed(s => s * 1.07);

                let newDiff = 40;
                if (nextF > 25 && nextF <= 50) newDiff = 100;
                else if (nextF > 50 && nextF <= 60) newDiff = 140;
                else if (nextF > 60) {
                    const blocks = Math.floor((nextF - 61) / 10) + 1;
                    newDiff = 140 + (blocks * 20);
                }
                setDifficulty(newDiff);
            }
            return nextF;
        });
      }
      return next;
    });

    const chickenVisualY = chickenPosRef.current.r * 60 - scrollPos * 60;
    if (chickenVisualY < -10) {
      triggerGameOver();
      return;
    }

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
    activeSpecialThemeRef.current = THEMES.CLASSIC;
    
    const initialRows = [];
    for (let i = 1; i <= 10; i++) {
      initialRows.push(generateRow(i));
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
      <TopBar title="ENDLESS" onBack={onBack} showSeeds={false}/>

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
      >
        ?
      </button>
      
      <div className="endless-hud">
        <div className="hud-item">
            <span className="hud-label">Floor</span>
            <span className="hud-val">{floor}</span>
        </div>
        <div className="hud-item items-center">
            <span className="hud-label">Theme</span>
            <span className="hud-val flex items-center gap-1.5">{theme.icon} {theme.name}</span>
        </div>
        <div className="hud-item items-end">
            <span className="hud-label">Diff</span>
            <span className="hud-val text-gold">{difficulty}%</span>
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
                        borderWidth: '1.5px',
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
                                    <ChickenSVG skinId={equippedSkin} size={45} mood={isGameOver ? 'sad' : 'normal'} focus={focus} />
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
              <h2 className="text-4xl font-black text-primary mb-2">PAUSED</h2>
              <p className="text-secondary font-bold uppercase tracking-widest mb-8">Safe Floor {floor}</p>
              <button className="btn-retry" onClick={() => { setIsPaused(false); isPausedRef.current = false; }}>RESUME</button>
              <button className="btn-exit" onClick={() => { audio.stopEndlessBackground(); onBack(); }}>QUIT</button>
          </div>
      )}

      {isGameOver && (
        <div className="gameover-overlay">
            <h2 className="shake">GAME OVER</h2>
            <div className="gameover-stats">
                <div className="text-primary font-black text-xl mb-1">Floor {floor}</div>
                <div className="text-xs uppercase font-bold tracking-tighter opacity-60">Theme: {theme.name} • Difficulty: {difficulty}%</div>
            </div>
            <button className="btn-retry" onClick={initGame}>TRY AGAIN</button>
            <button className="btn-exit" onClick={onBack}>HOME</button>
        </div>
      )}

      {showHelp && (
        <HelpModal
          title="Endless Tiles"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Goal', text: 'Survive as long as possible. Tiles scroll upward — do not fall below the death line.' },
            { heading: 'Floor Cycle', text: 'Every 5th floor is a safe floor with no mines. Use it to breathe.' },
            { heading: 'Themes', text: 'After each safe floor, a random theme applies with unique hazards — Lava burns, Ice slips, Jungle fogs, Galaxy pushes.' },
            { heading: 'Difficulty', text: 'Every 25 floors, difficulty increases. Mine density and scroll speed go up.' },
            { heading: 'Pause', text: 'You can only pause on safe floors. On active floors, only End Run is available.' },
          ]}
        />
      )}
    </div>
  );
}
