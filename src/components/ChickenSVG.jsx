import React from 'react';

// ─────────────────────────────────────────────
//  SKIN CONFIGS — Futuristic Cybernetic Gradient Configurations
// ─────────────────────────────────────────────
const SKIN_CONFIGS = {
  classic: {
    bodyColor: 'url(#classic-body)',
    bodyShade: 'url(#classic-shade)',
    bellyColor: '#FFF59D',
    combColor: 'url(#classic-comb)',
    combShade: '#B71C1C',
    beakColor: 'url(#classic-beak)',
    eyeColor: '#1A0C06',
    wingColor: 'url(#classic-wing)',
    footColor: '#FF6F00',
    cheekColor: 'rgba(255,110,110,0.3)',
    accessory: null,
  },
  space: {
    bodyColor: 'url(#space-body)',
    bodyShade: 'url(#space-shade)',
    bellyColor: 'rgba(0, 229, 255, 0.2)',
    combColor: 'url(#space-comb)',
    combShade: '#006064',
    beakColor: '#CFD8DC',
    eyeColor: '#00E5FF',
    wingColor: 'url(#space-wing)',
    footColor: '#78909C',
    cheekColor: 'rgba(0,229,255,0.15)',
    accessory: 'helmet',
  },
  ninja: {
    bodyColor: 'url(#ninja-body)',
    bodyShade: 'url(#ninja-shade)',
    bellyColor: 'rgba(255, 23, 68, 0.15)',
    combColor: 'url(#ninja-comb)',
    combShade: '#212121',
    beakColor: '#37474F',
    eyeColor: '#FF1744',
    wingColor: 'url(#ninja-wing)',
    footColor: '#212121',
    cheekColor: 'rgba(255,23,68,0.2)',
    accessory: 'bandana',
  },
  royal: {
    bodyColor: 'url(#royal-body)',
    bodyShade: 'url(#royal-shade)',
    bellyColor: 'rgba(255, 215, 0, 0.25)',
    combColor: 'url(#royal-comb)',
    combShade: '#4A148C',
    beakColor: 'url(#royal-gold)',
    eyeColor: '#FFE082',
    wingColor: 'url(#royal-wing)',
    footColor: '#FFB300',
    cheekColor: 'rgba(224,64,251,0.2)',
    accessory: 'crown',
  },
  ghost: {
    bodyColor: 'url(#ghost-body)',
    bodyShade: 'url(#ghost-shade)',
    bellyColor: 'rgba(255,255,255,0.2)',
    combColor: 'url(#ghost-comb)',
    combShade: '#CFD8DC',
    beakColor: '#90A4AE',
    eyeColor: '#80DEEA',
    wingColor: 'url(#ghost-wing)',
    footColor: '#B0BEC5',
    cheekColor: 'rgba(0,229,255,0.25)',
    accessory: 'ghost',
  },
};

// ─────────────────────────────────────────────
//  ACCESSORIES
// ─────────────────────────────────────────────
function Helmet({ instanceId }) {
  return (
    <g>
      {/* Cyber helmet dome glow */}
      <ellipse cx="50" cy="47" rx="24" ry="24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeDasharray="3,3" opacity="0.8" />
      {/* Visor shield */}
      <path d="M30 40 Q50 25 70 40 Q75 55 70 60 Q50 65 30 60 Q25 55 30 40 Z" fill={`url(#space-visor-${instanceId})`} opacity="0.85" stroke="#00E5FF" strokeWidth="1.5" />
      {/* Visor sheen */}
      <path d="M35 42 C45 35 55 35 65 42" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Digital HUD line */}
      <line x1="33" y1="52" x2="67" y2="52" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="1" strokeDasharray="2,2" />
      {/* Scanner target box */}
      <rect x="47" y="49" width="6" height="6" fill="none" stroke="#FF1744" strokeWidth="0.8" opacity="0.7" />
    </g>
  );
}

function Bandana() {
  return (
    <g>
      {/* Stealth Headband */}
      <rect x="27" y="36" width="46" height="10" rx="3" fill="#1A1A1A" stroke="#FF1744" strokeWidth="1.5" />
      {/* Red neon visor line */}
      <line x1="29" y1="41" x2="71" y2="41" stroke="#FF1744" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 4px #FF1744)' }} />
      {/* Knot ribbons on side */}
      <path d="M72 41 L84 34 M72 41 L84 46" stroke="#FF1744" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #FF1744)' }} />
      {/* Cyber mask plate covering lower face */}
      <polygon points="38,58 50,70 62,58 56,54 44,54" fill="#212121" stroke="#FF1744" strokeWidth="1" />
      {/* Ventilation slots */}
      <line x1="46" y1="60" x2="54" y2="60" stroke="#424242" strokeWidth="1.5" />
      <line x1="48" y1="64" x2="52" y2="64" stroke="#424242" strokeWidth="1.5" />
    </g>
  );
}

function Crown() {
  return (
    <g>
      {/* Glowing Crown Base */}
      <rect x="30" y="16" width="40" height="6" rx="1.5" fill="rgba(255,215,0,0.15)" stroke="#FFD54F" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.8))' }}/>
      {/* Crown Point Lines (Hologram look) */}
      <polygon points="30,16 38,2 46,14" fill="none" stroke="#FFD54F" strokeWidth="1.5"/>
      <polygon points="42,16 50,-2 58,16" fill="none" stroke="#FFD54F" strokeWidth="2"/>
      <polygon points="54,16 62,2 70,16" fill="none" stroke="#FFD54F" strokeWidth="1.5"/>
      {/* Floating Power Shards (replacing gems) */}
      <polygon points="38,0 41,3 38,6 35,3" fill="#D946EF" style={{ filter: 'drop-shadow(0 0 3px #D946EF)' }}/>
      <polygon points="50,-6 53,-3 50,0 47,-3" fill="#3B82F6" style={{ filter: 'drop-shadow(0 0 4px #3B82F6)' }}/>
      <polygon points="62,0 65,3 62,6 59,3" fill="#10B981" style={{ filter: 'drop-shadow(0 0 3px #10B981)' }}/>
    </g>
  );
}

function GhostGlow() {
  return (
    <g opacity="0.6">
      {/* Floating digital particles */}
      <circle cx="28" cy="30" r="1.5" fill="#00E5FF" />
      <circle cx="72" cy="34" r="1" fill="#00E5FF" />
      <circle cx="50" cy="20" r="2" fill="#00E5FF" />
      {/* Scanning grid lines */}
      <line x1="28" y1="47" x2="72" y2="47" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" />
      <line x1="28" y1="55" x2="72" y2="55" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" />
      <line x1="28" y1="63" x2="72" y2="63" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" />
    </g>
  );
}

// ─────────────────────────────────────────────
//  MOOD EYES
// ─────────────────────────────────────────────
function Eyes({ mood, eyeColor, cheekColor, focus = null }) {
  // Focus offsets for irises
  const shiftX = focus === 'left' ? -2 : focus === 'right' ? 2 : 0;
  const shiftY = focus === 'up' ? -1 : focus === 'down' ? 1 : 0;

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
        <ellipse cx={`${41 + shiftX}`} cy={`${52 + shiftY}`} rx="3.5" ry="4" fill={eyeColor}/>
        <circle cx={`${39.5 + shiftX}`} cy={`${50 + shiftY}`} r="1.5" fill="white" opacity="0.8"/>
        {/* Sad brow */}
        <path d="M36 45 Q41 43 46 45" stroke={eyeColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Right eye */}
        <ellipse cx="59" cy="51" rx="5.5" ry="6" fill="white"/>
        <ellipse cx={`${59 + shiftX}`} cy={`${52 + shiftY}`} rx="3.5" ry="4" fill={eyeColor}/>
        <circle cx={`${57.5 + shiftX}`} cy={`${50 + shiftY}`} r="1.5" fill="white" opacity="0.8"/>
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
  if (mood === 'scared') {
    return (
      <g>
        {/* Shocked wide eyes */}
        <ellipse cx="41" cy="51" rx="6.5" ry="6.5" fill="white" stroke="#E0F7FA" strokeWidth="1" />
        <circle cx="41" cy="51" r="2.5" fill={eyeColor} />
        <circle cx="39.5" cy="49.5" r="1" fill="white" />
        
        <ellipse cx="59" cy="51" rx="6.5" ry="6.5" fill="white" stroke="#E0F7FA" strokeWidth="1" />
        <circle cx="59" cy="51" r="2.5" fill={eyeColor} />
        <circle cx="57.5" cy="49.5" r="1" fill="white" />
        
        {/* Trembling wavy brows */}
        <path d="M35 43 Q41 46 47 43" stroke={eyeColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M53 43 Q59 46 65 43" stroke={eyeColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Sweat droplets */}
        <path d="M28 48 Q26 53 28 55 Q30 53 28 48" fill="#80DEEA" opacity="0.9" style={{ animation: 'sweat-drip 1.2s infinite', transformOrigin: 'center top' }} />
        <path d="M72 48 Q74 53 72 55 Q70 53 72 48" fill="#80DEEA" opacity="0.9" style={{ animation: 'sweat-drip 1.2s 0.4s infinite', transformOrigin: 'center top' }} />
      </g>
    );
  }
  // Default — normal/idle big cute eyes
  return (
    <g>
      {/* Left eye white */}
      <ellipse cx="41" cy="50" rx="6" ry="7" fill="white"/>
      {/* Left iris */}
      <ellipse cx={`${41 + shiftX}`} cy={`${51 + shiftY}`} rx="4" ry="5" fill={eyeColor}/>
      {/* Left shine */}
      <circle cx={`${39 + shiftX}`} cy={`${48 + shiftY}`} r="2" fill="white" opacity="0.9"/>
      <circle cx={`${43 + shiftX}`} cy={`${52 + shiftY}`} r="1" fill="white" opacity="0.5"/>
      {/* Right eye white */}
      <ellipse cx="59" cy="50" rx="6" ry="7" fill="white"/>
      {/* Right iris */}
      <ellipse cx={`${59 + shiftX}`} cy={`${51 + shiftY}`} rx="4" ry="5" fill={eyeColor}/>
      {/* Right shine */}
      <circle cx={`${57 + shiftX}`} cy={`${48 + shiftY}`} r="2" fill="white" opacity="0.9"/>
      <circle cx={`${61 + shiftX}`} cy={`${52 + shiftY}`} r="1" fill="white" opacity="0.5"/>
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
  animClass = '',
  focus = null,
}) {
  const instanceId = React.useId().replace(/:/g, '');
  const skin = SKIN_CONFIGS[skinId] || SKIN_CONFIGS.classic;

  const resolveColor = (colorStr) => {
    if (typeof colorStr === 'string' && colorStr.startsWith('url(#') && colorStr.endsWith(')')) {
      const gradId = colorStr.slice(5, -1);
      return `url(#${gradId}-${instanceId})`;
    }
    return colorStr;
  };

  const resolvedSkin = {
    ...skin,
    bodyColor: resolveColor(skin.bodyColor),
    bodyShade: resolveColor(skin.bodyShade),
    bellyColor: resolveColor(skin.bellyColor),
    combColor: resolveColor(skin.combColor),
    combShade: resolveColor(skin.combShade),
    beakColor: resolveColor(skin.beakColor),
    wingColor: resolveColor(skin.wingColor),
    footColor: resolveColor(skin.footColor),
    cheekColor: resolveColor(skin.cheekColor),
  };

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', ...style }}
      className={`${className} ${animClass}`.trim()}
    >
      <defs>
        {/* Classic Gradients */}
        <radialGradient id={`classic-body-${instanceId}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF59D" />
          <stop offset="50%" stopColor="#FBC02D" />
          <stop offset="100%" stopColor="#F57F17" />
        </radialGradient>
        <radialGradient id={`classic-shade-${instanceId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F57F17" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E65100" stopOpacity="0.8" />
        </radialGradient>
        <linearGradient id={`classic-wing-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
        <linearGradient id={`classic-comb-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF5252" />
          <stop offset="100%" stopColor="#D32F2F" />
        </linearGradient>
        <linearGradient id={`classic-beak-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF6F00" />
        </linearGradient>

        {/* Space Gradients */}
        <linearGradient id={`space-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="60%" stopColor="#CFD8DC" />
          <stop offset="100%" stopColor="#78909C" />
        </linearGradient>
        <linearGradient id={`space-shade-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78909C" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#455A64" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`space-wing-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90A4AE" />
          <stop offset="100%" stopColor="#546E7A" />
        </linearGradient>
        <linearGradient id={`space-comb-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00838F" />
        </linearGradient>
        <linearGradient id={`space-visor-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="40%" stopColor="#0097A7" />
          <stop offset="100%" stopColor="#006064" />
        </linearGradient>

        {/* Ninja Gradients */}
        <linearGradient id={`ninja-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#37474F" />
          <stop offset="60%" stopColor="#212121" />
          <stop offset="100%" stopColor="#0F0F0F" />
        </linearGradient>
        <linearGradient id={`ninja-shade-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E1E1E" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`ninja-wing-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#263238" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        <linearGradient id={`ninja-comb-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="100%" stopColor="#B71C1C" />
        </linearGradient>

        {/* Royal Gradients */}
        <linearGradient id={`royal-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D500F9" />
          <stop offset="60%" stopColor="#7B1FA2" />
          <stop offset="100%" stopColor="#4A148C" />
        </linearGradient>
        <linearGradient id={`royal-shade-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7B1FA2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#310D5E" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`royal-wing-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#AA00FF" />
          <stop offset="100%" stopColor="#6A1B9A" />
        </linearGradient>
        <linearGradient id={`royal-comb-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>
        <linearGradient id={`royal-gold-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>

        {/* Ghost Gradients */}
        <linearGradient id={`ghost-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(224,247,250,0.8)" />
          <stop offset="60%" stopColor="rgba(128,222,234,0.4)" />
          <stop offset="100%" stopColor="rgba(0,172,193,0.15)" />
        </linearGradient>
        <linearGradient id={`ghost-shade-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,188,212,0.2)" />
          <stop offset="100%" stopColor="rgba(0,96,100,0.5)" />
        </linearGradient>
        <linearGradient id={`ghost-wing-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(178,235,242,0.6)" />
          <stop offset="100%" stopColor="rgba(0,150,136,0.1)" />
        </linearGradient>
        <linearGradient id={`ghost-comb-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,229,255,0.7)" />
          <stop offset="100%" stopColor="rgba(0,184,212,0.2)" />
        </linearGradient>
      </defs>
      {/* ── DYNAMIC SHADOW ── */}
      <ellipse 
        cx="50" cy="112" rx="20" ry="4" 
        fill="rgba(0,0,0,0.4)" 
        style={{ 
          animation: mood === 'sad' ? 'none' : 'dynamicShadow 0.9s infinite alternate ease-in-out',
          transformOrigin: 'center center'
        }}
      />

      <g style={{ animation: mood === 'sad' ? 'none' : 'squashStretch 0.9s infinite alternate ease-in-out', transformOrigin: 'center bottom' }}>
        {/* ── COMB ── */}
        <g>
          <ellipse cx="44" cy="26" rx="5" ry="8" fill={resolvedSkin.combColor} stroke={resolvedSkin.combShade} strokeWidth="1.5"/>
          <ellipse cx="50" cy="21" rx="5.5" ry="9" fill={resolvedSkin.combColor} stroke={resolvedSkin.combShade} strokeWidth="1.5"/>
          <ellipse cx="56" cy="26" rx="5" ry="8" fill={resolvedSkin.combColor} stroke={resolvedSkin.combShade} strokeWidth="1.5"/>
        </g>

        {/* ── WINGS (behind body) ── */}
        <Wings mood={mood} wingColor={resolvedSkin.wingColor}/>

        {/* ── MAIN BODY ── */}
        <ellipse cx="50" cy="85" rx="28" ry="24" fill={resolvedSkin.bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
        {/* Body shading */}
        <ellipse cx="50" cy="90" rx="20" ry="16" fill={resolvedSkin.bodyShade} opacity="0.25"/>
        {/* Rim Light for depth */}
        <ellipse cx="40" cy="75" rx="10" ry="6" fill="white" opacity="0.2" transform="rotate(-15, 40, 75)"/>
        {/* Belly highlight */}
        <ellipse cx="50" cy="80" rx="14" ry="11" fill={resolvedSkin.bellyColor} opacity="0.6"/>

        {/* ── HEAD ── */}
        <ellipse cx="50" cy="47" rx="22" ry="22" fill={resolvedSkin.bodyColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5"/>
        {/* Head shading */}
        <ellipse cx="50" cy="52" rx="16" ry="14" fill={resolvedSkin.bodyShade} opacity="0.2"/>
        {/* Rim Light for depth */}
        <ellipse cx="40" cy="37" rx="8" ry="5" fill="white" opacity="0.2" transform="rotate(-15, 40, 37)"/>

        {/* ── EYES + CHEEKS ── */}
        <Eyes mood={mood} eyeColor={resolvedSkin.eyeColor} cheekColor={resolvedSkin.cheekColor} focus={focus}/>

        {/* ── ACCESSORY (on top of head) ── */}
        {resolvedSkin.accessory === 'helmet' && <Helmet instanceId={instanceId}/>}
        {resolvedSkin.accessory === 'bandana' && <Bandana/>}
        {resolvedSkin.accessory === 'crown' && <Crown/>}
        {resolvedSkin.accessory === 'ghost' && <GhostGlow/>}

        {/* ── BEAK ── */}
        <ellipse cx="50" cy="60" rx="5" ry="3.5" fill={resolvedSkin.beakColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
        {/* Mouth line */}
        {mood === 'scared' ? (
          <path d="M45 62 Q47.5 60.5 50 62.5 Q52.5 60.5 55 62" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        ) : mood === 'sad' ? (
          <path d="M46 63 Q50 60 54 63" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        ) : (
          <path d="M46 61 Q50 64 54 61" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        )}

        {/* ── FEET ── */}
        <g fill={resolvedSkin.footColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1">
          {/* Left foot */}
          <ellipse cx="40" cy="109" rx="7" ry="3.5"/>
          <line x1="34" y1="109" x2="32" y2="113" stroke={resolvedSkin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="37" y1="110" x2="35" y2="115" stroke={resolvedSkin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="40" y1="110" x2="40" y2="116" stroke={resolvedSkin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Right foot */}
          <ellipse cx="60" cy="109" rx="7" ry="3.5"/>
          <line x1="54" y1="109" x2="52" y2="113" stroke={resolvedSkin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="57" y1="110" x2="57" y2="115" stroke={resolvedSkin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="62" y1="110" x2="64" y2="115" stroke={resolvedSkin.footColor} strokeWidth="2.5" strokeLinecap="round"/>
        </g>

        {/* ── PICKAXE (game over only) ── */}
        {mood === 'sad' && <Pickaxe/>}

        {/* ── BODY OUTLINE (on top for crispness) ── */}
        <ellipse cx="50" cy="85" rx="28" ry="24" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1"/>
        <ellipse cx="50" cy="47" rx="22" ry="22" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1"/>
      </g>
    </svg>
  );
}
