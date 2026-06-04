import React from 'react';

const ChickYellow = ({ instanceId }) => (
  <g>
    {/* Thruster fire glow */}
    <path d="M44 85 L50 97 L56 85 Z" fill={`url(#pet-yellow-fire-${instanceId})`} style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
    <path d="M47 85 L50 92 L53 85 Z" fill="#FFF" />
    {/* Main Pod Body */}
    <ellipse cx="50" cy="55" rx="26" ry="22" fill={`url(#pet-yellow-body-${instanceId})`} stroke="#FBC02D" strokeWidth="1.5" />
    {/* Panel lines */}
    <path d="M28 55 Q50 63 72 55" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    <line x1="50" y1="33" x2="50" y2="44" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    {/* Glowing Blue Digital Visor */}
    <path d="M32 45 Q50 38 68 45 Q70 52 68 54 Q50 56 32 54 Z" fill={`url(#pet-cyan-visor-${instanceId})`} stroke="#00E5FF" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px #00E5FF)' }} />
    <line x1="34" y1="49.5" x2="66" y2="49.5" stroke="#FFF" strokeWidth="0.8" opacity="0.6" strokeDasharray="1,1" />
    {/* Tiny details */}
    <rect x="48" y="66" width="4" height="4" rx="1" fill="#FF1744" opacity="0.8" />
    {/* Hover stabilizer wings */}
    <ellipse cx="22" cy="62" rx="7" ry="3" fill="#F57F17" transform="rotate(-15, 22, 62)" />
    <ellipse cx="78" cy="62" rx="7" ry="3" fill="#F57F17" transform="rotate(15, 78, 62)" />
  </g>
);

const ChickBlue = ({ instanceId }) => (
  <g>
    {/* Engine glow trail */}
    <path d="M15 55 L2 55 L15 59 Z" fill={`url(#pet-blue-fire-${instanceId})`} style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
    {/* Main Fuselage */}
    <ellipse cx="50" cy="55" rx="32" ry="18" fill={`url(#pet-blue-body-${instanceId})`} stroke="#0288D1" strokeWidth="1.5" />
    {/* Glow Seams */}
    <path d="M22 55 H78" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="1" />
    {/* Neon scanner eye */}
    <circle cx="72" cy="52" r="4.5" fill="#00E5FF" style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
    <circle cx="72" cy="52" r="1.5" fill="#FFF" />
    {/* Energy wing guards */}
    <polygon points="34,42 46,26 50,42" fill="#0288D1" />
    <polygon points="34,68 46,84 50,68" fill="#0288D1" />
    {/* Jet stabilizing exhaust */}
    <circle cx="16" cy="55" r="3" fill="#37474F" />
  </g>
);

const ChickNinja = ({ instanceId }) => (
  <g>
    {/* Angular stealth wing panels */}
    <polygon points="12,74 24,44 40,78" fill="#1A1A1A" stroke="#FF1744" strokeWidth="1" />
    <polygon points="88,74 76,44 60,78" fill="#1A1A1A" stroke="#FF1744" strokeWidth="1" />
    {/* Main Core Body */}
    <polygon points="26,74 50,86 74,74 66,34 50,22 34,34" fill={`url(#pet-ninja-body-${instanceId})`} stroke="#263238" strokeWidth="1.5" />
    {/* Crimson visor scanner */}
    <polygon points="36,46 50,54 64,46 62,42 38,42" fill={`url(#pet-red-visor-${instanceId})`} stroke="#FF1744" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 4px #FF1744)' }} />
    <line x1="38" y1="44" x2="62" y2="44" stroke="#FFF" strokeWidth="1" opacity="0.8" />
    {/* Upper tactical fins */}
    <polygon points="32,28 26,10 40,22" fill="#212121" stroke="#FF1744" strokeWidth="0.8" />
    <polygon points="68,28 74,10 60,22" fill="#212121" stroke="#FF1744" strokeWidth="0.8" />
  </g>
);

const Sparky = ({ instanceId }) => (
  <g>
    {/* Hover thrust */}
    <ellipse cx="50" cy="82" rx="8" ry="3" fill="rgba(255,87,34,0.3)" style={{ filter: 'drop-shadow(0 0 3px #FF5722)' }} />
    {/* Spherical Chassis */}
    <circle cx="50" cy="55" r="24" fill={`url(#pet-orange-body-${instanceId})`} stroke="#E64A19" strokeWidth="1.5" />
    {/* Lens mount */}
    <ellipse cx="50" cy="52" rx="14" ry="10" fill="#212121" stroke="#FF5722" strokeWidth="1" />
    {/* Camera / tracking lenses (two eyes) */}
    <circle cx="44" cy="52" r="4.5" fill="#00E5FF" style={{ filter: 'drop-shadow(0 0 3px #00E5FF)' }} />
    <circle cx="44" cy="52" r="1.5" fill="#FFF" />
    <circle cx="56" cy="52" r="4.5" fill="#00E5FF" style={{ filter: 'drop-shadow(0 0 3px #00E5FF)' }} />
    <circle cx="56" cy="52" r="1.5" fill="#FFF" />
    {/* Digital pulse face wave */}
    <path d="M42 66 Q50 72 58 66" stroke="#00E5FF" strokeWidth="1.5" fill="none" style={{ filter: 'drop-shadow(0 0 2px #00E5FF)' }} />
    {/* Radar tracker dish ears */}
    <path d="M30 38 Q18 24 26 14 Q32 20 32 30" fill="#E64A19" stroke="#FF5722" strokeWidth="1" />
    <path d="M70 38 Q82 24 74 14 Q68 20 68 30" fill="#E64A19" stroke="#FF5722" strokeWidth="1" />
  </g>
);

const BunnBunn = ({ instanceId }) => (
  <g>
    {/* Pink Aura Ring */}
    <circle cx="50" cy="55" r="29" fill="none" stroke="rgba(244,143,177,0.15)" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px rgba(244,143,177,0.4))' }} />
    {/* Pod body */}
    <ellipse cx="50" cy="58" rx="24" ry="20" fill={`url(#pet-pink-body-${instanceId})`} stroke="#D81B60" strokeWidth="1.5" />
    {/* Visor shield */}
    <rect x="36" y="46" width="28" height="8" rx="2" fill="#212121" stroke="#F48FB1" strokeWidth="1" />
    <line x1="38" y1="50" x2="62" y2="50" stroke="#F48FB1" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 3px #F48FB1)' }} />
    {/* Floating neon energy ears */}
    <path d="M34 40 Q22 10 32 8 Q38 12 36 34" fill={`url(#pet-pink-ear-${instanceId})`} stroke="#F48FB1" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px #F48FB1)' }} />
    <path d="M66 40 Q78 10 68 8 Q62 12 64 34" fill={`url(#pet-pink-ear-${instanceId})`} stroke="#F48FB1" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px #F48FB1)' }} />
    {/* Sub-face led print */}
    <circle cx="50" cy="66" r="2" fill="#FF80AB" />
    <path d="M47 69 Q50 71 53 69" stroke="#FF80AB" strokeWidth="1" fill="none" />
  </g>
);

const PetSVG = ({ petId, size = 60, animClass = '', mood = 'normal' }) => {
  const instanceId = React.useId().replace(/:/g, '');
  let content = null;
  let idleClass = '';
  
  switch (petId) {
    case 'chick_yellow': 
      content = <ChickYellow instanceId={instanceId} />; 
      idleClass = 'pet-idle-wobble';
      break;
    case 'chick_blue': 
      content = <ChickBlue instanceId={instanceId} />; 
      idleClass = 'pet-idle-glide';
      break;
    case 'chick_ninja': 
      content = <ChickNinja instanceId={instanceId} />; 
      idleClass = 'pet-idle-pulse';
      break;
    case 'sparky': 
      content = <Sparky instanceId={instanceId} />; 
      idleClass = 'pet-idle-wag';
      break;
    case 'bunn_bunn': 
      content = <BunnBunn instanceId={instanceId} />; 
      idleClass = 'pet-idle-hop';
      break;
    default: content = null;
  }

  if (!content) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animClass} ${idleClass}`.trim()}
    >
      <defs>
        <radialGradient id={`pet-yellow-body-${instanceId}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFEE58" />
          <stop offset="60%" stopColor="#FDD835" />
          <stop offset="100%" stopColor="#F4511E" />
        </radialGradient>
        <linearGradient id={`pet-yellow-fire-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`pet-cyan-visor-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00838F" />
        </linearGradient>
        
        <linearGradient id={`pet-blue-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#29B6F6" />
          <stop offset="60%" stopColor="#0288D1" />
          <stop offset="100%" stopColor="#01579B" />
        </linearGradient>
        <linearGradient id={`pet-blue-fire-${instanceId}`} x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`pet-ninja-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#455A64" />
          <stop offset="60%" stopColor="#263238" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        <linearGradient id={`pet-red-visor-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="100%" stopColor="#880E4F" />
        </linearGradient>

        <radialGradient id={`pet-orange-body-${instanceId}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFAB91" />
          <stop offset="60%" stopColor="#FF7043" />
          <stop offset="100%" stopColor="#D84315" />
        </radialGradient>

        <linearGradient id={`pet-pink-body-${instanceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F48FB1" />
          <stop offset="60%" stopColor="#EC407A" />
          <stop offset="100%" stopColor="#880E4F" />
        </linearGradient>
        <linearGradient id={`pet-pink-ear-${instanceId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF80AB" />
          <stop offset="100%" stopColor="#EC407A" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {content}
    </svg>
  );
};

export default PetSVG;
