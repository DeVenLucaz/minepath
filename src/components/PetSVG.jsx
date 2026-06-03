import React from 'react';

const ChickYellow = () => (
  <g>
    {/* Tiny Body */}
    <ellipse cx="50" cy="75" rx="20" ry="15" fill="#FDD835" />
    {/* Oversized Head */}
    <circle cx="50" cy="45" r="30" fill="#FDD835" />
    {/* Eyes */}
    <circle cx="40" cy="40" r="5" fill="#000" />
    <circle cx="40.5" cy="38.5" r="2" fill="#FFF" />
    <circle cx="60" cy="40" r="5" fill="#000" />
    <circle cx="60.5" cy="38.5" r="2" fill="#FFF" />
    {/* Tiny Beak */}
    <polygon points="48,50 52,50 50,55" fill="#FFB300" />
    {/* Stub Wings */}
    <ellipse cx="28" cy="55" rx="6" ry="4" fill="#FBC02D" transform="rotate(-20, 28, 55)" />
    <ellipse cx="72" cy="55" rx="6" ry="4" fill="#FBC02D" transform="rotate(20, 72, 55)" />
  </g>
);

const ChickBlue = () => (
  <g transform="rotate(-10, 50, 50)">
    {/* Body */}
    <ellipse cx="50" cy="55" rx="35" ry="25" fill="#29B6F6" />
    {/* Belly Streak */}
    <ellipse cx="50" cy="65" rx="25" ry="10" fill="#E1F5FE" opacity="0.6" />
    {/* Sharp Beak */}
    <polygon points="80,55 95,58 80,62" fill="#FFB300" />
    {/* Tail Feather */}
    <path d="M20 50 L5 40 L20 60 Z" fill="#039BE5" />
    {/* Eyes */}
    <circle cx="65" cy="50" r="3" fill="#000" />
  </g>
);

const ChickNinja = () => (
  <g>
    {/* Angular Body */}
    <path d="M20 80 L50 90 L80 80 L70 30 L50 20 L30 30 Z" fill="#2C2C2C" stroke="#111" strokeWidth="1" />
    {/* Shading */}
    <path d="M50 20 L70 30 L80 80 L50 90 Z" fill="#111" opacity="0.3" />
    {/* Glowing Red Eyes */}
    <ellipse cx="38" cy="45" rx="6" ry="4" fill="#FF3D00" />
    <ellipse cx="62" cy="45" rx="6" ry="4" fill="#FF3D00" />
    {/* Sharp Ears */}
    <polygon points="30,30 25,10 40,23" fill="#2C2C2C" />
    <polygon points="70,30 75,10 60,23" fill="#2C2C2C" />
  </g>
);

const Sparky = () => (
  <g>
    {/* Jagged Body Path */}
    <path d="M50 25 Q65 25 75 35 T85 60 T65 85 T35 85 T15 60 T25 35 T50 25 Z" fill="#FF8A65" stroke="#E64A19" strokeWidth="1" />
    {/* Floppy Ears */}
    <path d="M30 30 L20 10 L40 25 Z" fill="#E64A19" /> {/* Up */}
    <path d="M70 30 Q85 45 70 55 Z" fill="#E64A19" /> {/* Floppy down */}
    {/* Eyes */}
    <circle cx="40" cy="50" r="4" fill="#000" />
    <circle cx="60" cy="50" r="4" fill="#000" />
    {/* Tongue */}
    <path d="M48 65 Q50 80 55 65 Z" fill="#FF80AB" />
    {/* Happy Mouth */}
    <path d="M42 62 Q50 68 58 62" stroke="#000" strokeWidth="1.5" fill="none" />
    {/* Stubby Tail */}
    <path d="M15 60 L5 55 L10 65 Z" fill="#FF8A65" />
  </g>
);

const BunnBunn = () => (
  <g>
    {/* Round Body */}
    <circle cx="50" cy="65" r="30" fill="#F48FB1" />
    {/* White Belly */}
    <ellipse cx="50" cy="75" rx="18" ry="12" fill="#FFF" opacity="0.4" />
    {/* Floppy Ears */}
    <ellipse cx="35" cy="40" rx="8" ry="25" fill="#F48FB1" transform="rotate(-15, 35, 40)" />
    <ellipse cx="65" cy="40" rx="8" ry="25" fill="#F48FB1" transform="rotate(15, 65, 40)" />
    {/* Eyes */}
    <circle cx="42" cy="60" r="4" fill="#000" />
    <circle cx="58" cy="60" r="4" fill="#000" />
    {/* Nose & Mouth */}
    <circle cx="50" cy="66" r="2" fill="#D81B60" />
    <path d="M48 70 Q50 73 52 70" stroke="#D81B60" strokeWidth="1" fill="none" />
    {/* Fluffy Tail */}
    <circle cx="75" cy="80" r="6" fill="#FFF" />
  </g>
);

const PetSVG = ({ petId, size = 60, animClass = '', mood = 'normal' }) => {
  let content = null;
  let idleClass = '';
  
  switch (petId) {
    case 'chick_yellow': 
      content = <ChickYellow />; 
      idleClass = 'pet-idle-wobble';
      break;
    case 'chick_blue': 
      content = <ChickBlue />; 
      idleClass = 'pet-idle-glide';
      break;
    case 'chick_ninja': 
      content = <ChickNinja />; 
      idleClass = 'pet-idle-pulse';
      break;
    case 'sparky': 
      content = <Sparky />; 
      idleClass = 'pet-idle-wag';
      break;
    case 'bunn_bunn': 
      content = <BunnBunn />; 
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
      className={`${idleClass} ${animClass}`.trim()}
      style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes pet-idle-wobble { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
        @keyframes pet-idle-glide { 0%, 100% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }
        @keyframes pet-idle-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes pet-idle-wag { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes pet-idle-hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        
        @keyframes pet-bonus-yeller { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-20deg); } 75% { transform: rotate(20deg); } }
        @keyframes pet-bonus-bluey { 0% { transform: scaleX(1.3); } 100% { transform: scaleX(1); } }
        @keyframes pet-bonus-shadow { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
        @keyframes pet-bonus-sparky { 0% { transform: translateY(0) scaleX(1); } 50% { transform: translateY(-15px) scaleX(1.2); } 100% { transform: translateY(0) scaleX(1); } }
        @keyframes pet-bonus-bunn { 0% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(-12px) scaleY(1.3); } 100% { transform: translateY(0) scaleY(1); } }

        .pet-idle-wobble { animation: pet-idle-wobble 1.2s ease-in-out infinite; }
        .pet-idle-glide { animation: pet-idle-glide 2s ease-in-out infinite; }
        .pet-idle-pulse { animation: pet-idle-pulse 1.5s ease-in-out infinite; }
        .pet-idle-wag { animation: pet-idle-wag 0.4s ease-in-out infinite; }
        .pet-idle-hop { animation: pet-idle-hop 1.8s ease-in-out infinite; }

        .pet-bonus-yeller { animation: pet-bonus-yeller 0.1s ease-in-out 4; }
        .pet-bonus-bluey { animation: pet-bonus-bluey 0.3s ease-out 1; }
        .pet-bonus-shadow { animation: pet-bonus-shadow 0.3s ease-in-out 1; }
        .pet-bonus-sparky { animation: pet-bonus-sparky 0.4s ease-out 1; }
        .pet-bonus-bunn { animation: pet-bonus-bunn 0.5s ease-out 1; }
      `}</style>
      
      {/* ── DYNAMIC SHADOW ── */}
      <ellipse 
        cx="50" cy="92" rx="25" ry="5" 
        fill="rgba(0,0,0,0.35)"
        style={{ animation: 'dynamicShadow 1.2s infinite alternate ease-in-out', transformOrigin: 'center center' }}
      />
      
      <g style={{ animation: mood === 'sad' ? 'none' : 'squashStretch 1.2s infinite alternate ease-in-out', transformOrigin: 'center bottom' }}>
        {content}
        {/* Rim Light Overlay */}
        <g opacity="0.15">
           <circle cx="35" cy="35" r="15" fill="white" />
        </g>
      </g>
    </svg>
  );
};

export default PetSVG;
