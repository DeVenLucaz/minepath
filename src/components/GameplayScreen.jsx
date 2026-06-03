import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { CHICKEN_SKINS, TILE_STYLES, TRAIL_EFFECTS } from '../data/skins';
import { PETS } from '../data/pets';
import { BIOMES } from '../data/biomes';
import { SKILLS } from '../data/skills';
import ChickenSVG from './ChickenSVG';
import PetSVG from './PetSVG';
import TopBar from './TopBar';
import GameOverModal from './GameOverModal';
import LevelClearModal from './LevelClearModal';
import HelpModal from './HelpModal';

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
function generateGrid(rows, cols, mineRate, level, isDaily, biome) {
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
  
  if (biome.hazard === 'fog') powerupTypes.push('light');

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
        state: 'hidden',
        powerup: null,
        hasSeed: false,
        isFakeSafe: false,
        isBurning: false,
      });
    }
  }

  const candidates = tiles.filter(t => !t.isCheckpoint && !t.isStart);
  const shuffled = [...candidates].sort(() => sRandom() - 0.5);
  const mineCount = Math.floor((rows * cols - 2) * mineRate);
  
  shuffled.slice(0, mineCount).forEach(t => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile && !tile.isCheckpoint && !tile.isStart) {
      tile.isMine = true;
      tile.isSafe = false;
    }
  });

  const safeTiles = tiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart);
  safeTiles.slice(0, fakeSafeCount).forEach(t => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile) {
      tile.isFakeSafe = true;
      tile.isMine = true;
      tile.isSafe = false;
    }
  });

  const safeTilesForPowerup = tiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart);
  safeTilesForPowerup.sort(() => sRandom() - 0.5).slice(0, powerupCount).forEach((t, i) => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile) tile.powerup = powerupTypes[i % powerupTypes.length];
  });

  const remainingSafe = tiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart && !t.powerup);
  remainingSafe.sort(() => sRandom() - 0.5).slice(0, seedCount).forEach(t => {
    const tile = tiles.find(x => x.r === t.r && x.c === t.c);
    if (tile) tile.hasSeed = true;
  });

  const checkpoint = tiles.find(t => t.isCheckpoint);
  if (checkpoint) checkpoint.state = 'checkpoint';

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
  
  const ageFactor = index / (total || 1); 
  const opacity  = Math.max(0.1, ageFactor * 0.8);
  const baseSize = (isFlower || isMusic) ? 14 : isBubble ? 12 : 8;
  const size     = Math.max(4, baseSize + ageFactor * 10);

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

// ─── CHICKEN COMPONENT ─────────────────────────
function Chicken({ skin, animState, position, cellW, cellH, isMagnetActive, skinSkillAnim }) {
  const pixelX = position.c * (cellW + 2) + cellW / 2;
  const pixelY = position.r * (cellH + 2) + cellH / 2;
  
  const [trail, setTrail] = useState(null);
  const prevPosRef = useRef(position);

  useEffect(() => {
    if (prevPosRef.current.r !== position.r || prevPosRef.current.c !== position.c) {
      setTrail({ r: prevPosRef.current.r, c: prevPosRef.current.c, key: Date.now() });
      prevPosRef.current = position;
    }
  }, [position]);

  const mood = animState === 'explode' || animState === 'death' ? 'sad' : animState === 'celebrate' ? 'happy' : 'normal';
  const size = Math.min(cellW, cellH) * 1.15;
  
  let animClass = '';
  if (animState === 'normal' || animState === 'idle') animClass = 'anim-idle-breathe';
  else if (animState === 'explode' || animState === 'death') animClass = 'anim-death';
  else if (animState === 'celebrate') animClass = 'anim-celebrate';
  else if (animState === 'moving' || animState === 'walk') animClass = 'anim-moving';

  const skillClass = skinSkillAnim ? `anim-${skinSkillAnim.replace(/_/g, '-')}` : '';
  const skinClass = `skin-${skin}`;

  return (
    <>
      {skin === 'space' && trail && (
        <div key={trail.key} className="space-star-trail" style={{ 
          left: trail.c * (cellW + 2) + cellW / 2,
          top: trail.r * (cellH + 2) + cellH / 2,
          transform: 'translate(-50%, -50%)'
        }}>✦</div>
      )}
      {skin === 'ninja' && trail && (
        <div key={trail.key} className="ninja-ghost-trail" style={{ 
          left: trail.c * (cellW + 2) + cellW / 2,
          top: trail.r * (cellH + 2) + cellH / 2,
          transform: 'translate(-50%, -50%)'
        }}>
          <ChickenSVG skinId={skin} mood="normal" size={size} />
        </div>
      )}
      <div
        className={`chicken-entity ${skinClass} ${skillClass}`}
        style={{
          position: 'absolute',
          left: pixelX,
          top: pixelY,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          transition: 'left 0.18s ease, top 0.18s ease',
          pointerEvents: 'none',
          filter: (animState === 'explode' || animState === 'death') ? 'drop-shadow(0 0 8px #FF4500)' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
        }}
      >
        <ChickenSVG skinId={skin} mood={mood} size={size} animClass={animClass}/>
        {animState === 'shield' && <div className="shield-bubble"/>}
        {isMagnetActive && <div className="magnet-pulse"/>}
        
        {skin === 'royal' && (
          <>
            <div className="royal-sparkle s1">✦</div>
            <div className="royal-sparkle s2">✦</div>
            <div className="royal-sparkle s3">✦</div>
          </>
        )}
        {skinSkillAnim === 'ninja_shadow_step' && <div className="ninja-smoke">💨</div>}
        {skinSkillAnim === 'ghost_phase_through' && <div className="ghost-ripple" />}
        {skinSkillAnim === 'royal_decree' && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="royal-coin" style={{ 
            '--dx': `${Math.cos(i * 72 * Math.PI / 180) * 40}px`,
            '--dy': `${Math.sin(i * 72 * Math.PI / 180) * 40}px`
          }}>🪙</div>
        ))}
      </div>
    </>
  );
}

// ─── PET COMPONENT ──────────────────────────────────────────────
function Pet({ petId, position, cellW, cellH, animClass }) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return null;

  const centerX = position.c * (cellW + 2) + cellW / 2;
  const centerY = position.r * (cellH + 2) + cellH / 2;
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
        zIndex: 19,
        transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <PetSVG petId={petId} size={Math.min(cellW, cellH) * 0.8} animClass={animClass} />
    </div>
  );
}

// ─── TILE COMPONENT ──────────────────────────────────────────────
function Tile({ tile, tileStyle, isAdjacent, onTap, onLongPress, cellW, cellH, isFoggy, showShadow }) {
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
    extraClass = `tile-hidden ${tile.powerup ? 'tile-powerup-glow' : ''} ${isAdjacent ? 'tile-adjacent tile-adjacent-pulse' : ''} ${isFoggy ? 'tile-foggy' : ''} ${tile.isMine ? 'tile-mine-pulse' : ''}`;
  } else if (tile.state === 'revealed') {
    bg = tile.isBurning ? 'linear-gradient(to bottom, #FF4500, #B71C1C)' : styleData.safeColor;
    content = tile.isBurning ? '🔥' : (tile.powerup ? getPowerupIcon(tile.powerup) : (tile.hasSeed ? '🌾' : '✓'));
    extraClass = `tile-revealed tile-flip-improve ${tile.isBurning ? 'tile-burning' : ''}`;
  } else if (tile.state === 'mine') {
    bg = styleData.mineColor;
    content = '💀';
    extraClass = 'tile-mine tile-shake';
  } else if (tile.state === 'peeked') {
    bg = tile.isMine ? '#ff6b6b' : '#90EE90';
    content = tile.isMine ? '💣' : '✓';
    extraClass = 'tile-peeked tile-flip-improve';
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
        <div className="powerup-indicator tile-powerup-float" />
      )}
      {showShadow && (
        <div style={{ 
          position: 'absolute', 
          inset: '4px', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '50%',
          filter: 'blur(4px)',
          pointerEvents: 'none'
        }} />
      )}
      {tile.isBurning && <div className="fire-overlay" />}
    </div>
  );
}

function getPowerupIcon(type) {
  const icons = { shield: '🛡️', slowmo: '⏱️', reveal: '👁️', doublescore: '⭐', magnet: '🧲', light: '🕯️', golden_seed: '📀' };
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
  const pieces = Array.from({ length: 40 }, (_, i) => {
    const type = Math.random() < 0.3 ? 'seed' : Math.random() < 0.6 ? 'star' : 'square';
    const colors = ['#FFD700', '#4CAF50', '#2196F3', '#F44336', '#9C27B0'];
    return {
      id: i,
      type,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1.5,
      size: type === 'square' ? (6 + Math.random() * 8) : (14 + Math.random() * 6),
      rot: Math.random() * 360,
    };
  });
  return (
    <div className="confetti-container" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-20px',
          color: p.color,
          background: p.type === 'square' ? p.color : 'none',
          animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
          width: p.size,
          height: p.size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${p.size}px`,
          transform: `rotate(${p.rot}deg)`,
        }}>
          {p.type === 'seed' ? '🌾' : p.type === 'star' ? '✦' : ''}
        </div>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
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
  const [shieldHits, setShieldHits] = useState(1); 
  const [chickenAnim, setChickenAnim] = useState('idle');
  const [shaking, setShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [obstacle, setObstacle] = useState(null);
  const [doubleScore, setDoubleScore] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [gamePhase, setGamePhase] = useState('playing'); 
  const [visitedTiles, setVisitedTiles] = useState([]); 
  const [showHelp, setShowHelp] = useState(false);
  const [levelSeeds, setLevelSeeds] = useState(0);
  const [levelTimeLeft, setLevelTimeLeft] = useState(0);
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [revealAllActive, setRevealAllActive] = useState(false);
  const [slowMoActive, setSlowMoActive] = useState(false);
  const [modifiers, setModifiers] = useState([]); 
  const [biome, setBiome] = useState(BIOMES[0]);
  const [fogRadius, setFogRadius] = useState(1); 
  const [equippedPetId, setEquippedPetId] = useState(gameStore.getEquippedPet());
  const [touchStart, setTouchStart] = useState(null);
  const [mineSkipCharges, setMineSkipCharges] = useState(0);
  const [skinSkillAnim, setSkinSkillAnim] = useState(null);
  const [petAnim, setPetAnim] = useState(null);
  const [deathFlash, setDeathFlash] = useState(false);

  const triggerSkinSkill = useCallback((id, duration) => {
    setSkinSkillAnim(id);
    setTimeout(() => setSkinSkillAnim(null), duration);
  }, []);

  const triggerPetAnim = useCallback((className, duration) => {
    setPetAnim(className);
    setTimeout(() => setPetAnim(null), duration);
  }, []);

  // New Skill States
  const [warpStepUsed, setWarpStepUsed] = useState(false);
  const [possessionUsed, setPossessionUsed] = useState(false);
  const [peekCount, setPeekCount] = useState(0);
  const [shadowStepUsed, setShadowStepUsed] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasGoldenSeed, setHasGoldenSeed] = useState(false);

  const timerRef = useRef(null);
  const powerupTimerRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const fireTimerRef = useRef(null);
  const chickenAnimTimerRef = useRef(null);
  const blastResistanceUsed = useRef(false);
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
  
  const unlockedSkills = playerStore.getSkills();
  const has = (id) => unlockedSkills.includes(id);
  const hasSkinSkill = (id, skinId) => unlockedSkills.includes(id) && equippedSkin === skinId;

  const initLevel = useCallback((lvl) => {
    const diff = getDifficultyConfig(lvl);
    diffRef.current = diff;

    const currentBiome = BIOMES.find(b => b.tileStyle === equippedTile) || BIOMES[0];
    setBiome(currentBiome);

    const activeMods = [];
    if (currentBiome.hazard === 'fog') activeMods.push('fog');
    setModifiers(activeMods);
    setFogRadius(1);

    const newTiles = generateGrid(diff.rows, diff.cols, diff.mineRate, lvl, isDaily, currentBiome);

    // --- SKILL: Golden Touch ---
    if (has('golden_touch') && Math.random() < 0.05) {
      const safeTiles = newTiles.filter(t => !t.isMine && !t.isCheckpoint && !t.isStart && !t.powerup);
      if (safeTiles.length > 0) {
        const target = safeTiles[Math.floor(Math.random() * safeTiles.length)];
        target.powerup = 'golden_seed';
      }
    }

    const startR = diff.rows - 1, startC = 0;
    setEquippedPetId(gameStore.getEquippedPet());

    const buildings = gameStore.getBuildings();
    const pet = PETS.find(p => p.id === gameStore.getEquippedPet());
    const playgroundLvl = buildings.playground || 0;
    const abilityPower = 1 + (playgroundLvl * 0.25);

    let startTime = diff.timerMax;
    if (pet?.bonus === 'time_bonus') {
      startTime += (pet.bonusVal * abilityPower);
      triggerPetAnim('pet-bonus-bluey', 300);
    }

    if (playgroundLvl > 0 && Math.random() < (0.1 * playgroundLvl)) {
      const startPowerups = ['shield', 'slowmo', 'magnet'];
      const randomPower = startPowerups[Math.floor(Math.random() * startPowerups.length)];
      setTimeout(() => collectPowerup(randomPower), 500);
      if (equippedPetId === 'sparky') triggerPetAnim('pet-bonus-sparky', 400);
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
    setShieldHits(1);
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
    blastResistanceUsed.current = false;
    setShadowStepUsed(false);
    setHasGoldenSeed(false);

    if (currentBiome.hazard === 'fire') {
      clearInterval(fireTimerRef.current);
      fireTimerRef.current = setInterval(() => {
        if (gamePhaseRef.current !== 'playing' || pauseRef.current) return;
        setTiles(ts => {
          const newTs = [...ts];
          const revealedSafe = newTs.filter(t => t.state === 'revealed' && !t.isMine && !t.isStart);
          if (revealedSafe.length > 0) {
            const target = revealedSafe[Math.floor(Math.random() * revealedSafe.length)];
            target.isBurning = true;
            audio.windGust();
            setTimeout(() => {
              setTiles(currentTs => currentTs.map(t => t.r === target.r && t.c === target.c ? { ...t, isBurning: false } : t));
            }, 3000);
          }
          return newTs;
        });
      }, 5000);
    } else {
      clearInterval(fireTimerRef.current);
    }
  }, []);

  useEffect(() => {
    initLevel(startLevel);
    audio.startBackground();
    setWarpStepUsed(false);
    setPossessionUsed(false);
    setPeekCount(0);
  }, []);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    clearInterval(timerRef.current);
    
    const buildings = gameStore.getBuildings();
    const nestBuff = 1 - (buildings.nest * 0.05);

    timerRef.current = setInterval(() => {
      if (pauseRef.current) return;
      if (gamePhaseRef.current !== 'playing') return;
      const diff = diffRef.current;
      const drainRate = diff ? diff.timerSpeed : 1;
      const slowFactor = slowMoRef.current ? 0.5 : 1;
      const speedFactor = modifiers.includes('speed') ? 1.5 : 1;
      const drain = (drainRate * slowFactor * speedFactor * nestBuff) / 10;
      timerVal.current = Math.max(0, timerVal.current - drain);
      setTimer(timerVal.current);

      if (timerVal.current <= 0) {
        if (hasSkinSkill('ghost_possession', 'ghost') && !possessionUsed) {
          setPossessionUsed(true);
          setIsInvincible(true);
          audio.powerupCollect();
          timerVal.current = 10;
          setTimer(10);
          setChickenAnim('shield');
          setTimeout(() => {
            setIsInvincible(false);
            setChickenAnim('idle');
          }, 1000);
          return;
        }

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
  }, [gamePhase, possessionUsed, unlockedSkills]);

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
    setChickenAnim('explode');
    setShaking(true);
    setDeathFlash(true);
    setTimeout(() => {
      setShaking(false);
      setDeathFlash(false);
    }, 400);
    
    setTimeout(() => {
      gamePhaseRef.current = 'gameover';
      setGamePhase('gameover');
      audio.gameOver();
      setTimeout(() => {
        onGameOver({ level: levelRef.current, seeds: levelSeeds });
      }, 300);
    }, 700);
  };

  const isAdjacent = (tile, pos) => {
    const dr = Math.abs(tile.r - pos.r);
    const dc = Math.abs(tile.c - pos.c);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  };

  const handleTileStep = useCallback((tile) => {
    if (frozen) return;
    if (gamePhase !== 'playing') return;

    if (tile.state === 'revealed' && !isAdjacent(tile, chicken)) {
      if (hasSkinSkill('space_warp_step', 'space') && !warpStepUsed) {
        setWarpStepUsed(true);
        audio.powerupCollect(); 
        moveChicken(tile.r, tile.c);
        return;
      }
    }

    if (!isAdjacent(tile, chicken)) return;

    if (tile.isBurning) {
      handleMineHit(tile, 'fire');
      return;
    }

    if (tile.state === 'checkpoint') {
      handleLevelComplete();
      return;
    }

    if (tile.state === 'revealed') {
      moveChicken(tile.r, tile.c);
      return;
    }

    if (tile.state === 'peeked') {
      if (tile.isMine) {
        handleMineHit(tile);
      } else {
        moveChicken(tile.r, tile.c);
      }
      return;
    }

    if (tile.state !== 'hidden') return;

    // --- SKILL: Shadow Step ---
    if (tile.state === 'hidden' && hasSkinSkill('ninja_shadow_step', 'ninja') && !shadowStepUsed) {
      setShadowStepUsed(true);
      if (tile.isMine) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, isMine: false, isSafe: true } : t));
        audio.safeTap();
        moveChicken(tile.r, tile.c);
        triggerSkinSkill('ninja_shadow_step', 500);
        return;
      }
    }

    if (tile.isMine) {
      if (tile.isFakeSafe) audio.fakeMinePop();
      
      if (hasShield) {
        const remainingHits = shieldHits - 1;
        setShieldHits(remainingHits);
        if (remainingHits <= 0) {
          setHasShield(false);
          setActivePowerup(null);
        }
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
        moveChicken(tile.r, tile.c);
        setChickenAnim('shield');
        setTimeout(() => setChickenAnim('idle'), 600);
        return;
      }

      if (hasSkinSkill('space_zero_gravity', 'space') && Math.random() < 0.15) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
        moveChicken(tile.r, tile.c);
        triggerSkinSkill('space_zero_gravity', 1000);
        return;
      }

      if (hasSkinSkill('ghost_phase_through', 'ghost') && Math.random() < 0.20) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
        moveChicken(tile.r, tile.c);
        triggerSkinSkill('ghost_phase_through', 500);
        return;
      }

      setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'mine' } : t));
      handleMineHit(tile);
    } else {
      setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed' } : t));
      audio.safeTap();
      moveChicken(tile.r, tile.c);

      const now = Date.now();
      const timeDiff = now - lastMoveTime;
      let newCombo = timeDiff < 1500 ? combo + 1 : 1;
      setCombo(newCombo);
      setLastMoveTime(now);

      // --- SKILL: Hazard Sense ---
      if (has('hazard_sense') && Math.random() < 0.1) {
        setTiles(ts => ts.map(t => {
          if (isAdjacent(t, { r: tile.r, c: tile.c }) && t.state === 'hidden' && t.isMine) {
            return { ...t, state: 'mine' };
          }
          return t;
        }));
      }

      const pet = PETS.find(p => p.id === equippedPetId);
      const buildings = gameStore.getBuildings();
      const playgroundLvl = buildings.playground || 0;
      const abilityPower = 1 + (playgroundLvl * 0.25);

      if (pet?.bonus === 'reveal_bonus' && Math.random() < (pet.bonusVal * abilityPower)) {
        if (equippedPetId === 'chick_ninja') triggerPetAnim('pet-bonus-shadow', 300);
        setTiles(ts => ts.map(t => {
          if (isAdjacent(t, { r: tile.r, c: tile.c }) && t.state === 'hidden' && !t.isMine) {
            return { ...t, state: 'revealed' };
          }
          return t;
        }));
      }

      let mult = newCombo >= 10 ? 2 : newCombo >= 6 ? 1.5 : newCombo >= 3 ? 1.2 : 1;
      setComboMultiplier(mult);

      if (magnetActive) {
        let attractedSeeds = 0;
        let powerupsToCollect = [];
        setTiles(ts => ts.map(t => {
          if (isAdjacent(t, { r: tile.r, c: tile.c })) {
            if (t.hasSeed) { attractedSeeds++; return { ...t, hasSeed: false, state: 'revealed' }; }
            if (t.powerup && t.state === 'hidden') { powerupsToCollect.push(t.powerup); return { ...t, powerup: null, state: 'revealed' }; }
          }
          return t;
        }));
        if (attractedSeeds > 0) setSeeds(s => s + attractedSeeds);
        powerupsToCollect.forEach(p => collectPowerup(p));
      }

      if (tile.powerup) collectPowerup(tile.powerup);
      if (tile.hasSeed) {
        const buildings = gameStore.getBuildings();
        const playgroundBuff = 1 + (buildings.playground * 0.2);
        let amt = 1;
        if (pet?.bonus === 'seed_bonus' && Math.random() < (0.2 * playgroundBuff)) {
          amt += 1;
          if (equippedPetId === 'chick_yellow') triggerPetAnim('pet-bonus-yeller', 400);
        }
        
        // --- SKILL: Seed Finder (handled per-seed too? user said "calculated on level complete") ---
        // Let's stick to level complete calculation as requested, but also keep this for now.
        // Actually I'll follow the "calculated on level complete" instruction specifically for the skill.
        // if (has('seed_finder')) amt = Math.ceil(amt * 1.2);
        
        setSeeds(s => s + amt);
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, hasSeed: false } : t));
      }

      if (biome.hazard === 'slip' && Math.random() < 0.4) {
        const dr = tile.r - chicken.r;
        const dc = tile.c - chicken.c;
        const nr = tile.r + dr;
        const nc = tile.c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const nextTile = tiles.find(t => t.r === nr && t.c === nc);
          if (nextTile) {
            setTimeout(() => handleTileStep(nextTile), 200);
          }
        }
      }
    }
  }, [gamePhase, chicken, hasShield, shieldHits, tiles, biome, unlockedSkills, warpStepUsed, shadowStepUsed]);

  const moveChicken = (r, c) => {
    setChicken({ r, c });
    setVisitedTiles(prev => [...prev, { r, c }]);
    setChickenAnim('moving');
    if (chickenAnimTimerRef.current) clearTimeout(chickenAnimTimerRef.current);
    chickenAnimTimerRef.current = setTimeout(() => {
      if (gamePhaseRef.current === 'playing') {
        setChickenAnim('idle');
      }
    }, 250);

    if (hasSkinSkill('ghost_haunting', 'ghost')) {
      setTiles(ts => ts.map(t => {
        if (isAdjacent(t, { r, c }) && t.state === 'hidden' && t.isMine) {
          return { ...t, state: 'peeked' };
        }
        return t;
      }));
    }
  };

  const handleMineHit = (tile, cause = 'mine') => {
    if (isInvincible) return;

    // --- SKILL: Tough Feathers ---
    if (has('tough_feathers') && Math.random() < 0.05) {
      audio.powerupCollect();
      if (tile) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false, isBurning: false } : t));
        moveChicken(tile.r, tile.c);
      }
      setChickenAnim('shield');
      setTimeout(() => setChickenAnim('idle'), 600);
      return;
    }

    // --- SKILL: Blast Resistance ---
    if (has('blast_resistance') && !blastResistanceUsed.current && cause === 'mine') {
      blastResistanceUsed.current = true;
      timerVal.current = timerVal.current * 0.5;
      setTimer(timerVal.current);
      audio.mineExplosion();
      if (tile) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
        moveChicken(tile.r, tile.c);
      }
      return;
    }

    if (hasSkinSkill('ghost_possession', 'ghost') && !possessionUsed && (cause === 'mine' || cause === 'fire')) {
      setPossessionUsed(true);
      setIsInvincible(true);
      audio.powerupCollect(); 
      if (tile) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false, isBurning: false } : t));
        moveChicken(tile.r, tile.c);
      }
      setChickenAnim('shield');
      setTimeout(() => {
        setIsInvincible(false);
        setChickenAnim('idle');
      }, 1000);
      return;
    }

    if (mineSkipCharges > 0 && cause === 'mine') {
      setMineSkipCharges(prev => prev - 1);
      if (equippedPetId === 'bunn_bunn') triggerPetAnim('pet-bonus-bunn', 500);
      audio.powerupCollect(); 
      setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
      moveChicken(tile.r, tile.c);
      setChickenAnim('shield');
      setTimeout(() => setChickenAnim('idle'), 600);
      return;
    }

    setShaking(true);
    setDeathFlash(true);
    setChickenAnim('explode');
    setCombo(0);
    setComboMultiplier(1);
    audio.mineExplosion();
    setTimeout(() => {
      setShaking(false);
      setDeathFlash(false);
    }, 400);
    
    clearInterval(timerRef.current);
    clearInterval(fireTimerRef.current);
    clearTimeout(obstacleTimerRef.current);

    setTimeout(() => {
      gamePhaseRef.current = 'gameover';
      setGamePhase('gameover');
      setTimeout(() => {
        onGameOver({ level: levelRef.current, seeds: levelSeeds });
      }, 300);
    }, 700);
  };

  const handleLongPress = useCallback((tile) => {
    if (frozen) return;
    if (gamePhase !== 'playing') return;
    if (!isAdjacent(tile, chicken)) return;
    if (tile.state !== 'hidden') return;

    const currentPeekCount = peekCount + 1;
    setPeekCount(currentPeekCount);
    
    // --- SKILL: Quick Eyes (fast_peek) ---
    let cost = has('fast_peek') ? 0.5 : 1;
    if (hasSkinSkill('ninja_smoke_bomb', 'ninja') && currentPeekCount % 3 === 0) {
      cost = 0;
    }
    
    timerVal.current = Math.max(0, timerVal.current - cost);
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
  }, [gamePhase, chicken, unlockedSkills, peekCount]);

  const collectPowerup = (type) => {
    audio.powerupCollect();
    if (type === 'shield') {
      setHasShield(true);
      setActivePowerup('shield');
      // --- SKILL: Shield Master ---
      setShieldHits(has('shield_master') ? 2 : 1);
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
      
      // --- SKILL: Wider Vision ---
      let range = has('wider_vision') ? 4 : 2;
      if (hasSkinSkill('space_orbit_scan', 'space')) range += 2;

      setTiles(ts => ts.map(t => {
        const dr = Math.abs(t.r - chicken.r);
        const dc = Math.abs(t.c - chicken.c);
        if (t.state === 'hidden' && t.isMine && dr <= range && dc <= range) {
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
    } else if (type === 'light') {
      setActivePowerup('light');
      setFogRadius(3);
      setTimeout(() => {
        setFogRadius(1);
        setActivePowerup(null);
      }, 5000);
    } else if (type === 'golden_seed') {
      setHasGoldenSeed(true);
      setActivePowerup('golden_seed');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
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
    
    const pet = PETS.find(p => p.id === equippedPetId);
    const buildings = gameStore.getBuildings();
    const siloLvl = buildings.silo || 0;
    const siloMult = 1 + (siloLvl * 0.1); 
    const playgroundLvl = buildings.playground || 0;
    const abilityPower = 1 + (playgroundLvl * 0.25);

    let seedMultiplier = 1 * siloMult;
    if (pet?.bonus === 'seed_bonus') seedMultiplier += (pet.bonusVal * abilityPower);

    let earned = Math.floor((baseSeeds + timeBonus) * (doubleScore ? 2 : 1) * comboMultiplier * seedMultiplier);

    // --- SKILL: Seed Finder ---
    if (has('seed_finder')) earned = Math.floor(earned * 1.2);
    // --- SKILL: Golden Touch ---
    if (hasGoldenSeed) earned *= 3;
    
    if (hasSkinSkill('royal_decree', 'royal')) {
      earned = Math.floor(earned * 1.15);
      triggerSkinSkill('royal_decree', 600);
    }
    if (hasSkinSkill('royal_tax_collection', 'royal') && lvl % 5 === 0) {
      earned += 50;
    }

    gameStore.setAchievement('firstSteps');
    gameStore.incrementAchievement('survivor', 1);
    gameStore.incrementAchievement('roadRunner', 1);
    if (lvl >= 10) gameStore.setAchievement('mineMaster');
    if (lvl >= 20) gameStore.setAchievement('deepDigger');
    if (timeLeft >= (timerMaxVal.current - 15)) gameStore.setAchievement('speedyClucker');

    setLevelSeeds(earned);
    setLevelTimeLeft(timeLeft);
    setSeeds(gameStore.getSeeds());

    setTimeout(() => {
      gamePhaseRef.current = 'levelcomplete';
      setGamePhase('levelcomplete');
      onLevelComplete({ level: lvl, seeds: earned, timeLeft });
    }, 600);
  };

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

    const cur = chicken;
    if (dir) {
      const nr = cur.r + dir[0];
      const nc = cur.c + dir[1];
      const adjTile = tiles.find(t => t.r === nr && t.c === nc);
      if (adjTile) handleTileStep(adjTile);
    }
    setTouchStart(null);
  };

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
  const bgColor2 = bgColors[(Math.floor((level - 1) / 10) + 1) % bgColors.length];

  return (
    <div
      className={`gameplay-screen ${shaking ? 'screen-shake' : ''}`}
      style={{ background: `linear-gradient(135deg, ${biome.color}, ${bgColor2})` }}
      onTouchStart={handleTouchStartGrid}
      onTouchEnd={handleTouchEndGrid}
    >
      <div 
        className="death-flash-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,0,0,0.35)',
          zIndex: 999,
          pointerEvents: 'none',
          opacity: deathFlash ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />
      <style>{`
        @keyframes anim-idle-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.04); }
        }
        @keyframes anim-moving {
          0% { transform: scaleY(1); }
          30% { transform: scaleY(0.8); }
          70% { transform: scaleY(1.15); }
          100% { transform: scaleY(1); }
        }
        @keyframes anim-death {
          0%, 11%, 22%, 33%, 44% { transform: translateX(0); }
          5%, 28% { transform: translateX(-6px); }
          16%, 39% { transform: translateX(6px); }
          45% { transform: translateX(0) scaleY(1); }
          100% { transform: translateX(0) scaleY(0.2); }
        }
        @keyframes anim-celebrate {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-14px) scaleY(1.2); }
        }
        @keyframes anim-space-star-fade { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.5); } }
        @keyframes anim-space-skill { 0%, 100% { transform: translateY(0); box-shadow: 0 0 0 0 rgba(176,200,232,0); } 50% { transform: translateY(-10px); box-shadow: 0 0 20px 10px rgba(176,200,232,0.6); } }
        @keyframes anim-ninja-ghost-fade { 0% { opacity: 0; } 15% { opacity: 0.35; } 100% { opacity: 0; } }
        @keyframes anim-ninja-skill { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes anim-ninja-smoke { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-20px); } }
        @keyframes anim-royal-sparkle { 0% { transform: translateY(0) scale(0); opacity: 0; } 50% { opacity: 1; transform: translateY(-7px) scale(1); } 100% { transform: translateY(-15px) scale(0); opacity: 0; } }
        @keyframes anim-royal-coin-burst { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
        @keyframes anim-ghost-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes anim-ghost-skill { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes anim-ghost-ripple { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; border: 2px solid #2196F3; border-radius: 50%; } 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; border: 1px solid #2196F3; border-radius: 50%; } }
        
        @keyframes tile-mine-pulse { 0%, 100% { box-shadow: 0 0 4px rgba(180,0,0,0.2); } 50% { box-shadow: 0 0 8px rgba(180,0,0,0.4); } }
        @keyframes tile-powerup-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes tile-flip-improve { 0% { transform: scaleX(1); } 50% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
        @keyframes tile-safe-floor-glow { 0%, 100% { box-shadow: 0 0 8px rgba(100,255,100,0.3); } 50% { box-shadow: 0 0 16px rgba(100,255,100,0.6); } }
        @keyframes tile-adjacent-pulse { 0%, 100% { border-color: rgba(255,255,255,0.4); } 50% { border-color: rgba(255,255,255,1); } }

        .anim-idle-breathe { animation: anim-idle-breathe 2s ease-in-out infinite; }
        .anim-moving { animation: anim-moving 0.25s ease-out 1 forwards; }
        .anim-death { animation: anim-death 0.7s forwards; }
        .anim-celebrate { animation: anim-celebrate 0.4s 3 forwards; }

        .tile-mine-pulse { animation: tile-mine-pulse 2s infinite ease-in-out; }
        .tile-powerup-float { animation: tile-powerup-float 1.5s infinite ease-in-out; }
        .tile-flip-improve { animation: tile-flip-improve 0.2s ease-out forwards; }
        .tile-safe-floor-glow { animation: tile-safe-floor-glow 1.5s infinite ease-in-out; }
        .tile-adjacent-pulse { animation: tile-adjacent-pulse 0.8s infinite ease-in-out !important; }
        
        .anim-space-skill { animation: anim-space-skill 1s ease-in-out; border-radius: 50%; }
        .anim-ninja-skill { animation: anim-ninja-skill 0.5s ease-in-out; }
        .anim-ghost-skill { animation: anim-ghost-skill 0.5s ease-in-out; }
        .skin-ghost { animation: anim-ghost-pulse 2s ease-in-out infinite; }

        .space-star-trail { position: absolute; color: #B0C8E8; font-size: 20px; animation: anim-space-star-fade 0.6s forwards; pointer-events: none; z-index: 10; }
        .ninja-ghost-trail { position: absolute; animation: anim-ninja-ghost-fade 0.4s ease-out forwards; pointer-events: none; z-index: 5; }
        .royal-sparkle { position: absolute; color: #FFD700; font-size: 14px; pointer-events: none; }
        .royal-sparkle.s1 { left: -10px; top: 0; animation: anim-royal-sparkle 1.5s 0s infinite; }
        .royal-sparkle.s2 { right: -10px; top: -10px; animation: anim-royal-sparkle 1.5s 0.5s infinite; }
        .royal-sparkle.s3 { left: 10px; top: -20px; animation: anim-royal-sparkle 1.5s 1s infinite; }
        .ninja-smoke { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 24px; animation: anim-ninja-smoke 0.5s forwards; }
        .ghost-ripple { position: absolute; top: 50%; left: 50%; width: 20px; height: 20px; animation: anim-ghost-ripple 0.5s forwards; }
        .royal-coin { position: absolute; font-size: 20px; animation: anim-royal-coin-burst 0.6s forwards; }
      `}</style>
      <TopBar 
        title={isDaily ? "DAILY" : biome.name.toUpperCase()} 
        onBack={onBack} 
        showSeeds={false} 
      />

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>

      {showConfetti && <Confetti />}
      <ObstacleOverlay obstacle={obstacle} onDone={() => setObstacle(null)} />

      <div className="hud-v3">
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
            {hasShield    && <div className="hud-badge hud-badge--shield">🛡️ {shieldHits > 1 ? `x${shieldHits}` : ''}</div>}
            {doubleScore  && <div className="hud-badge hud-badge--double">⭐ 2X</div>}
            {slowMoActive && <div className="hud-badge hud-badge--slow">⏱️</div>}
            {mineSkipCharges > 0 && <div className="hud-badge hud-badge--skip">👟 {mineSkipCharges}</div>}
            {modifiers.includes('fog')   && <div className="hud-badge hud-badge--fog">🌫️ FOG</div>}
            {modifiers.includes('speed') && <div className="hud-badge hud-badge--speed">⚡</div>}
          </div>
        </div>
      </div>

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
            const isFoggy = modifiers.includes('fog') && (dr > fogRadius || dc > fogRadius);
            const showShadow = hasSkinSkill('ninja_assassins_eye', 'ninja') && tile.state === 'hidden' && tile.isMine;
            
            return (
              <Tile
                key={`${tile.r}-${tile.c}`}
                tile={tile}
                tileStyle={biome.tileStyle || equippedTile}
                isAdjacent={isAdjacent(tile, chicken)}
                onTap={handleTileStep}
                onLongPress={handleLongPress}
                cellW={cellSize.w}
                cellH={cellSize.h}
                isFoggy={isFoggy}
                showShadow={showShadow}
              />
            );
          })}
        </div>

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
            const dotSeed = pos.r * 100 + pos.c;
            const numDots = 3 + (dotSeed % 5);
            
            return Array.from({ length: numDots }).map((_, j) => {
              const pSeed = dotSeed + j * 37;
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
            skinSkillAnim={skinSkillAnim}
          />
          {equippedPetId && (
            <Pet
              petId={equippedPetId}
              position={chicken}
              cellW={cellSize.w}
              cellH={cellSize.h}
              animClass={petAnim}
            />
          )}
        </div>
      </div>

      {level === 1 && gamePhase === 'playing' && (
        <div className="hint-bar">Tap adjacent tile to move • Long press to peek (-1s)</div>
      )}

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

      {showHelp && (
        <HelpModal
          title="Gameplay Tips"
          onClose={() => setShowHelp(false)}
          content={[
            { heading: 'Movement', text: 'Tap adjacent tiles only. You cannot jump over tiles.' },
            { heading: 'Numbers', text: 'Revealed tiles show how many mines are in the 8 surrounding tiles.' },
            { heading: 'Peek', text: 'Long press a hidden tile to briefly reveal it. Costs seeds.' },
            { heading: 'Timer', text: 'Complete the level before time runs out. Powerups can extend your time.' },
            { heading: 'Checkpoint', text: 'Reach the flag tile to complete the level and earn seeds.' },
          ]}
        />
      )}
    </div>
  );
}
