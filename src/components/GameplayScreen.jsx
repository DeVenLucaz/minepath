import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gameStore } from '../store/gameStore';
import { audio } from '../audio/engine';
import { CHICKEN_SKINS, TILE_STYLES, TRAIL_EFFECTS } from '../data/skins';
import { PETS } from '../data/pets';
import ChickenSVG from './ChickenSVG';
import TopBar from './TopBar';
import GameOverModal from './GameOverModal';
import LevelClearModal from './LevelClearModal';

// ─── DIFFICULTY CONFIG ───────────────────────────────────────────
function getDifficultyConfig(level) {
  let mineRate, timerSpeed, obstacleFreq;
  if (level <= 5)       { mineRate = 0.20; timerSpeed = 0.8;  obstacleFreq = 0; }
  else if (level <= 10) { mineRate = 0.30; timerSpeed = 1.2;  obstacleFreq = 0.3; }
  else if (level <= 15) { mineRate = 0.40; timerSpeed = 1.8;  obstacleFreq = 0.5; }
  else if (level <= 20) { mineRate = 0.50; timerSpeed = 2.5;  obstacleFreq = 0.7; }
  else                  { mineRate = 0.60; timerSpeed = 3.5;  obstacleFreq = 1.0; }
  const rows = Math.min(6 + Math.floor(level / 4), 10);
  const cols = Math.min(6 + Math.floor(level / 6), 9);
  const timerMax = Math.max(20, 45 - level * 0.8);
  return { mineRate, timerSpeed, rows, cols, timerMax, obstacleFreq };
}

// ─── GRID GENERATION ─────────────────────────────────────────────
function generateGrid(rows, cols, mineRate, level, isDaily) {
  // Simple Seeded Random for Daily Challenge
  let seed = 12345;
  if (isDaily) {
    const today = new Date().toDateString();
    seed = today.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  }

  const sRandom = () => {
    if (!isDaily) return Math.random();
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const tiles = [];
  const checkpointR = 0, checkpointC = cols - 1;
  const startR = rows - 1, startC = 0;
  const powerupCount = Math.max(1, Math.floor(level / 3));
  const powerupTypes = ['shield', 'slowmo', 'reveal', 'doublescore', 'magnet'];
  const fakeSafeCount = level >= 8 ? Math.floor(level / 8) : 0;
  const seedCount = Math.max(2, Math.floor(rows * cols * 0.1));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        r, c,
        isMine: false,
        isSafe: true,
        isCheckpoint: r === checkpointR && c === checkpointC,
        isStart: r === startR && c === startC,
        state: 'hidden', // hidden | revealed | mine | checkpoint
        powerup: null,
        hasSeed: false,
        isFakeSafe: false,
      });
    }
  }

  // Place mines
  const candidates = tiles.filter(t =>
    !t.isCheckpoint && !t.isStart
  );

  // Shuffle and place mines
  const shuffled = [...candidates].sort(() => sRandom() - 0.5);
  const mineCount = Math.floor((rows * cols - 2) * mineRate);
  let minesPlaced = 0;

  shuffled.slice(0, mineCount).forEach(t => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile && !tile.isCheckpoint && !tile.isStart) {
      tile.isMine = true;
      tile.isSafe = false;
      minesPlaced++;
    }
  });

  // Place fake safe tiles (look safe but are mines)
  const safeTiles = tiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart);
  safeTiles.slice(0, fakeSafeCount).forEach(t => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile) {
      tile.isFakeSafe = true;
      tile.isMine = true;
      tile.isSafe = false;
    }
  });

  // Place powerups on safe tiles
  const safeTilesForPowerup = tiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart);
  safeTilesForPowerup.sort(() => sRandom() - 0.5).slice(0, powerupCount).forEach((t, i) => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile) tile.powerup = powerupTypes[i % powerupTypes.length];
  });

  // Place seeds on remaining safe tiles
  const remainingSafe = tiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart && !t.powerup);
  remainingSafe.sort(() => sRandom() - 0.5).slice(0, seedCount).forEach(t => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile) tile.hasSeed = true;
  });

  // Set checkpoint visible
  const checkpoint = tiles.find(t => t.isCheckpoint);
  if (checkpoint) checkpoint.state = 'checkpoint';

  // Reveal start tile
  const start = tiles.find(t => t.isStart);
  if (start) start.state = 'revealed';

  return tiles;
}

// ─── TRAIL PARTICLE ──────────────────────────────────────────────
function TrailParticle({ x, y, trailId, index, total, particleIndex = 0 }) {
  const trailData = TRAIL_EFFECTS.find(t => t.id === trailId);
  const colors = trailData?.particleColors || ['#FFD700','#FFF'];
  const color = colors[(index + particleIndex) % colors.length];
  
  const isSparkle = trailId === 'sparkle';
  const isRainbow = trailId === 'rainbow';
  const isBubble  = trailId === 'bubble';
  const isFlower  = trailId === 'flower';
  const isMusic   = trailId === 'music';
  
  // total is the number of historical positions. 
  // index is the position index (0 = oldest, total-1 = newest)
  const ageFactor = index / (total || 1); 
  const opacity  = Math.max(0.1, ageFactor * 0.8);
  const baseSize = (isFlower || isMusic) ? 14 : isBubble ? 12 : 8;
  const size     = Math.max(4, baseSize + ageFactor * 10);

  // Content and custom styles for variety
  let content = null;
  let customStyle = {};

  if (isFlower) {
    const flowers = ['🌸', '🌼', '🌻', '🌺', '🌷'];
    content = flowers[(index + particleIndex) % flowers.length];
    customStyle = { fontSize: `${size}px`, background: 'none', boxShadow: 'none' };
  } else if (isMusic) {
    const notes = ['🎵', '🎶', '♪', '♫', '♬'];
    content = notes[(index + particleIndex) % notes.length];
    customStyle = { fontSize: `${size}px`, background: 'none', boxShadow: 'none', color };
  } else if (isSparkle) {
    content = '✨';
    customStyle = { fontSize: `${size}px`, background: 'none', boxShadow: 'none' };
  } else if (isBubble) {
    customStyle = {
      background: 'rgba(255,255,255,0.2)',
      border: `1.5px solid ${color}`,
      boxShadow: `inset -2px -2px 4px rgba(255,255,255,0.4), 0 0 5px ${color}`,
    };
  } else if (isRainbow) {
    customStyle = {
      boxShadow: `0 0 12px ${color}, 0 0 4px #fff`,
      border: '1px solid #fff',
      background: color,
    };
  } else {
    // Default fallback
    customStyle = { background: color, boxShadow: `0 0 8px ${color}` };
  }

  return (
    <div className={`trail-particle trail-particle--${trailId}`} style={{
      left: x + '%',
      top: y + '%',
      opacity,
      width: size,
      height: size,
      borderRadius: (isMusic || isFlower || isSparkle) ? '0' : '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      ...customStyle
    }}>
      {content}
    </div>
  );
}

// ─── CHICKEN COMPONENT — uses ChickenSVG ─────────────────────────
function Chicken({ skin, animState, position, cellW, cellH, isMagnetActive }) {
  const pixelX = position.c * (cellW + 2) + cellW / 2;
  const pixelY = position.r * (cellH + 2) + cellH / 2;
  const mood = animState === 'explode' ? 'sad' : animState === 'celebrate' ? 'happy' : 'normal';
  const size = Math.min(cellW, cellH) * 1.15;
  return (
    <div
      className={`chicken-entity anim-${animState}`}
      style={{
        position: 'absolute',
        left: pixelX,
        top: pixelY,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        transition: 'left 0.18s ease, top 0.18s ease',
        pointerEvents: 'none',
        filter: animState === 'explode' ? 'drop-shadow(0 0 8px #FF4500)' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
      }}
    >
      <ChickenSVG skinId={skin} mood={mood} size={size}/>
      {animState === 'shield' && <div className="shield-bubble"/>}
      {isMagnetActive && <div className="magnet-pulse"/>}
    </div>
  );
}

// ─── PET COMPONENT ──────────────────────────────────────────────
function Pet({ petId, position, cellW, cellH }) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return null;

  // Center of chicken tile
  const centerX = position.c * (cellW + 2) + cellW / 2;
  const centerY = position.r * (cellH + 2) + cellH / 2;

  // Final pet position with fixed offsets
  const isNearTop = position.r < 2;
  const petX = centerX + 50;
  const petY = isNearTop ? centerY + 50 : centerY - 50;

  return (
    <div
      className="pet-entity"
      style={{
        position: 'absolute',
        left: petX,
        top: petY,
        fontSize: '20px',
        zIndex: 19,
        transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)', // Just center the pet sprite on its point
      }}
    >
      {pet.emoji}
    </div>
  );
}

// ─── TILE COMPONENT ──────────────────────────────────────────────
function Tile({ tile, tileStyle, isAdjacent, onTap, onLongPress, cellW, cellH, isFoggy }) {
  const styleData = TILE_STYLES.find(s => s.id === tileStyle) || TILE_STYLES[0];
  const pressTimer = useRef(null);
  const pressed = useRef(false);

  const handleTouchStart = (e) => {
    e.preventDefault();
    pressed.current = true;
    pressTimer.current = setTimeout(() => {
      if (pressed.current) {
        onLongPress(tile);
        pressed.current = false;
      }
    }, 400);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (pressed.current) {
      clearTimeout(pressTimer.current);
      pressed.current = false;
      onTap(tile);
    }
  };

  const handleTouchMove = () => {
    clearTimeout(pressTimer.current);
    pressed.current = false;
  };

  const handleMouseDown = () => {
    pressed.current = true;
    pressTimer.current = setTimeout(() => {
      if (pressed.current) {
        onLongPress(tile);
        pressed.current = false;
      }
    }, 400);
  };

  const handleMouseUp = () => {
    if (pressed.current) {
      clearTimeout(pressTimer.current);
      pressed.current = false;
      onTap(tile);
    }
  };

  let bg, content, extraClass = '';

  if (tile.state === 'checkpoint') {
    bg = isFoggy ? styleData.hiddenColor : '#FFD700';
    content = isFoggy ? '?' : '🏁';
    extraClass = isFoggy ? 'tile-hidden' : 'tile-checkpoint';
  } else if (tile.state === 'hidden') {
    bg = styleData.hiddenColor;
    content = (tile.powerup && !isFoggy) ? '✨' : ((tile.hasSeed && !isFoggy) ? '🌾' : '?');
    extraClass = `tile-hidden ${tile.powerup ? 'tile-powerup-glow' : ''} ${isAdjacent ? 'tile-adjacent' : ''} ${isFoggy ? 'tile-foggy' : ''}`;
  } else if (tile.state === 'revealed') {
    bg = styleData.safeColor;
    content = tile.powerup ? getPowerupIcon(tile.powerup) : (tile.hasSeed ? '🌾' : '✓');
    extraClass = 'tile-revealed tile-flip-anim';
  } else if (tile.state === 'mine') {
    bg = styleData.mineColor;
    content = '💀';
    extraClass = 'tile-mine tile-shake';
  } else if (tile.state === 'peeked') {
    bg = tile.isMine ? '#ff6b6b' : '#90EE90';
    content = tile.isMine ? '💣' : '✓';
    extraClass = 'tile-peeked tile-flip-anim';
  }

  return (
    <div
      className={`game-tile ${extraClass}`}
      style={{
        width: cellW,
        height: cellH,
        background: bg,
        border: `2px solid ${styleData.borderColor}`,
        position: 'relative',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <span className="tile-content">{content}</span>
      {tile.state === 'hidden' && tile.powerup && (
        <div className="powerup-indicator" />
      )}
    </div>
  );
}

function getPowerupIcon(type) {
  const icons = { shield: '🛡️', slowmo: '⏱️', reveal: '👁️', doublescore: '⭐', magnet: '🧲' };
  return icons[type] || '✨';
}

// ─── OBSTACLE OVERLAY ────────────────────────────────────────────
function ObstacleOverlay({ obstacle, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [obstacle]);

  if (!obstacle) return null;
  const msgs = {
    thief: { icon: '🦊', text: 'THIEF FOX!', sub: 'Stole your powerup!', cls: 'obstacle-thief' },
    wind: { icon: '💨', text: 'WIND GUST!', sub: 'You were pushed!', cls: 'obstacle-wind' },
    scramble: { icon: '🔀', text: 'SCRAMBLER!', sub: 'Tiles re-hidden!', cls: 'obstacle-scramble' },
  };
  const m = msgs[obstacle] || { icon: '⚠️', text: 'OBSTACLE!', sub: '', cls: '' };
  return (
    <div className={`obstacle-overlay ${m.cls}`}>
      <div className="obstacle-icon">{m.icon}</div>
      <div className="obstacle-text">{m.text}</div>
      <div className="obstacle-sub">{m.sub}</div>
    </div>
  );
}

// ─── CONFETTI ────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random(),
    size: 6 + Math.random() * 10,
  }));
  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.x}%`,
          background: p.color,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          width: p.size,
          height: p.size,
        }} />
      ))}
    </div>
  );
}

// ─── MAIN GAMEPLAY SCREEN ─────────────────────────────────────────
export default function GameplayScreen({ startLevel = 1, onGameOver, onLevelComplete, isDaily = false, frozen = false, onBack }) {
  const [level, setLevel] = useState(startLevel);
  const [tiles, setTiles] = useState([]);
  const [chicken, setChicken] = useState({ r: 0, c: 0 });
  const [timer, setTimer] = useState(30);
  const [timerMax, setTimerMax] = useState(30);
  const [seeds, setSeeds] = useState(gameStore.getSeeds());
  const [activePowerup, setActivePowerup] = useState(null);
  const [powerupTimer, setPowerupTimer] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [chickenAnim, setChickenAnim] = useState('idle');
  const [shaking, setShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [obstacle, setObstacle] = useState(null);
  const [doubleScore, setDoubleScore] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [gamePhase, setGamePhase] = useState('playing'); // playing | levelcomplete | gameover
  const [visitedTiles, setVisitedTiles] = useState([]); // [{r, c}]
  const [levelSeeds, setLevelSeeds] = useState(0);
  const [levelTimeLeft, setLevelTimeLeft] = useState(0);
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [revealAllActive, setRevealAllActive] = useState(false);
  const [slowMoActive, setSlowMoActive] = useState(false);
  const [modifiers, setModifiers] = useState([]); // 'fog', 'speed'
  const [equippedPetId, setEquippedPetId] = useState(gameStore.getEquippedPet());
  const [touchStart, setTouchStart] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [mineSkipCharges, setMineSkipCharges] = useState(0);

  const timerRef = useRef(null);
  const powerupTimerRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const timerVal = useRef(30);
  const timerMaxVal = useRef(30);
  const slowMoRef = useRef(false);
  const levelRef = useRef(startLevel);
  const gamePhaseRef = useRef('playing');
  const pauseRef = useRef(false);
  const diffRef = useRef(null);

  const equippedSkin = gameStore.getEquippedSkin();
  const equippedTile = gameStore.getEquippedTile();
  const equippedTrail = gameStore.getEquippedTrail();

  // Initialize level
  const initLevel = useCallback((lvl) => {
    const diff = getDifficultyConfig(lvl);
    diffRef.current = diff;

    // --- MODIFIERS ---
    const activeMods = [];
    if (lvl >= 7 && Math.random() < 0.25) activeMods.push('fog');
    if (lvl >= 12 && Math.random() < 0.25) activeMods.push('speed');
    setModifiers(activeMods);

    const newTiles = generateGrid(diff.rows, diff.cols, diff.mineRate, lvl, isDaily);
    const startR = diff.rows - 1, startC = 0;

    // --- REFRESH EQUIPPED ITEMS ---
    setEquippedPetId(gameStore.getEquippedPet());

    // --- PET BONUSES ---
    const pet = PETS.find(p => p.id === gameStore.getEquippedPet());
    let startTime = diff.timerMax;
    if (pet?.bonus === 'time_bonus') startTime += pet.bonusVal;

    if (pet?.bonus === 'safe_reveal') {
      const safeTiles = newTiles.filter(t => !t.isMine && t.state === 'hidden' && !t.isCheckpoint && !t.isStart);
      if (safeTiles.length > 0) {
        const randomTile = safeTiles[Math.floor(Math.random() * safeTiles.length)];
        randomTile.state = 'revealed';
      }
    }

    if (pet?.bonus === 'mine_skip') {
      // 1 charge every 5 levels
      const charges = Math.floor(lvl / 5);
      setMineSkipCharges(charges);
    } else {
      setMineSkipCharges(0);
    }

    setRows(diff.rows);
    setCols(diff.cols);
    setTiles(newTiles);
    setChicken({ r: startR, c: startC });
    setTimer(startTime);
    setTimerMax(startTime);
    timerVal.current = startTime;
    timerMaxVal.current = startTime;
    setActivePowerup(null);
    setPowerupTimer(0);
    setHasShield(false);
    setDoubleScore(false);
    setMagnetActive(false);
    setCombo(0);
    setComboMultiplier(1);
    setLastMoveTime(0);
    setVisitedTiles([{ r: startR, c: startC }]);
    setRevealAllActive(false);
    setSlowMoActive(false);
    slowMoRef.current = false;
    setShowConfetti(false);
    setObstacle(null);
    setChickenAnim('idle');
    levelRef.current = lvl;
    gamePhaseRef.current = 'playing';
    setGamePhase('playing');
  }, []);

  useEffect(() => {
    initLevel(startLevel);
    audio.startBackground();
  }, []);

  // Timer drain
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (pauseRef.current) return;
      if (gamePhaseRef.current !== 'playing') return;
      const diff = diffRef.current;
      const drainRate = diff ? diff.timerSpeed : 1;
      const slowFactor = slowMoRef.current ? 0.5 : 1;
      const speedFactor = modifiers.includes('speed') ? 1.5 : 1;
      const drain = (drainRate * slowFactor * speedFactor) / 10; // per 100ms tick
      timerVal.current = Math.max(0, timerVal.current - drain);
      setTimer(timerVal.current);

      if (timerVal.current <= 0) {
        gamePhaseRef.current = 'gameover';
        setGamePhase('gameover');
        clearInterval(timerRef.current);
        audio.gameOver();
        triggerGameOver('timeout');
      } else if (timerVal.current <= 5 && Math.random() < 0.3) {
        audio.timerLow();
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [gamePhase]);

  // Random obstacles
  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const diff = diffRef.current;
    if (!diff || diff.obstacleFreq === 0) return;

    const scheduleObstacle = () => {
      const delay = (12 + Math.random() * 15) * 1000 / diff.obstacleFreq;
      obstacleTimerRef.current = setTimeout(() => {
        if (gamePhaseRef.current !== 'playing') return;
        const types = ['thief', 'wind', 'scramble'];
        const type = types[Math.floor(Math.random() * types.length)];
        triggerObstacle(type);
        scheduleObstacle();
      }, delay);
    };
    scheduleObstacle();
    return () => clearTimeout(obstacleTimerRef.current);
  }, [gamePhase, level]);

  const triggerObstacle = useCallback((type) => {
    setObstacle(type);
    if (type === 'thief') {
      audio.thiefFox();
      setActivePowerup(null);
      setHasShield(false);
      setDoubleScore(false);
      setSlowMoActive(false);
      slowMoRef.current = false;
    } else if (type === 'wind') {
      audio.windGust();
      setChicken(prev => {
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        const diff = diffRef.current;
        const newR = Math.max(0, Math.min((diff?.rows || 6) - 1, prev.r + dir[0]));
        const newC = Math.max(0, Math.min((diff?.cols || 8) - 1, prev.c + dir[1]));
        // Reveal that tile
        setTiles(ts => ts.map(t => {
          if (t.r === newR && t.c === newC && t.state === 'hidden') {
            return { ...t, state: t.isMine ? 'mine' : 'revealed' };
          }
          return t;
        }));
        return { r: newR, c: newC };
      });
    } else if (type === 'scramble') {
      audio.obstacleScramble();
      setTiles(ts => ts.map(t => {
        if (t.state === 'revealed' && !t.isStart) {
          return { ...t, state: 'hidden' };
        }
        return t;
      }));
    }
    setTimeout(() => setObstacle(null), 2500);
  }, []);

  const triggerGameOver = (reason) => {
    clearInterval(timerRef.current);
    clearTimeout(obstacleTimerRef.current);
    gamePhaseRef.current = 'gameover';
    setGamePhase('gameover');
    setChickenAnim('explode');
    setTimeout(() => {
      onGameOver({ level: levelRef.current, seeds: levelSeeds });
    }, 900);
  };

  const isAdjacent = (tile, pos) => {
    const dr = Math.abs(tile.r - pos.r);
    const dc = Math.abs(tile.c - pos.c);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  };

  const handleTileStep = useCallback((tile) => {
    if (frozen) return;
    if (gamePhase !== 'playing') return;
    if (!isAdjacent(tile, chicken)) return;
    if (tile.state === 'checkpoint') {
      // Level complete!
      handleLevelComplete();
      return;
    }
    if (tile.state === 'revealed') {
      setChicken({ r: tile.r, c: tile.c });
      setVisitedTiles(prev => [...prev, { r: tile.r, c: tile.c }]);
      setChickenAnim('walk');
      setTimeout(() => setChickenAnim('idle'), 300);
      return;
    }
    if (tile.state === 'peeked') {
      if (tile.isMine) {
        handleMineHit(tile);
      } else {
        setChicken({ r: tile.r, c: tile.c });
        setVisitedTiles(prev => [...prev, { r: tile.r, c: tile.c }]);
        setChickenAnim('walk');
        setTimeout(() => setChickenAnim('idle'), 300);
      }
      return;
    }
    if (tile.state !== 'hidden') return;

    // Reveal tile
    if (tile.isMine) {
      if (tile.isFakeSafe) {
        audio.fakeMinePop();
      }
      // Check shield
      if (hasShield) {
        setHasShield(false);
        setActivePowerup(null);
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
        setChicken({ r: tile.r, c: tile.c });
        setChickenAnim('shield');
        setTimeout(() => setChickenAnim('idle'), 600);
        return;
      }
      setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'mine' } : t));
      handleMineHit(tile);
    } else {
      setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed' } : t));
      audio.safeTap();
      setChicken({ r: tile.r, c: tile.c });
      setVisitedTiles(prev => [...prev, { r: tile.r, c: tile.c }]);
      setChickenAnim('walk');
      setTimeout(() => setChickenAnim('idle'), 300);

      // --- COMBO LOGIC ---
      const now = Date.now();
      const timeDiff = now - lastMoveTime;
      let newCombo = 0;
      if (timeDiff < 1500) { // 1.5 second window
        newCombo = combo + 1;
      } else {
        newCombo = 1;
      }
      setCombo(newCombo);
      setLastMoveTime(now);

      // --- PET BONUSES ---
      const pet = PETS.find(p => p.id === equippedPetId);
      if (pet?.bonus === 'reveal_bonus' && Math.random() < pet.bonusVal) {
        setTiles(ts => ts.map(t => {
          if (isAdjacent(t, { r: tile.r, c: tile.c }) && t.state === 'hidden' && !t.isMine) {
            return { ...t, state: 'revealed' };
          }
          return t;
        }));
      }

      let mult = 1;
      if (newCombo >= 10) mult = 2;
      else if (newCombo >= 6) mult = 1.5;
      else if (newCombo >= 3) mult = 1.2;
      setComboMultiplier(mult);

      // --- MAGNET LOGIC ---
      if (magnetActive) {
        let attractedSeeds = 0;
        let powerupsToCollect = [];
        
        setTiles(ts => ts.map(t => {
          if (isAdjacent(t, { r: tile.r, c: tile.c })) {
            if (t.hasSeed) {
              attractedSeeds++;
              return { ...t, hasSeed: false, state: 'revealed' };
            }
            if (t.powerup && t.state === 'hidden') {
              powerupsToCollect.push(t.powerup);
              return { ...t, powerup: null, state: 'revealed' };
            }
          }
          return t;
        }));

        if (attractedSeeds > 0) {
          setSeeds(s => s + attractedSeeds);
        }
        powerupsToCollect.forEach(p => collectPowerup(p));
      }

      // Collect powerup on current tile
      if (tile.powerup) {
        collectPowerup(tile.powerup);
      }
      // Collect seed on current tile
      if (tile.hasSeed) {
        const pet = PETS.find(p => p.id === equippedPetId);
        let amt = 1;
        if (pet?.bonus === 'seed_bonus' && Math.random() < 0.2) amt += 1;
        setSeeds(s => s + amt);
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, hasSeed: false } : t));
      }
    }
  }, [gamePhase, chicken, hasShield, tiles]);

  const handleMineHit = (tile) => {
    if (mineSkipCharges > 0) {
      setMineSkipCharges(prev => prev - 1);
      audio.powerupCollect(); // reuse sound for skip
      setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
      setChicken({ r: tile.r, c: tile.c });
      setChickenAnim('shield');
      setTimeout(() => setChickenAnim('idle'), 600);
      return;
    }

    setShaking(true);
    setChickenAnim('explode');
    setCombo(0);
    setComboMultiplier(1);
    audio.mineExplosion();
    setTimeout(() => setShaking(false), 600);
    gamePhaseRef.current = 'gameover';
    setGamePhase('gameover');
    clearInterval(timerRef.current);
    clearTimeout(obstacleTimerRef.current);
    setTimeout(() => {
      onGameOver({ level: levelRef.current, seeds: levelSeeds });
    }, 900);
  };

  const handleLongPress = useCallback((tile) => {
    if (frozen) return;
    if (gamePhase !== 'playing') return;
    if (!isAdjacent(tile, chicken)) return;
    if (tile.state !== 'hidden') return;

    // Cost 1 second
    timerVal.current = Math.max(0, timerVal.current - 1);
    setTimer(timerVal.current);
    audio.peek();
    setCombo(0);
    setComboMultiplier(1);

    setTiles(ts => ts.map(t => {
      if (t.r === tile.r && t.c === tile.c) {
        return { ...t, state: 'peeked' };
      }
      return t;
    }));

    // Un-peek after 3 seconds if mine
    if (tile.isMine) {
      setTimeout(() => {
        setTiles(ts => ts.map(t => {
          if (t.r === tile.r && t.c === tile.c && t.state === 'peeked') {
            return { ...t, state: 'hidden' };
          }
          return t;
        }));
      }, 3000);
    }
  }, [gamePhase, chicken]);

  const collectPowerup = (type) => {
    audio.powerupCollect();
    if (type === 'shield') {
      setHasShield(true);
      setActivePowerup('shield');
    } else if (type === 'slowmo') {
      setActivePowerup('slowmo');
      setSlowMoActive(true);
      slowMoRef.current = true;
      setPowerupTimer(8);
      let t = 8;
      const interval = setInterval(() => {
        t -= 1;
        setPowerupTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          setSlowMoActive(false);
          slowMoRef.current = false;
          setActivePowerup(null);
        }
      }, 1000);
    } else if (type === 'reveal') {
      setActivePowerup('reveal');
      setRevealAllActive(true);
      setTiles(ts => ts.map(t => {
        if (t.state === 'hidden' && t.isMine) {
          return { ...t, state: 'peeked' };
        }
        return t;
      }));
      setTimeout(() => {
        setRevealAllActive(false);
        setActivePowerup(null);
        setTiles(ts => ts.map(t => {
          if (t.state === 'peeked' && t.isMine) {
            return { ...t, state: 'hidden' };
          }
          return t;
        }));
      }, 2000);
    } else if (type === 'doublescore') {
      setDoubleScore(true);
      setActivePowerup('doublescore');
    } else if (type === 'magnet') {
      setMagnetActive(true);
      setActivePowerup('magnet');
      setPowerupTimer(12);
      let t = 12;
      const interval = setInterval(() => {
        t -= 1;
        setPowerupTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          setMagnetActive(false);
          setActivePowerup(null);
        }
      }, 1000);
    }
  };

  const handleLevelComplete = () => {
    clearInterval(timerRef.current);
    clearTimeout(obstacleTimerRef.current);
    audio.levelComplete();
    setShowConfetti(true);
    setChickenAnim('celebrate');

    const lvl = levelRef.current;
    const baseSeeds = lvl * 10;
    const timeLeft = Math.floor(timerVal.current);
    const timeBonus = timeLeft * 2;
    
    // --- PET BONUSES ---
    const pet = PETS.find(p => p.id === equippedPetId);
    let seedMultiplier = 1;
    if (pet?.bonus === 'seed_bonus') seedMultiplier += pet.bonusVal;

    const earned = Math.floor((baseSeeds + timeBonus) * (doubleScore ? 2 : 1) * comboMultiplier * seedMultiplier);

    // Achievement tracking
    gameStore.setAchievement('firstSteps');
    gameStore.incrementAchievement('survivor', 1);
    gameStore.incrementAchievement('roadRunner', 1);
    if (lvl >= 10) gameStore.setAchievement('mineMaster');
    if (lvl >= 20) gameStore.setAchievement('deepDigger');
    if (timeLeft >= (timerMaxVal.current - 15)) gameStore.setAchievement('speedyClucker');

    setLevelSeeds(earned);
    setLevelTimeLeft(timeLeft);
    setSeeds(gameStore.getSeeds());
    gamePhaseRef.current = 'levelcomplete';
    setGamePhase('levelcomplete');

    // Inform App.jsx about the result
    onLevelComplete({ level: lvl, seeds: earned, timeLeft });
  };

  // Swipe gesture
  const handleTouchStartGrid = (e) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  };

  const handleTouchEndGrid = (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const minSwipe = 40;
    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    let dir = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? [0, 1] : [0, -1];
    } else {
      dir = dy > 0 ? [1, 0] : [-1, 0];
    }

    // Find nearest tile in direction
    const cur = chicken;
    let target = null;
    for (let step = 1; step <= Math.max(rows, cols); step++) {
      const nr = cur.r + dir[0] * step;
      const nc = cur.c + dir[1] * step;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
      const t2 = tiles.find(t => t.r === nr && t.c === nc);
      if (t2 && t2.state !== 'revealed') {
        target = t2;
        break;
      }
    }
    // Swipe only moves one tile at a time (to adjacent)
    if (dir) {
      const nr = cur.r + dir[0];
      const nc = cur.c + dir[1];
      const adjTile = tiles.find(t => t.r === nr && t.c === nc);
      if (adjTile) handleTileStep(adjTile);
    }
    setTouchStart(null);
  };

  // Grid dimensions
  const gridContainerRef = useRef(null);
  const [cellSize, setCellSize] = useState({ w: 44, h: 44 });

  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gridW = vw - 16;
      const gridH = vh * 0.65;
      const cw = Math.floor(gridW / cols);
      const ch = Math.floor(gridH / rows);
      setCellSize({ w: Math.max(cw, 44), h: Math.max(ch, 44) });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [rows, cols]);

  const timerPct = (timer / timerMax) * 100;
  const timerColor = timerPct > 50 ? '#4CAF50' : timerPct > 25 ? '#FF9800' : '#F44336';

  const bgColors = [
    '#1a237e', '#1b5e20', '#4a148c', '#b71c1c', '#006064',
    '#e65100', '#1a237e', '#33691e', '#880e4f', '#01579b',
  ];
  const bgColor = bgColors[Math.floor((level - 1) / 10) % bgColors.length];
  const bgColor2 = bgColors[(Math.floor((level - 1) / 10) + 1) % bgColors.length];

  return (
    <div
      className={`gameplay-screen ${shaking ? 'screen-shake' : ''}`}
      style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor2})` }}
      onTouchStart={handleTouchStartGrid}
      onTouchEnd={handleTouchEndGrid}
    >
      <TopBar 
        title={isDaily ? "DAILY" : `LEVEL ${level}`} 
        onBack={onBack} 
        showSeeds={false} 
      />

      {showConfetti && <Confetti />}
      <ObstacleOverlay obstacle={obstacle} onDone={() => setObstacle(null)} />

      {/* HUD v3 */}
      <div className="hud-v3">
        {/* Top row: Level | Timer | Seeds */}
        <div className="hud-row hud-row--top">
          <div className="hud-level-badge">Lv.{level}</div>

          <div className="hud-timer-wrap">
            <div className={`hud-timer-bar ${slowMoActive ? 'hud-timer--slow' : ''}`}>
              <div
                className="hud-timer-fill"
                style={{ width: `${timerPct}%`, background: timerColor }}
              />
              <span className="hud-timer-text">{Math.ceil(timer)}s</span>
            </div>
          </div>

          <div className="hud-seeds-chip">
            <span className="hud-seeds-icon">🌾</span>
            <span className="hud-seeds-val">{seeds}</span>
          </div>
        </div>

        {/* Bottom row: Powerup slot | Status badges */}
        <div className="hud-row hud-row--bottom">
          <div className="hud-powerup-slot">
            {activePowerup ? (
              <div className="hud-powerup-active">
                <span>{getPowerupIcon(activePowerup)}</span>
                {powerupTimer > 0 && <span className="hud-powerup-timer">{powerupTimer}s</span>}
              </div>
            ) : (
              <div className="hud-powerup-empty">—</div>
            )}
          </div>

          <div className="hud-status-row">
            {combo > 1 && (
              <div className="hud-badge hud-badge--combo">
                {combo}x <span className="hud-badge-sub">COMBO</span>
              </div>
            )}
            {hasShield    && <div className="hud-badge hud-badge--shield">🛡️</div>}
            {doubleScore  && <div className="hud-badge hud-badge--double">⭐ 2X</div>}
            {slowMoActive && <div className="hud-badge hud-badge--slow">⏱️</div>}
            {mineSkipCharges > 0 && <div className="hud-badge hud-badge--skip">👟 {mineSkipCharges}</div>}
            {modifiers.includes('fog')   && <div className="hud-badge hud-badge--fog">🌫️ FOG</div>}
            {modifiers.includes('speed') && <div className="hud-badge hud-badge--speed">⚡</div>}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid-container" ref={gridContainerRef}>
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize.w}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize.h}px)`,
            gap: '2px',
            position: 'relative',
          }}
        >
          {tiles.map(tile => {
            const dr = Math.abs(tile.r - chicken.r);
            const dc = Math.abs(tile.c - chicken.c);
            const isFoggy = modifiers.includes('fog') && (dr > 1 || dc > 1);
            
            return (
              <Tile
                key={`${tile.r}-${tile.c}`}
                tile={tile}
                tileStyle={equippedTile}
                isAdjacent={isAdjacent(tile, chicken)}
                onTap={handleTileStep}
                onLongPress={handleLongPress}
                cellW={cellSize.w}
                cellH={cellSize.h}
                isFoggy={isFoggy}
              />
            );
          })}
        </div>

        {/* Trail overlay */}
        <div
          className="trail-overlay"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          {equippedTrail !== 'none' && visitedTiles.slice(-15).map((pos, i) => {
            const centerX = (pos.c * (cellSize.w + 2) + cellSize.w / 2) / (cols * (cellSize.w + 2)) * 100;
            const centerY = (pos.r * (cellSize.h + 2) + cellSize.h / 2) / (rows * (cellSize.h + 2)) * 100;
            
            // Randomize dot count per tile (3-7) using a stable seed based on tile position
            const dotSeed = pos.r * 100 + pos.c;
            const numDots = 3 + (dotSeed % 5);
            
            return Array.from({ length: numDots }).map((_, j) => {
              // Stable deterministic pseudo-random offsets
              const pSeed = dotSeed + j * 37;
              // Random spread relative to cell size, slightly shifted "below" (positive Y)
              const offsetX = (Math.sin(pSeed) * 5); 
              const offsetY = (Math.cos(pSeed * 0.8) * 4) + 3; 
              
              return (
                <TrailParticle
                  key={`trail-${i}-${j}-${pos.r}-${pos.c}`}
                  x={centerX + offsetX} 
                  y={centerY + offsetY}
                  trailId={equippedTrail}
                  index={i}
                  particleIndex={j}
                  total={visitedTiles.slice(-15).length}
                />
              );
            });
          })}
        </div>

        {/* Chicken overlay */}
        <div
          className="chicken-overlay"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
          }}
        >
          <Chicken
            skin={equippedSkin}
            trail={equippedTrail}
            animState={chickenAnim}
            position={chicken}
            gridCols={cols}
            gridRows={rows}
            cellW={cellSize.w}
            cellH={cellSize.h}
            isMagnetActive={magnetActive}
          />
          {equippedPetId && (
            <Pet
              petId={equippedPetId}
              position={chicken}
              cellW={cellSize.w}
              cellH={cellSize.h}
            />
          )}
        </div>
      </div>

      {/* Level complete — handled by LevelClearModal overlay in App.jsx */}

      {/* Hint */}
      {level === 1 && gamePhase === 'playing' && (
        <div className="hint-bar">Tap adjacent tile to move • Long press to peek (-1s)</div>
      )}

      {/* Overlays moved from App.jsx */}
      {gamePhase === 'gameover' && (
        <GameOverModal
          level={level}
          seeds={levelSeeds}
          skinId={equippedSkin}
          onRetry={() => initLevel(level)}
          onHome={onBack}
        />
      )}

      {gamePhase === 'levelcomplete' && (
        <LevelClearModal
          level={level}
          seeds={levelSeeds}
          timeLeft={levelTimeLeft}
          skinId={equippedSkin}
          onReplay={() => initLevel(level)}
          onNext={() => {
            const next = level + 1;
            setLevel(next);
            initLevel(next);
          }}
        />
      )}
    </div>
  );
}
