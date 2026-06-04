import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { TILE_STYLES } from '../data/skins.js';
import ChickenSVG from './ChickenSVG';
import TopBar from './TopBar';
import HelpModal from './HelpModal';
import { FeatIcon, MineIcon, SlowMoIcon, SeedIcon, EndlessIcon, CheckIcon } from './Icons';
import '../Styles/endless.css';

const THEMES = {
  CLASSIC: { id: 'classic', name: 'Classic', color: '#0f172a', icon: '🐔', hazard: 'none' },
  LAVA: { id: 'lava', name: 'Lava', color: '#450a0a', icon: '🔥', hazard: 'lava' },
  ICE: { id: 'ice', name: 'Ice', color: '#083344', icon: '❄️', hazard: 'ice' },
  JUNGLE: { id: 'jungle', name: 'Jungle', color: '#064e3b', icon: '🌿', hazard: 'jungle' },
  GALAXY: { id: 'galaxy', name: 'Galaxy', color: '#2e1065', icon: '🌌', hazard: 'galaxy' },
};

const THEME_LIST = Object.values(THEMES);

const BIOME_ICONS = {
  classic: FeatIcon,
  lava: MineIcon,
  ice: SlowMoIcon,
  jungle: SeedIcon,
  galaxy: EndlessIcon
};

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

  const equippedSkin = useMemo(() => gameStore.getEquippedSkin(), []);
  
  const requestRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  
  const lavaStartTimeRef = useRef(null);
  const [lavaTimer, setLavaTimer] = useState(0);
  
  const isTransitioningRef = useRef(false);
  const updateRef = useRef();

  // Triggering visual movement / generation
  const generateRow = (rowNum) => {
    const isSpecialFloor = rowNum % ROWS_PER_FLOOR === 0 && rowNum > 0;
    const isSafe = (Math.floor(rowNum / ROWS_PER_FLOOR) + 1) % 5 === 0;

    let mineCount = 1;
    if (!isSafe && !isSpecialFloor) {
      const baseDiff = (difficulty / 100); // e.g. 0.4 to 1.2
      if (Math.random() < 0.25 * baseDiff) mineCount = 2;
    }

    const row = Array.from({ length: GRID_SIZE }, (_, idx) => ({
      id: `${rowNum}-${idx}`,
      state: isSafe || isSpecialFloor ? 'revealed' : 'hidden',
      isMine: false,
      hasSeed: !isSafe && !isSpecialFloor && Math.random() < 0.25,
      powerup: null
    }));

    if (!isSafe && !isSpecialFloor) {
      let placed = 0;
      while (placed < mineCount) {
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (!row[c].isMine) {
          row[c].isMine = true;
          row[c].hasSeed = false;
          placed++;
        }
      }
    }

    return row;
  };

  const moveChicken = (dr, dc) => {
    const nr = chicken.r + dr;
    const nc = chicken.c + dc;
    if (nr < 0 || nc < 0 || nc >= GRID_SIZE) return;
    
    // Bounds limits
    if (nr >= rows.length) return;
    
    const destTile = rows[nr][nc];
    
    // Auto reveal
    if (destTile.state === 'hidden') {
      destTile.state = 'revealed';
      audio.safeTap();
      
      if (destTile.isMine) {
        triggerGameOver();
        return;
      }
    } else {
      audio.safeTap();
    }
    
    setChicken({ r: nr, c: nc });
    chickenPosRef.current = { r: nr, c: nc };
    
    if (destTile.hasSeed) {
      destTile.hasSeed = false;
      gameStore.addSeeds(1);
      audio.seedCollect();
    }
  };

  const triggerGameOver = () => {
    setIsGameOver(true);
    isGameOverRef.current = true;
    audio.gameOver();
    // Record run in leaderboard
    gameStore.addLeaderboardEntry({ level: floor, seeds: floor * 10 });
    gameStore.updateBestLevel(floor);
  };

  const update = (dt) => {
    // Game state tracking
    const speed = scrollSpeed; // rows per sec
    const nextScroll = scrollPos + speed * dt;
    if (nextScroll >= 1) {
        setScrollPos(nextScroll - 1);
        // Shift rows
        setRows(prev => {
            const next = prev.slice(1);
            next.push(generateRow(totalRowsRef.current + 10));
            totalRowsRef.current++;
            return next;
        });
        
        // Push chicken down
        setChicken(prev => {
            const next = { ...prev, r: prev.r - 1 };
            chickenPosRef.current = next;
            if (next.r < 0) {
                triggerGameOver();
            }
            return next;
        });
        
        setRowCount(prev => {
            const next = prev + 1;
            if (next % ROWS_PER_FLOOR === 0) {
                setFloor(f => {
                    const nextFloor = f + 1;
                    if (nextFloor % 5 === 0) {
                        // Safe floor transition
                        setTheme(THEMES.CLASSIC);
                    } else if ((nextFloor - 1) % 5 === 0) {
                        // Change active theme
                        const randomTheme = SPECIAL_THEMES[Math.floor(Math.random() * SPECIAL_THEMES.length)];
                        setTheme(randomTheme);
                    }
                    if (nextFloor % 25 === 0) {
                        setDifficulty(d => Math.min(200, d + 20));
                        setScrollSpeed(s => Math.min(1.5, s + 0.1));
                    }
                    return nextFloor;
                });
            }
            return next;
        });
    } else {
        setScrollPos(nextScroll);
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
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    totalRowsRef.current = 1;
    activeSpecialThemeRef.current = THEMES.CLASSIC;
    
    const initialRows = [];
    for (let i = 1; i <= 10; i++) {
      initialRows.push(generateRow(i));
    }
    setRows(initialRows);
    setChicken({ r: 2, c: 2 });
    chickenPosRef.current = { r: 2, c: 2 };
    setScrollPos(0);
    setFloor(1);
    setRowCount(1);
    setTheme(THEMES.CLASSIC);
    setDifficulty(40);
    setScrollSpeed(INITIAL_SCROLL_SPEED);
    setLavaTimer(0);
    lavaStartTimeRef.current = null;
    setFocus(null);
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
            <span className="hud-val flex items-center gap-1.5">
              {(() => {
                const ThemeIcon = BIOME_ICONS[theme.id] || FeatIcon;
                return <ThemeIcon size={16} className="text-gold" />;
              })()} 
              {theme.name}
            </span>
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
                            {tile.state === 'revealed' && !tile.isMine && (
                              <CheckIcon size={16} className="text-white mx-auto" />
                            )}
                            {isGameOver && tile.isMine && (
                              <MineIcon size={16} className="text-white mx-auto" />
                            )}
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
