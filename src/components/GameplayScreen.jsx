import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gameStore } from '../store/gameStore';
import { playerStore } from '../store/playerStore';
import { audio } from '../audio/engine';
import { CHICKEN_SKINS, TILE_STYLES, TRAIL_EFFECTS } from '../data/skins';
import { PETS } from '../data/pets';
import { BIOMES } from '../data/biomes';
import { SKILLS } from '../data/skills';
import { MUTATORS } from '../data/mutators';
import ChickenSVG from './ChickenSVG';
import PetSVG from './PetSVG';
import TopBar from './TopBar';
import GameOverModal from './GameOverModal';
import LevelClearModal from './LevelClearModal';
import HelpModal from './HelpModal';
import { GoalIcon, SkullIcon, AlertIcon, CheckIcon, TorchIcon, DiskIcon, FoxIcon, ScrambleIcon, StarIcon, SeedIcon, MineIcon, ShieldIcon, SlowMoIcon, RevealIcon, DoubleScoreIcon, ClockIcon, PlayIcon, DailyIcon, GemIcon, SmokeIcon, MagnetIcon } from './Icons';

function MutatorIcon({ icon, size = 24 }) {
  const map = {
    '💔': SkullIcon,
    '⚡': ClockIcon,
    '💣': MineIcon,
    '🙈': RevealIcon,
    '🧊': SlowMoIcon,
    '💎': GemIcon,
  };
  const Icon = map[icon];
  if (Icon) return <Icon size={size} className="text-gold" />;
  return <span style={{ fontSize: size }}>{icon}</span>;
}

// ─── DAILY CONFIG ──────────────────────────────────────────────
function getDailyConfig(dateString) {
  let seed = dateString.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  
  const sRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Select 1-3 mutators
  const mutatorCount = Math.floor(sRandom() * 3) + 1;
  const shuffledMutators = [...MUTATORS].sort(() => sRandom() - 0.5);
  const activeMutators = shuffledMutators.slice(0, mutatorCount);

  // Select locked pet and skin
  const lockedPet = PETS[Math.floor(sRandom() * PETS.length)];
  const lockedSkin = CHICKEN_SKINS[Math.floor(sRandom() * CHICKEN_SKINS.length)];

  // Difficulty offset (-5 to +20 levels)
  const diffOffset = Math.floor(sRandom() * 26) - 5;

  return { activeMutators, lockedPet, lockedSkin, diffOffset };
}

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
function generateGrid(rows, cols, mineRate, level, isDaily, biome, activeMutators = []) {
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
  const powerupCount = activeMutators.includes('fragile') ? 0 : Math.max(1, Math.floor(level / 3));
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
        state: 'hidden',
        powerup: null,
        hasSeed: false,
        isFakeSafe: false,
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
  const opacity  = Math.max(0, ageFactor * 0.9);
  const baseSize = (isFlower || isMusic) ? 16 : isBubble ? 14 : 10;
  const size     = baseSize * ageFactor; // Grow as they get newer
  const rotation = (index * 20 + particleIndex * 45) % 360;

  let content = null;
  let customStyle = {};

  if (isFlower) {
    content = (
      <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.5, opacity: 0.85 }}>
        <path d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2 Z" />
        <path d="M5 5 Q12 12 19 19 Q12 12 5 19 Q12 12 19 5" />
      </svg>
    );
    customStyle = { background: 'none', boxShadow: 'none', transform: `rotate(${rotation}deg)` };
  } else if (isMusic) {
    content = (
      <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: color, strokeWidth: 2, opacity: 0.9 }}>
        {index % 2 === 0 ? (
          <path d="M9 18V5l12-2v13 M9 9l12-2 M6 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M18 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
        ) : (
          <path d="M9 17 V3 M6 17a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M9 7 C14 7 15 3 15 3" />
        )}
      </svg>
    );
    customStyle = { background: 'none', boxShadow: 'none', transform: `rotate(${rotation}deg)` };
  } else if (isSparkle) {
    content = (
      <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: '#FFF176', opacity: 0.9, filter: 'drop-shadow(0 0 4px gold)' }}>
        <polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" />
      </svg>
    );
    customStyle = { 
      background: 'none', 
      boxShadow: 'none', 
      transform: `rotate(${rotation}deg) scale(${0.5 + ageFactor * 0.5})`
    };
  } else if (isBubble) {
    customStyle = {
      background: 'rgba(255,255,255,0.1)',
      border: `1.5px solid ${color}`,
      boxShadow: `inset -2px -2px 4px rgba(255,255,255,0.3), 0 0 8px ${color}`,
      transform: `scale(${0.4 + ageFactor * 0.6})`
    };
  } else if (isRainbow) {
    customStyle = {
      boxShadow: `0 0 15px ${color}, 0 0 5px #fff`,
      border: '1px solid rgba(255,255,255,0.5)',
      background: color,
      transform: `rotate(${rotation}deg) scale(${0.3 + ageFactor * 0.7})`
    };
  } else {
    customStyle = { 
      background: color, 
      boxShadow: `0 0 10px ${color}`,
      transform: `scale(${ageFactor})`
    };
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
function Chicken({ skin, animState, position, cellW, cellH, isMagnetActive, skinSkillAnim, tiles = [] }) {
  const pixelX = position.c * (cellW + 2) + cellW / 2;
  const pixelY = position.r * (cellH + 2) + cellH / 2;
  
  const [trail, setTrail] = useState(null);
  const [focus, setFocus] = useState(null);
  const prevPosRef = useRef(position);

  useEffect(() => {
    if (prevPosRef.current.r !== position.r || prevPosRef.current.c !== position.c) {
      setTrail({ r: prevPosRef.current.r, c: prevPosRef.current.c, key: Date.now() });
      
      // Look in direction of move
      if (position.r < prevPosRef.current.r) setFocus('up');
      else if (position.r > prevPosRef.current.r) setFocus('down');
      else if (position.c < prevPosRef.current.c) setFocus('left');
      else if (position.c > prevPosRef.current.c) setFocus('right');
      
      setTimeout(() => setFocus(null), 300);
      prevPosRef.current = position;
    }
  }, [position]);

  // Near mine fear detection
  const isDangerNear = useMemo(() => {
    if (animState === 'explode' || animState === 'death' || animState === 'celebrate') return false;
    return tiles.some(t => 
      t.isMine && 
      t.state === 'hidden' && 
      Math.abs(t.r - position.r) <= 1 && 
      Math.abs(t.c - position.c) <= 1
    );
  }, [tiles, position, animState]);

  const mood = animState === 'explode' || animState === 'death' ? 'sad' : isDangerNear ? 'scared' : animState === 'celebrate' ? 'happy' : 'normal';
  const size = Math.min(cellW, cellH) * 1.15; // Reverted to original tactical size
  
  let animClass = '';
  if (animState === 'normal' || animState === 'idle') animClass = isDangerNear ? 'anim-shiver' : 'anim-idle-breathe';
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
        <ChickenSVG skinId={skin} mood={mood} size={size} animClass={animClass} focus={focus}/>
        {animState === 'shield' && <div className="shield-bubble"/>}
        {isMagnetActive && <div className="magnet-pulse"/>}
        
        {skin === 'royal' && (
          <>
            <div className="royal-sparkle s1">✦</div>
            <div className="royal-sparkle s2">✦</div>
            <div className="royal-sparkle s3">✦</div>
          </>
        )}
        {skinSkillAnim === 'ninja_shadow_step' && (
          <div className="ninja-smoke flex items-center justify-center">
            <SmokeIcon size={18} className="text-slate-300" />
          </div>
        )}
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
function Pet({ petId, position, cellW, cellH, animClass, mood }) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return null;

  const centerX = position.c * (cellW + 2) + cellW / 2;
  const centerY = position.r * (cellH + 2) + cellH / 2;
  const isNearTop = position.r < 2;
  
  // Offset pet to the side and slightly above/below chicken based on grid space
  const petX = centerX + (cellW * 0.4);
  const petY = isNearTop ? centerY + (cellH * 0.3) : centerY - (cellH * 0.3);

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
        width: cellW * 0.45,
        height: cellH * 0.45
      }}
    >
      <PetSVG petId={petId} size="100%" animClass={animClass} mood={mood} />
    </div>
  );
}

// ─── TILE COMPONENT ──────────────────────────────────────────────
function Tile({ tile, tileStyle, isAdjacent, onTap, onLongPress, cellW, cellH, showShadow }) {
  const styleData = TILE_STYLES.find(s => s.id === tileStyle) || TILE_STYLES[0];
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);

  const onPointerDown = (e) => {
    // Only handle primary pointer (left click or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      onLongPress(tile);
      isLongPress.current = true;
    }, 400);
  };

  const onPointerUp = (e) => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    // Only trigger tap if it wasn't a long press
    if (!isLongPress.current) {
      onTap(tile);
    }
  };

  const onPointerCancel = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  let bg, content, extraClass = '';

  if (tile.state === 'checkpoint') {
    bg = '#FFD700';
    content = <GoalIcon size={20} className="text-white mx-auto" />;
    extraClass = 'tile-checkpoint';
  } else if (tile.state === 'hidden') {
    bg = styleData.hiddenColor;
    content = tile.powerup ? <StarIcon size={16} className="text-gold animate-pulse mx-auto" /> : (tile.hasSeed ? <SeedIcon size={16} className="text-gold mx-auto" /> : '?');
    extraClass = `tile-hidden ${tile.powerup ? 'tile-powerup-glow' : ''} ${isAdjacent ? 'tile-adjacent tile-adjacent-pulse' : ''} ${tile.isMine ? 'tile-mine-pulse' : ''}`;
  } else if (tile.state === 'revealed') {
    bg = styleData.safeColor;
    content = tile.powerup ? getPowerupIcon(tile.powerup) : (tile.hasSeed ? <SeedIcon size={16} className="text-gold mx-auto" /> : <CheckIcon size={16} className="text-white/80 mx-auto" />);
    extraClass = `tile-revealed tile-3d-flip`;
  } else if (tile.state === 'mine') {
    bg = styleData.mineColor;
    content = <SkullIcon size={20} className="text-white mx-auto" />;
    extraClass = 'tile-mine tile-shake';
  } else if (tile.state === 'peeked') {
    bg = tile.isMine ? '#ff6b6b' : '#90EE90';
    content = tile.isMine ? <MineIcon size={18} className="text-white mx-auto" /> : <CheckIcon size={16} className="text-white/80 mx-auto" />;
    extraClass = 'tile-peeked tile-3d-flip';
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
        touchAction: 'none' // Prevent scrolling/zooming during grid play
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerCancel}
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
    </div>
  );
}

function getPowerupIcon(type) {
  const map = {
    shield: ShieldIcon,
    slowmo: SlowMoIcon,
    reveal: RevealIcon,
    doublescore: DoubleScoreIcon,
    magnet: MagnetIcon,
    light: TorchIcon,
    golden_seed: DiskIcon
  };
  const Icon = map[type];
  if (Icon) return <Icon size={20} className="text-white mx-auto" />;
  return <StarIcon size={20} className="text-gold mx-auto" />;
}

// ─── OBSTACLE OVERLAY ────────────────────────────────────────────
function ObstacleOverlay({ obstacle, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [obstacle]);

  if (!obstacle) return null;
  const msgs = {
    thief: { icon: <FoxIcon size={44} className="text-white mx-auto" />, text: 'THIEF FOX!', sub: 'Stole your powerup!', cls: 'obstacle-thief' },
    scramble: { icon: <ScrambleIcon size={44} className="text-white mx-auto" />, text: 'SCRAMBLER!', sub: 'Tiles re-hidden!', cls: 'obstacle-scramble' },
  };
  const m = msgs[obstacle] || { icon: <AlertIcon size={44} className="text-white mx-auto" />, text: 'OBSTACLE!', sub: '', cls: '' };
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
          animation: `confettiFall ${p.duration}s ${p.delay}s linear forwards`,
          width: p.size,
          height: p.size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${p.size}px`,
          transform: `rotate(${p.rot}deg)`,
        }}>
          {p.type === 'seed' ? <SeedIcon size={p.size} className="text-gold" /> : p.type === 'star' ? '✦' : ''}
        </div>
      ))}
    </div>
  );
}

function DailyIntroModal({ config, onStart }) {
  return (
    <div className="modal-backdrop modal-backdrop--visible" style={{ zIndex: 1000 }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="modal-card p-6 text-center gap-6"
      >
        <div className="flex flex-col items-center">
          <DailyIcon size={48} className="text-gold mb-2" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight m-0">
            DAILY CHALLENGE
          </h2>
          <p className="text-xs text-muted font-bold tracking-widest mt-1">
            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="text-left">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Active Mutators</span>
            <div className="flex flex-col gap-2 mt-2">
              {config.activeMutators.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
                  <MutatorIcon icon={m.icon} size={24} />
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white">{m.name}</span>
                    <span className="text-[10px] text-secondary font-bold">{m.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">Locked Skin</span>
              <ChickenSVG skinId={config.lockedSkin.id} size={50} />
              <span className="text-[10px] font-bold text-white mt-1">{config.lockedSkin.name}</span>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">Locked Pet</span>
              <PetSVG petId={config.lockedPet.id} size={40} />
              <span className="text-[10px] font-bold text-white mt-1">{config.lockedPet.name}</span>
            </div>
          </div>
        </div>

        <button 
          className="mo-btn mo-btn--retry w-full mt-2" 
          onClick={onStart}
          style={{ textShadow: 'var(--text-stroke-white)' }}
        >
          START CHALLENGE
        </button>
      </motion.div>
    </div>
  );
}

// ─── MAIN GAMEPLAY SCREEN ─────────────────────────────────────────
export default function GameplayScreen({ startLevel = 1, onGameOver, onLevelComplete, isDaily = false, frozen = false, onBack }) {
  // --- 3b. DAILY CHALLENGE OVERRIDES (Pre-computed for state initialization) ---
  const dailyConfig = useMemo(() => {
    if (!isDaily) return null;
    return getDailyConfig(new Date().toDateString());
  }, [isDaily]);

  const finalStartLevel = isDaily ? Math.max(1, startLevel + dailyConfig.diffOffset) : startLevel;

  // --- 1. STATE ---
  const [level, setLevel] = useState(finalStartLevel);
  const [showLevelSplash, setShowLevelSplash] = useState(false);
  const [eggFound, setEggFound] = useState(null);
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
  const [victoryWaves, setVictoryWaves] = useState([]);
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
  const [cellSize, setCellSize] = useState({ w: 44, h: 44 });
  const [revealAllActive, setRevealAllActive] = useState(false);
  const [slowMoActive, setSlowMoActive] = useState(false);
  const [modifiers, setModifiers] = useState([]); 
  const [biome, setBiome] = useState(BIOMES[0]);
  const [equippedPetId, setEquippedPetId] = useState(gameStore.getEquippedPet());
  const [touchStart, setTouchStart] = useState(null);
  const [mineSkipCharges, setMineSkipCharges] = useState(0);
  const [minesHitInRun, setMinesHitInRun] = useState(0);
  const [skinSkillAnim, setSkinSkillAnim] = useState(null);
  const [petAnim, setPetAnim] = useState(null);
  const [deathFlash, setDeathFlash] = useState(false);
  const [tileSeedsCollected, setTileSeedsCollected] = useState(0);
  const [baseLevelReward, setBaseLevelReward] = useState(0);
  const [petBonusSeeds, setPetBonusSeeds] = useState(0);
  const [skillBonusSeeds, setSkillBonusSeeds] = useState(0);
  const [multiplierBonusSeeds, setMultiplierBonusSeeds] = useState(0);
  const [floatingSeeds, setFloatingSeeds] = useState([]);
  const [warpStepUsed, setWarpStepUsed] = useState(false);
  const [possessionUsed, setPossessionUsed] = useState(false);
  const [peekCount, setPeekCount] = useState(0);
  const [shadowStepUsed, setShadowStepUsed] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [hasGoldenSeed, setHasGoldenSeed] = useState(false);

  // --- 2. REFS ---
  const timerRef = useRef(null);
  const powerupTimerRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const fireTimerRef = useRef(null);
  const chickenAnimTimerRef = useRef(null);
  const blastResistanceUsed = useRef(false);
  const timerVal = useRef(30);
  const timerMaxVal = useRef(30);
  const slowMoRef = useRef(false);
  const levelRef = useRef(finalStartLevel);
  const gamePhaseRef = useRef('playing');
  const pauseRef = useRef(false);
  const diffRef = useRef(null);
  const chickenRef = useRef(chicken);
  const propsRef = useRef({ onGameOver, onLevelComplete, onBack });

  // Sync refs
  useEffect(() => {
    chickenRef.current = chicken;
    propsRef.current = { onGameOver, onLevelComplete, onBack };
  }, [chicken, onGameOver, onLevelComplete, onBack]);

  // --- 3. FOUNDATIONAL VALUES (MEMOIZED) ---
  const equippedSkin = useMemo(() => gameStore.getEquippedSkin(), []);
  const equippedTile = useMemo(() => gameStore.getEquippedTile(), []);
  const equippedTrail = useMemo(() => gameStore.getEquippedTrail(), []);
  const unlockedSkills = useMemo(() => playerStore.getSkills(), []);

  // Overrides for Daily Mode
  const finalSkin = isDaily ? dailyConfig.lockedSkin.id : equippedSkin;
  const finalPet = isDaily ? dailyConfig.lockedPet.id : equippedPetId;

  const has = useCallback((id) => unlockedSkills.includes(id), [unlockedSkills]);
  const hasSkinSkill = useCallback((id, skinId) => unlockedSkills.includes(id) && finalSkin === skinId, [unlockedSkills, finalSkin]);

  const [showDailyIntro, setShowDailyIntro] = useState(isDaily);

  // --- 4. CALLBACKS ---
  const triggerSkinSkill = useCallback((id, duration) => {
    setSkinSkillAnim(id);
    setTimeout(() => setSkinSkillAnim(null), duration);
  }, []);

  const triggerPetAnim = useCallback((className, duration) => {
    setPetAnim(className);
    setTimeout(() => setPetAnim(null), duration);
  }, []);

  const isAdjacent = useCallback((tile, pos) => {
    const dr = Math.abs(tile.r - pos.r);
    const dc = Math.abs(tile.c - pos.c);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }, []);

  const moveChicken = useCallback((r, c) => {
    setChicken({ r, c });
    setVisitedTiles(prev => [...prev, { r, c }]);
    setChickenAnim('moving');
    if (chickenAnimTimerRef.current) clearTimeout(chickenAnimTimerRef.current);
    chickenAnimTimerRef.current = setTimeout(() => {
      if (gamePhaseRef.current === 'playing') {
        setChickenAnim('idle');
      }
    }, 250);

    if (!isDaily || !dailyConfig.activeMutators.some(m => m.id === 'blind')) {
      if (hasSkinSkill('ghost_haunting', 'ghost')) {
        setTiles(ts => ts.map(t => {
          if (isAdjacent(t, { r, c }) && t.state === 'hidden' && t.isMine) {
            return { ...t, state: 'peeked' };
          }
          return t;
        }));
      }
    }
  }, [hasSkinSkill, isAdjacent]);

  const triggerGameOver = useCallback((reason) => {
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
        propsRef.current.onGameOver({ level: levelRef.current, seeds: levelSeeds });
      }, 300);
    }, 700);
  }, [levelSeeds]); // levelSeeds is needed if it updates, but actually levelRef.current is better.

  const handleMineHit = useCallback((tile, cause = 'mine') => {
    if (isInvincible) return;
    
    setMinesHitInRun(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // --- SKILL: Tough Feathers ---
    if (has('tough_feathers') && Math.random() < 0.05) {
      audio.powerupCollect();
      if (tile) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
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

    if (hasSkinSkill('ghost_possession', 'ghost') && !possessionUsed && cause === 'mine') {
      setPossessionUsed(true);
      setIsInvincible(true);
      audio.powerupCollect(); 
      if (tile) {
        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, state: 'revealed', isMine: false } : t));
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
      if (equippedPetId === 'chick_ninja') triggerPetAnim('pet-bonus-shadow', 300); // Fixed typo from shadow to shadow logic
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
        propsRef.current.onGameOver({ level: levelRef.current, seeds: levelSeeds });
      }, 300);
    }, 700);
  }, [isInvincible, has, hasSkinSkill, possessionUsed, mineSkipCharges, equippedPetId, triggerPetAnim, moveChicken, levelSeeds]);

  const collectPowerup = useCallback((type) => {
    audio.powerupCollect();
    if (navigator.vibrate) navigator.vibrate(50);
    if (type === 'shield') {
      setHasShield(true);
      setActivePowerup('shield');
      // --- SKILL: Shield Master ---
      setShieldHits(has('shield_master') ? 2 : 1);
    } else if (type === 'slowmo') {
      if (powerupTimerRef.current) clearInterval(powerupTimerRef.current);
      setMagnetActive(false);
      setActivePowerup('slowmo');
      setSlowMoActive(true);
      slowMoRef.current = true;
      setPowerupTimer(8);
      let t = 8;
      powerupTimerRef.current = setInterval(() => {
        t -= 1;
        setPowerupTimer(t);
        if (t <= 0) {
          clearInterval(powerupTimerRef.current);
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
        const curChicken = chickenRef.current;
        const dr = Math.abs(t.r - curChicken.r);
        const dc = Math.abs(t.c - curChicken.c);
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
      if (powerupTimerRef.current) clearInterval(powerupTimerRef.current);
      setSlowMoActive(false);
      slowMoRef.current = false;
      setMagnetActive(true);
      setActivePowerup('magnet');
      setPowerupTimer(12);
      let t = 12;
      powerupTimerRef.current = setInterval(() => {
        t -= 1;
        setPowerupTimer(t);
        if (t <= 0) {
          clearInterval(powerupTimerRef.current);
          setMagnetActive(false);
          setActivePowerup(null);
        }
      }, 1000);
    } else if (type === 'golden_seed') {
      setHasGoldenSeed(true);
      setActivePowerup('golden_seed');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [has, hasSkinSkill]);

  const handleLevelComplete = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(obstacleTimerRef.current);
    audio.levelComplete();
    setShowConfetti(true);
    setChickenAnim('celebrate');
    setVictoryWaves([Date.now(), Date.now() + 200, Date.now() + 400]);

    const lvl = levelRef.current;
    const baseSeeds = lvl * 10;
    const timeLeft = Math.floor(timerVal.current);
    const timeBonus = timeLeft * 2;
    
    // 1. Base reward (level + time bonus) before any multipliers
    const baseRaw = baseSeeds + timeBonus;
    
    const pet = PETS.find(p => p.id === equippedPetId);
    const buildings = gameStore.getBuildings();
    const siloLvl = buildings.silo || 0;
    const siloMult = 1 + (siloLvl * 0.1); 
    const playgroundLvl = buildings.playground || 0;
    const abilityPower = 1 + (playgroundLvl * 0.25);

    // Multipliers (Combo, Silo, Double Score)
    const activeMult = (doubleScore ? 2 : 1) * comboMultiplier * siloMult;
    const finalBase = Math.floor(baseRaw * activeMult);

    // 1. Multiplier Bonus (extra from Silo, Combo, etc)
    const mBonus = finalBase - baseRaw;

    // 2. Pet Bonus calculation
    let pBonus = 0;
    if (pet?.bonus === 'seed_bonus') {
      pBonus = Math.floor(baseRaw * (pet.bonusVal * abilityPower) * (doubleScore ? 2 : 1) * comboMultiplier);
    }

    // 3. Skill Bonus calculation (Only from actual skills)
    let sBonus = 0;
    const totalBeforeSkills = finalBase + pBonus;
    
    // Seed Finder (+20%)
    if (has('seed_finder')) {
      sBonus += Math.floor(totalBeforeSkills * 0.2);
    }

    // Royal Decree (+15%)
    if (hasSkinSkill('royal_decree', 'royal')) {
      sBonus += Math.floor((totalBeforeSkills + sBonus) * 0.15);
      triggerSkinSkill('royal_decree', 600);
    }
    
    // Royal Tax (fixed amount)
    if (hasSkinSkill('royal_tax_collection', 'royal') && lvl % 5 === 0) {
      sBonus += 50;
    }

    // Golden Touch (x3 total)
    if (hasGoldenSeed) {
      sBonus += (finalBase + pBonus + sBonus) * 2;
    }

    // 4. Perfect Clear Bonus (+25% of total earned so far)
    let perfectBonus = 0;
    if (minesHitInRun === 0) {
      perfectBonus = Math.floor((finalBase + pBonus + sBonus) * 0.25);
    }

    const totalEarned = finalBase + pBonus + sBonus + tileSeedsCollected + perfectBonus;

    // 5. Chance to find an egg
    let foundEgg = null;
    if (!isDaily && Math.random() < 0.40) {
      const roll = Math.random() * 100;
      let type = 'brown_egg';
      if (lvl <= 5) {
        if (roll < 3) type = 'golden_egg';
        else if (roll < 13) type = 'blue_egg';
      } else if (lvl <= 15) {
        if (roll < 7) type = 'golden_egg';
        else if (roll < 25) type = 'blue_egg';
      } else if (lvl <= 30) {
        if (roll < 12) type = 'golden_egg';
        else if (roll < 37) type = 'blue_egg';
      } else {
        if (roll < 18) type = 'golden_egg';
        else if (roll < 50) type = 'blue_egg';
      }
      foundEgg = type;
      gameStore.addEgg(type);
      audio.powerupCollect(); // Play a sparkle-like sound
    }
    setEggFound(foundEgg);

    gameStore.setAchievement('firstSteps');
    gameStore.incrementAchievement('survivor', 1);
    gameStore.incrementAchievement('roadRunner', 1);
    
    // Performance Feats
    if (totalEarned >= 100) gameStore.updateAchievement('seedSnatcher', true);
    if (totalEarned >= 500) gameStore.updateAchievement('bigHarvest', true);
    if (lvl >= 10) gameStore.setAchievement('mineMaster');
    if (lvl >= 20) gameStore.setAchievement('deepDigger');
    if (timeLeft >= (timerMaxVal.current - 15)) gameStore.setAchievement('speedyClucker');

    setBaseLevelReward(baseRaw);
    setPetBonusSeeds(pBonus);
    setSkillBonusSeeds(sBonus + perfectBonus); 
    setMultiplierBonusSeeds(mBonus);
    setLevelSeeds(totalEarned);
    setLevelTimeLeft(timeLeft);
    setSeeds(gameStore.getSeeds());

    setTimeout(() => {
      gamePhaseRef.current = 'levelcomplete';
      setGamePhase('levelcomplete');
      propsRef.current.onLevelComplete({ 
        level: lvl, 
        seeds: totalEarned, 
        timeLeft,
        tileSeedsCollected,
        baseLevelReward: baseRaw,
        petBonusSeeds: pBonus,
        skillBonusSeeds: sBonus,
        multiplierBonusSeeds: mBonus,
        eggFound: foundEgg
      });
    }, 600);
  }, [equippedPetId, doubleScore, comboMultiplier, tileSeedsCollected, has, hasSkinSkill, hasGoldenSeed, triggerSkinSkill, isDaily]);

  const handleTileStep = useCallback((tile) => {
    if (frozen || showDailyIntro) return;
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

      // --- MUTATOR: Blind ---
      const isBlind = isDaily && dailyConfig.activeMutators.some(m => m.id === 'blind');

      // --- SKILL: Hazard Sense ---
      if (!isBlind && has('hazard_sense') && Math.random() < 0.1) {
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

      if (!isBlind && pet?.bonus === 'reveal_bonus' && Math.random() < (pet.bonusVal * abilityPower)) {
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
        
        // --- MUTATOR: Wealthy ---
        if (isDaily && dailyConfig.activeMutators.some(m => m.id === 'wealthy')) {
          amt *= 2;
        }
        
        setSeeds(s => s + amt);
        setTileSeedsCollected(prev => prev + amt);

        const fx = tile.c * (cellSize.w + 2) + cellSize.w / 2;
        const fy = tile.r * (cellSize.h + 2) + cellSize.h / 2;
        const fid = Date.now() + Math.random();
        setFloatingSeeds(prev => [...prev, { id: fid, x: fx, y: fy, amount: amt }]);
        setTimeout(() => {
          setFloatingSeeds(prev => prev.filter(f => f.id !== fid));
        }, 800);

        setTiles(ts => ts.map(t => t.r === tile.r && t.c === tile.c ? { ...t, hasSeed: false } : t));
      }
    }
  }, [frozen, gamePhase, chicken, hasShield, shieldHits, tiles, biome, equippedPetId, lastMoveTime, combo, magnetActive, cellSize, hasSkinSkill, has, warpStepUsed, shadowStepUsed, triggerPetAnim, triggerSkinSkill, collectPowerup, moveChicken, handleLevelComplete, handleMineHit, isAdjacent, showDailyIntro]);

  const initLevel = useCallback((lvl) => {
    const activeMutatorIds = isDaily ? dailyConfig.activeMutators.map(m => m.id) : [];

    const diff = getDifficultyConfig(lvl);
    if (activeMutatorIds.includes('minefield')) diff.mineRate += 0.15;
    if (activeMutatorIds.includes('rush_hour')) diff.timerMax *= 0.5;
    
    diffRef.current = diff;

    const currentBiome = BIOMES.find(b => b.tileStyle === equippedTile) || BIOMES[0];
    setBiome(currentBiome);

    const activeMods = [];
    setModifiers(activeMods);

    const newTiles = generateGrid(diff.rows, diff.cols, diff.mineRate, lvl, isDaily, currentBiome, activeMutatorIds);

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
      if (gameStore.getEquippedPet() === 'sparky') triggerPetAnim('pet-bonus-sparky', 400);
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
    setVictoryWaves([]);
    setObstacle(null);
    setChickenAnim('idle');
    levelRef.current = lvl;
    gamePhaseRef.current = 'playing';
    setGamePhase('playing');
    blastResistanceUsed.current = false;
    setShadowStepUsed(false);
    setHasGoldenSeed(false);

    setTileSeedsCollected(0);
    setBaseLevelReward(0);
    setPetBonusSeeds(0);
    setSkillBonusSeeds(0);
    setFloatingSeeds([]);
    setMinesHitInRun(0);

    setShowLevelSplash(true);
    setTimeout(() => setShowLevelSplash(false), 1500);

    clearInterval(fireTimerRef.current);
  }, [equippedTile, isDaily, has, triggerPetAnim, collectPowerup]);

  const triggerObstacle = useCallback((type) => {
    setObstacle(type);
    if (type === 'thief') {
      audio.thiefFox();
      setActivePowerup(null);
      setHasShield(false);
      setDoubleScore(false);
      setSlowMoActive(false);
      slowMoRef.current = false;
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
      if (adjTile) {
        handleTileStep(adjTile);

        // --- MUTATOR: Slippery ---
        if (isDaily && dailyConfig.activeMutators.some(m => m.id === 'slippery')) {
          if (Math.random() < 0.1) {
            const snr = nr + dir[0];
            const snc = nc + dir[1];
            const slideTile = tiles.find(t => t.r === snr && t.c === snc);
            if (slideTile) {
              setTimeout(() => handleTileStep(slideTile), 200);
            }
          }
        }
      }
    }
    setTouchStart(null);
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
  }, [frozen, gamePhase, chicken, peekCount, isAdjacent, has, hasSkinSkill]);

  // --- 5. EFFECTS ---
  useEffect(() => {
    initLevel(startLevel);
    setWarpStepUsed(false);
    setPossessionUsed(false);
    setPeekCount(0);
  }, [initLevel, startLevel]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    clearInterval(timerRef.current);
    
    const buildings = gameStore.getBuildings();
    const nestBuff = 1 - (buildings.nest * 0.05);

    timerRef.current = setInterval(() => {
      if (pauseRef.current || showDailyIntro) return;
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
  }, [gamePhase, possessionUsed, modifiers, hasSkinSkill, triggerGameOver, showDailyIntro]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const diff = diffRef.current;
    if (!diff || diff.obstacleFreq === 0) return;

    const scheduleObstacle = () => {
      const delay = (12 + Math.random() * 15) * 1000 / diff.obstacleFreq;
      obstacleTimerRef.current = setTimeout(() => {
        if (gamePhaseRef.current !== 'playing') return;
        const types = ['thief', 'scramble'];
        const type = types[Math.floor(Math.random() * types.length)];
        triggerObstacle(type);
        scheduleObstacle();
      }, delay);
    };
    scheduleObstacle();
    return () => clearTimeout(obstacleTimerRef.current);
  }, [gamePhase, level, triggerObstacle]);

  const gridContainerRef = useRef(null);

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
          0% { transform: scale(1) rotate(0) translateY(0); opacity: 1; filter: none; }
          20% { transform: scale(1.1) rotate(-15deg) translateY(-5px); filter: hue-rotate(90deg) brightness(1.5) drop-shadow(0 0 12px #FF4500); }
          40% { transform: scale(0.9) rotate(15deg) translateY(0); filter: hue-rotate(180deg) brightness(2) drop-shadow(0 0 20px #FF1744); }
          100% { transform: scale(0) rotate(720deg) translateY(-60px); opacity: 0; filter: hue-rotate(360deg) brightness(0.5); }
        }
        @keyframes anim-celebrate {
          0% { transform: translateY(0) scale(1) rotate(0); }
          30% { transform: translateY(-40px) scaleX(0.85) scaleY(1.2) rotate(180deg); }
          50% { transform: translateY(-40px) scaleX(1) scaleY(1) rotate(360deg); }
          75% { transform: translateY(5px) scaleX(1.3) scaleY(0.75); }
          100% { transform: translateY(0) scale(1) rotate(360deg); }
        }
        @keyframes anim-shiver {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-1.5px, 0.5px) scale(0.99); }
          40% { transform: translate(1px, -1px) scale(1.01); }
          60% { transform: translate(-1px, -0.5px) scale(0.99); }
          80% { transform: translate(1.5px, 1px) scale(1.01); }
        }
        @keyframes sweat-drip {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 0.8; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes success-ring {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; border: 4px solid #FFD700; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
          50% { border-color: #00E5FF; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; border: 1px solid rgba(0, 229, 255, 0); box-shadow: 0 0 30px rgba(0, 229, 255, 0); }
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
        @keyframes anim-floating-seed {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -40px); opacity: 0; }
        }
        
        @keyframes tile-mine-pulse { 0%, 100% { box-shadow: 0 0 4px rgba(180,0,0,0.2); } 50% { box-shadow: 0 0 8px rgba(180,0,0,0.4); } }
        @keyframes tile-powerup-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes tile-safe-floor-glow { 0%, 100% { box-shadow: 0 0 8px rgba(100,255,100,0.3); } 50% { box-shadow: 0 0 16px rgba(100,255,100,0.6); } }
        @keyframes tile-adjacent-pulse { 0%, 100% { border-color: rgba(255,255,255,0.4); } 50% { border-color: rgba(255,255,255,1); } }
 
        .anim-idle-breathe { animation: anim-idle-breathe 2s ease-in-out infinite; }
        .anim-moving { animation: anim-moving 0.25s ease-out 1 forwards; }
        .anim-death { animation: anim-death 0.7s forwards; }
        .anim-celebrate { animation: anim-celebrate 0.6s ease-out 3 forwards; }
        .anim-shiver { animation: anim-shiver 0.15s infinite; }
        .success-ring {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
          animation: success-ring 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }m: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -40px); opacity: 0; }
        }
        
        @keyframes tile-mine-pulse { 0%, 100% { box-shadow: 0 0 4px rgba(180,0,0,0.2); } 50% { box-shadow: 0 0 8px rgba(180,0,0,0.4); } }
        @keyframes tile-powerup-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes tile-safe-floor-glow { 0%, 100% { box-shadow: 0 0 8px rgba(100,255,100,0.3); } 50% { box-shadow: 0 0 16px rgba(100,255,100,0.6); } }
        @keyframes tile-adjacent-pulse { 0%, 100% { border-color: rgba(255,255,255,0.4); } 50% { border-color: rgba(255,255,255,1); } }

        .anim-idle-breathe { animation: anim-idle-breathe 2s ease-in-out infinite; }
        .anim-moving { animation: anim-moving 0.25s ease-out 1 forwards; }
        .anim-death { animation: anim-death 0.7s forwards; }
        .anim-celebrate { animation: anim-celebrate 0.4s 3 forwards; }

        .tile-mine-pulse { animation: tile-mine-pulse 2s infinite ease-in-out; }
        .tile-powerup-float { animation: tile-powerup-float 1.5s infinite ease-in-out; }
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

      {showDailyIntro && (
        <DailyIntroModal 
          config={dailyConfig} 
          onStart={() => setShowDailyIntro(false)} 
        />
      )}

      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-[80px] right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg z-[110] active:scale-90 transition-transform"
        aria-label="Help"
      >
        ?
      </button>

      {showLevelSplash && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white font-black text-6xl tracking-tighter"
            style={{ textShadow: '0 0 20px rgba(0,0,0,0.5), 0 10px 40px rgba(255,215,0,0.4)' }}
          >
            LEVEL {level}
          </motion.div>
        </div>
      )}

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

          <div className="hud-seeds-chip flex items-center gap-1">
            <SeedIcon size={14} className="text-gold" />
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
            {hasShield    && <div className="hud-badge hud-badge--shield flex items-center gap-1"><ShieldIcon size={14} /> <span>{shieldHits > 1 ? `x${shieldHits}` : ''}</span></div>}
            {doubleScore  && <div className="hud-badge hud-badge--double flex items-center gap-1"><StarIcon size={14} /> <span>2X</span></div>}
            {slowMoActive && <div className="hud-badge hud-badge--slow"><ClockIcon size={14} /></div>}
            {mineSkipCharges > 0 && <div className="hud-badge hud-badge--skip flex items-center gap-1"><PlayIcon size={14} className="rotate-90" /> <span>{mineSkipCharges}</span></div>}
            {modifiers.includes('speed') && <div className="hud-badge hud-badge--speed"><PlayIcon size={14} /></div>}
            
            {/* DAILY MUTATORS */}
            {isDaily && dailyConfig.activeMutators.map(m => (
              <div key={m.id} className="hud-badge bg-white/10 flex items-center justify-center" title={m.name} style={{ width: '28px', height: '28px', padding: 0 }}>
                <MutatorIcon icon={m.icon} size={16} />
              </div>
            ))}
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
                showShadow={showShadow}
              />
            );
          })}

          {victoryWaves.map((waveId, idx) => (
            <div 
              key={waveId} 
              className="success-ring" 
              style={{
                left: (cols - 1) * (cellSize.w + 2) + cellSize.w / 2,
                top: cellSize.h / 2,
                animationDelay: `${idx * 0.2}s`
              }}
            />
          ))}

          <div
            className="trail-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            {equippedTrail !== 'none' && visitedTiles.slice(-16, -1).map((pos, i) => {
              const centerX = (pos.c * (cellSize.w + 2) + cellSize.w / 2) / (cols * cellSize.w + (cols - 1) * 2) * 100;
              const centerY = (pos.r * (cellSize.h + 2) + cellSize.h / 2) / (rows * cellSize.h + (rows - 1) * 2) * 100;
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
                    total={visitedTiles.slice(-16, -1).length}
                  />
                );
              });
            })}
          </div>

          <div
            className="chicken-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <Chicken
              skin={finalSkin}
              trail={equippedTrail}
              animState={chickenAnim}
              position={chicken}
              gridCols={cols}
              gridRows={rows}
              cellW={cellSize.w}
              cellH={cellSize.h}
              isMagnetActive={magnetActive}
              skinSkillAnim={skinSkillAnim}
              tiles={tiles}
            />
            {finalPet && (
              <Pet
                petId={finalPet}
                position={chicken}
                cellW={cellSize.w}
                cellH={cellSize.h}
                animClass={petAnim}
                mood={chickenAnim === 'explode' || chickenAnim === 'death' ? 'sad' : chickenAnim === 'celebrate' ? 'happy' : 'normal'}
              />
            )}
          </div>
        </div>

        {floatingSeeds.map(fs => (
          <div key={fs.id} style={{
            position: 'absolute',
            left: fs.x,
            top: fs.y,
            pointerEvents: 'none',
            zIndex: 100,
            color: '#F9A825',
            fontWeight: '900',
            fontSize: '18px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            animation: 'anim-floating-seed 0.8s ease-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }}>
            +{fs.amount} <SeedIcon size={16} className="text-gold inline-block align-middle" />
          </div>
        ))}
      </div>

      {level === 1 && gamePhase === 'playing' && (
        <div className="hint-bar">Tap adjacent tile to move • Long press to peek (-1s)</div>
      )}

      {gamePhase === 'gameover' && (
        <GameOverModal
          level={level}
          seeds={levelSeeds}
          skinId={finalSkin}
          onRetry={() => initLevel(level)}
          onHome={onBack}
        />
      )}

      {gamePhase === 'levelcomplete' && (
        <LevelClearModal
          level={level}
          seeds={levelSeeds}
          timeLeft={levelTimeLeft}
          skinId={finalSkin}
          tileSeedsCollected={tileSeedsCollected}
          baseLevelReward={baseLevelReward}
          petBonusSeeds={petBonusSeeds}
          skillBonusSeeds={skillBonusSeeds}
          multiplierBonusSeeds={multiplierBonusSeeds}
          eggFound={eggFound}
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
            { heading: 'Peek', text: 'Long press a hidden tile to briefly reveal it. Costs 1 second of time.' },
            { heading: 'Timer', text: 'Complete the level before time runs out. Powerups can extend your time.' },
            { heading: 'Checkpoint', text: 'Reach the flag tile to complete the level and earn seeds.' },
          ]}
        />
      )}
    </div>
  );
}
