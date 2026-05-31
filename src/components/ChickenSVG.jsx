import React from 'react';

// ─────────────────────────────────────────────
//  SKIN CONFIGS
// ─────────────────────────────────────────────
const SKIN_CONFIGS = {
  classic: {
    bodyColor: '#FFD84D',
    bodyShade: '#F5A623',
    bellyColor: '#FFF0A0',
    combColor: '#E53935',
    combShade: '#B71C1C',
    beakColor: '#FF8C00',
    eyeColor: '#2C1810',
    wingColor: '#F5A623',
    footColor: '#FF8C00',
    cheekColor: 'rgba(255,100,100,0.45)',
    accessory: null,
  },
  space: {
    bodyColor: '#B0C8E8',
    bodyShade: '#7A9EC0',
    bellyColor: '#DCF0FF',
    combColor: '#E53935',
    combShade: '#B71C1C',
    beakColor: '#FF8C00',
    eyeColor: '#1A237E',
    wingColor: '#7A9EC0',
    footColor: '#FF8C00',
    cheekColor: 'rgba(100,160,255,0.45)',
    accessory: 'helmet',
  },
  ninja: {
    bodyColor: '#2C2C2C',
    bodyShade: '#111111',
    bellyColor: '#444444',
    combColor: '#E53935',
    combShade: '#B71C1C',
    beakColor: '#FF8C00',
    eyeColor: '#FF3D00',
    wingColor: '#1A1A1A',
    footColor: '#555',
    cheekColor: 'rgba(255,50,50,0.3)',
    accessory: 'bandana',
  },
  royal: {
    bodyColor: '#9C27B0',
    bodyShade: '#6A1B9A',
    bellyColor: '#E1BEE7',
    combColor: '#E53935',
    combShade: '#B71C1C',
    beakColor: '#FF8C00',
    eyeColor: '#1A237E',
    wingColor: '#6A1B9A',
    footColor: '#FF8C00',
    cheekColor: 'rgba(200,100,255,0.45)',
    accessory: 'crown',
  },
  ghost: {
    bodyColor: '#ECEFF1',
    bodyShade: '#B0BEC5',
    bellyColor: '#FFFFFF',
    combColor: '#E53935',
    combShade: '#B71C1C',
    beakColor: '#FF8C00',
    eyeColor: '#000000',
    wingColor: '#CFD8DC',
    footColor: '#90A4AE',
    cheekColor: 'rgba(150,200,255,0.35)',
    accessory: 'ghost',
  },
};

// ─────────────────────────────────────────────
//  ACCESSORIES
// ─────────────────────────────────────────────
function Helmet() {
  return (
    <g>
      {/* Visor dome */}
      <ellipse cx="50" cy="26" rx="22" ry="20" fill="rgba(180,220,255,0.55)" stroke="#7EB5E0" strokeWidth="2.5"/>
      {/* Helmet rim */}
      <rect x="28" y="41" width="44" height="6" rx="3" fill="#7A9EC0" stroke="#5580A0" strokeWidth="1.5"/>
      {/* Reflection on visor */}
      <ellipse cx="41" cy="20" rx="5" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-20,41,20)"/>
    </g>
  );
}

function Bandana() {
  return (
    <g>
      {/* Headband */}
      <rect x="28" y="15" width="44" height="9" rx="4.5" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5"/>
      {/* Knot on side */}
      <ellipse cx="71" cy="19" rx="5" ry="4" fill="#C62828" stroke="#B71C1C" strokeWidth="1"/>
      {/* Tail ribbons */}
      <path d="M71 19 L82 14 M71 19 L82 24" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round"/>
    </g>
  );
}

function Crown() {
  return (
    <g>
      {/* Crown base */}
      <rect x="30" y="30" width="40" height="10" rx="3" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
      {/* Crown points */}
      <polygon points="30,30 38,15 46,28" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
      <polygon points="42,30 50,12 58,30" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
      <polygon points="54,30 62,15 70,30" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
      {/* Gems */}
      <circle cx="38" cy="25" r="3" fill="#FF1744"/>
      <circle cx="50" cy="22" r="3.5" fill="#2979FF"/>
      <circle cx="62" cy="25" r="3" fill="#00E676"/>
    </g>
  );
}

function GhostGlow() {
  return (
    <g opacity="0.5">
      <ellipse cx="50" cy="58" rx="26" ry="6" fill="rgba(150,200,255,0.3)"/>
    </g>
  );
}

// ─────────────────────────────────────────────
//  MOOD EYES
// ─────────────────────────────────────────────
function Eyes({ mood, eyeColor, cheekColor }) {
  if (mood === 'happy') {
    // Closed crescent eyes — celebrating
    return (
      <g>
        <path d="M38 52 Q42 47 46 52" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M54 52 Q58 47 62 52" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="40" cy="57" rx="4.5" ry="2.5" fill={cheekColor}/>
        <ellipse cx="60" cy="57" rx="4.5" ry="2.5" fill={cheekColor}/>
      </g>
    );
  }
  if (mood === 'sad') {
    // Droopy sad eyes with tears
    return (
      <g>
        {/* Left eye */}
        <ellipse cx="41" cy="51" rx="5.5" ry="6" fill="white"/>
        <ellipse cx="41" cy="52" rx="3.5" ry="4" fill={eyeColor}/>
        <circle cx="39.5" cy="50" r="1.5" fill="white" opacity="0.8"/>
        {/* Sad brow */}
        <path d="M36 45 Q41 43 46 45" stroke={eyeColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Right eye */}
        <ellipse cx="59" cy="51" rx="5.5" ry="6" fill="white"/>
        <ellipse cx="59" cy="52" rx="3.5" ry="4" fill={eyeColor}/>
        <circle cx="57.5" cy="50" r="1.5" fill="white" opacity="0.8"/>
        {/* Sad brow */}
        <path d="M54 45 Q59 43 64 45" stroke={eyeColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Tear drops */}
        <ellipse cx="39" cy="60" rx="2" ry="3" fill="#90CAF9" opacity="0.9"/>
        <ellipse cx="61" cy="60" rx="2" ry="3" fill="#90CAF9" opacity="0.9"/>
        {/* Cheeks */}
        <ellipse cx="36" cy="58" rx="5" ry="2.5" fill={cheekColor}/>
        <ellipse cx="64" cy="58" rx="5" ry="2.5" fill={cheekColor}/>
      </g>
    );
  }
  // Default — normal/idle big cute eyes
  return (
    <g>
      {/* Left eye white */}
      <ellipse cx="41" cy="50" rx="6" ry="7" fill="white"/>
      {/* Left iris */}
      <ellipse cx="41" cy="51" rx="4" ry="5" fill={eyeColor}/>
      {/* Left shine */}
      <circle cx="39" cy="48" r="2" fill="white" opacity="0.9"/>
      <circle cx="43" cy="52" r="1" fill="white" opacity="0.5"/>
      {/* Right eye white */}
      <ellipse cx="59" cy="50" rx="6" ry="7" fill="white"/>
      {/* Right iris */}
      <ellipse cx="59" cy="51" rx="4" ry="5" fill={eyeColor}/>
      {/* Right shine */}
      <circle cx="57" cy="48" r="2" fill="white" opacity="0.9"/>
      <circle cx="61" cy="52" r="1" fill="white" opacity="0.5"/>
      {/* Cheeks */}
      <ellipse cx="36" cy="57" rx="5" ry="2.5" fill={cheekColor}/>
      <ellipse cx="64" cy="57" rx="5" ry="2.5" fill={cheekColor}/>
    </g>
  );
}

// ─────────────────────────────────────────────
//  WINGS — normal / spread (happy) / droopy (sad)
// ─────────────────────────────────────────────
function Wings({ mood, wingColor }) {
  if (mood === 'happy') {
    return (
      <g>
        {/* Left wing — spread up */}
        <ellipse cx="22" cy="68" rx="14" ry="9" fill={wingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" transform="rotate(-40,22,68)"/>
        <ellipse cx="22" cy="68" rx="9" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-40,22,68)"/>
        {/* Right wing — spread up */}
        <ellipse cx="78" cy="68" rx="14" ry="9" fill={wingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" transform="rotate(40,78,68)"/>
        <ellipse cx="78" cy="68" rx="9" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(40,78,68)"/>
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g>
        {/* Left wing — drooping down */}
        <ellipse cx="25" cy="85" rx="13" ry="8" fill={wingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" transform="rotate(20,25,85)"/>
        {/* Right side — pickaxe holding wing */}
        <ellipse cx="75" cy="82" rx="13" ry="8" fill={wingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" transform="rotate(-15,75,82)"/>
      </g>
    );
  }
  // Normal — small side wings
  return (
    <g>
      <ellipse cx="24" cy="78" rx="12" ry="8" fill={wingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" transform="rotate(10,24,78)"/>
      <ellipse cx="24" cy="78" rx="7" ry="4" fill="rgba(255,255,255,0.15)" transform="rotate(10,24,78)"/>
      <ellipse cx="76" cy="78" rx="12" ry="8" fill={wingColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" transform="rotate(-10,76,78)"/>
      <ellipse cx="76" cy="78" rx="7" ry="4" fill="rgba(255,255,255,0.15)" transform="rotate(-10,76,78)"/>
    </g>
  );
}

// ─────────────────────────────────────────────
//  PICKAXE (sad/gameover only)
// ─────────────────────────────────────────────
function Pickaxe() {
  return (
    <g transform="translate(62, 72) rotate(-30)">
      {/* Handle */}
      <rect x="-2" y="0" width="4" height="24" rx="2" fill="#8B6914" stroke="#5D4307" strokeWidth="1"/>
      {/* Head */}
      <path d="M-10 -4 Q-2 -10 6 -4 L4 2 Q-2 -3 -8 2 Z" fill="#9E9E9E" stroke="#616161" strokeWidth="1"/>
      {/* Pick tip */}
      <path d="M6 -4 L14 -12 L16 -8 L8 0 Z" fill="#BDBDBD" stroke="#757575" strokeWidth="1"/>
    </g>
  );
}

// ─────────────────────────────────────────────
//  MAIN CHICKEN SVG COMPONENT
// ─────────────────────────────────────────────
export default function ChickenSVG({
  skinId = 'classic',
  mood = 'normal',   // 'normal' | 'happy' | 'sad'
  size = 120,
  style = {},
  className = '',
}) {
  const skin = SKIN_CONFIGS[skinId] || SKIN_CONFIGS.classic;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
    >
      {/* ── COMB ── */}
      <g>
        <ellipse cx="44" cy="26" rx="5" ry="8" fill={skin.combColor} stroke={skin.combShade} strokeWidth="1.5"/>
        <ellipse cx="50" cy="21" rx="5.5" ry="9" fill={skin.combColor} stroke={skin.combShade} strokeWidth="1.5"/>
        <ellipse cx="56" cy="26" rx="5" ry="8" fill={skin.combColor} stroke={skin.combShade} strokeWidth="1.5"/>
      </g>

      {/* ── WINGS (behind body) ── */}
      <Wings mood={mood} wingColor={skin.wingColor}/>

      {/* ── MAIN BODY ── */}
      <ellipse cx="50" cy="85" rx="28" ry="24" fill={skin.bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
      {/* Body shading */}
      <ellipse cx="50" cy="90" rx="20" ry="16" fill={skin.bodyShade} opacity="0.25"/>
      {/* Belly highlight */}
      <ellipse cx="50" cy="80" rx="14" ry="11" fill={skin.bellyColor} opacity="0.6"/>

      {/* ── HEAD ── */}
      <ellipse cx="50" cy="47" rx="22" ry="22" fill={skin.bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
      {/* Head shading */}
      <ellipse cx="50" cy="52" rx="16" ry="14" fill={skin.bodyShade} opacity="0.2"/>

      {/* ── ACCESSORY (on top of head) ── */}
      {skin.accessory === 'helmet' && <Helmet/>}
      {skin.accessory === 'bandana' && <Bandana/>}
      {skin.accessory === 'crown' && <Crown/>}
      {skin.accessory === 'ghost' && <GhostGlow/>}

      {/* ── EYES + CHEEKS ── */}
      <Eyes mood={mood} eyeColor={skin.eyeColor} cheekColor={skin.cheekColor}/>

      {/* ── BEAK ── */}
      <ellipse cx="50" cy="60" rx="5" ry="3.5" fill={skin.beakColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
      {/* Mouth line */}
      {mood !== 'sad' && (
        <path d="M46 61 Q50 64 54 61" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      )}
      {mood === 'sad' && (
        <path d="M46 63 Q50 60 54 63" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      )}

      {/* ── FEET ── */}
      <g fill={skin.footColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1">
        {/* Left foot */}
        <ellipse cx="40" cy="109" rx="7" ry="3.5"/>
        <line x1="34" y1="109" x2="32" y2="113" stroke={skin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="37" y1="110" x2="35" y2="115" stroke={skin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="110" x2="40" y2="116" stroke={skin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
        {/* Right foot */}
        <ellipse cx="60" cy="109" rx="7" ry="3.5"/>
        <line x1="54" y1="109" x2="52" y2="113" stroke={skin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="57" y1="110" x2="57" y2="115" stroke={skin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="62" y1="110" x2="64" y2="115" stroke={skin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* ── PICKAXE (game over only) ── */}
      {mood === 'sad' && <Pickaxe/>}

      {/* ── BODY OUTLINE (on top for crispness) ── */}
      <ellipse cx="50" cy="85" rx="28" ry="24" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1"/>
      <ellipse cx="50" cy="47" rx="22" ry="22" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1"/>
    </svg>
  );
}
