import React from 'react';

// Common base stroke props for uniform looks
const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "w-6 h-6 inline-block"
};

export const SeedIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M12 2c0 0-4 4.5-4 8.5c0 3 2.5 5.5 4 5.5s4-2.5 4-5.5C16 6.5 12 2 12 2z" />
    <path d="M12 2v14" />
    <path d="M12 6c1.5 1.5 3 2 3 3" />
    <path d="M12 9c-1.5 1.5-3 2-3 3" />
    <path d="M12 12c1.5 1.5 3 2 3 3" />
    <path d="M12 16v6" />
  </svg>
);

export const SettingsIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const PlayIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const DailyIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1" />
    <circle cx="12" cy="14" r="1" />
    <circle cx="16" cy="14" r="1" />
    <circle cx="8" cy="18" r="1" />
    <circle cx="12" cy="18" r="1" />
    <circle cx="16" cy="18" r="1" />
  </svg>
);

export const EndlessIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    <path d="M21 9l-4-4 4-4" />
    <path d="M3 15l4 4-4 4" />
  </svg>
);

export const HubIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

export const ShopIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const SkillIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="5" r="3" />
    <circle cx="5" cy="19" r="3" />
    <circle cx="19" cy="19" r="3" />
    <path d="M12 8v8M12 16l-7 3M12 16l7 3" />
  </svg>
);

export const FeatIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

export const BackIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const ClockIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const ShieldIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const MagnetIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M18 10a6 6 0 0 0-12 0v8a2 2 0 0 0 2 2h2V12H8v-2a4 4 0 0 1 8 0v2h-2v8h2a2 2 0 0 0 2-2v-8z" />
  </svg>
);

export const SlowMoIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
    <circle cx="12" cy="12" r="6" strokeDasharray="3,3" />
  </svg>
);

export const RevealIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const DoubleScoreIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 9h3a2 2 0 1 1 0 4h-3M13 15h3a2 2 0 1 0 0-4h-3" />
  </svg>
);

export const LockIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const HelpIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ReloadIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M23 4v6h-6" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export const HomeIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const CrownIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M5 20h14" />
  </svg>
);

export const MineIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="7" />
    <line x1="12" y1="1" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="23" />
    <line x1="1" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
    <line x1="17.66" y1="4.22" x2="19.78" y2="6.34" />
  </svg>
);


export const GoalIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export const SkullIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <path d="M12 2a8 8 0 0 0-8 8v3a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3a8 8 0 0 0-8-8z" />
    <path d="M16 22v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2" />
  </svg>
);

export const AlertIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const CheckIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const TorchIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M12 2a4 4 0 0 0-4 4c0 3 4 6 4 6s4-3 4-6a4 4 0 0 0-4-4z" />
    <path d="M9 16h6v4H9z" />
    <path d="M12 12v4" />
  </svg>
);

export const DiskIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FoxIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M20 9v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9M12 13V9" />
    <path d="M4 9l8 4 8-4-4-5H8L4 9z" />
  </svg>
);

export const ScrambleIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M18 8h-4a5 5 0 0 0-5 5v3a5 5 0 0 1-5 5H3" />
    <path d="M6 8h4a5 5 0 0 1 5 5v3a5 5 0 0 0 5 5h1" />
    <polyline points="15 5 18 8 15 11" />
    <polyline points="9 21 6 18 9 15" />
  </svg>
);

export const MusicIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M9 18V5l12-2v13M9 9l12-2" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const SfxIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <rect x="2" y="9" width="4" height="6" rx="1" />
    <path d="M6 9l8-5v16l-8-5" />
    <path d="M18 8c1 1.5 1 6.5 0 8" />
  </svg>
);

export const BellIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const VibeIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
    <path d="M1 8c.5 1 1 2.5.5 4S.5 14.5 1 16M23 8c-.5 1-1 2.5-.5 4s.5 2.5-.5 4" />
  </svg>
);

export const GraduationIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5v-5" />
  </svg>
);

export const TrashIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const PawIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <circle cx="12" cy="14" r="4" />
    <circle cx="6.5" cy="8.5" r="2.5" />
    <circle cx="10" cy="5" r="2" />
    <circle cx="14" cy="5" r="2" />
    <circle cx="17.5" cy="8.5" r="2.5" />
  </svg>
);

export const StarIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const EggIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M12 2C8 2 5 7 5 12s3 10 7 10 7-5 7-10S16 2 12 2z" />
  </svg>
);

export const GemIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <polygon points="6 3 18 3 22 8 12 21 2 8 6 3" />
    <line x1="2" y1="8" x2="22" y2="8" />
    <line x1="12" y1="21" x2="6" y2="3" />
    <line x1="12" y1="21" x2="18" y2="3" />
  </svg>
);

export const GiftIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <rect x="3" y="8" width="18" height="4" />
    <path d="M12 8V22M19 12v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8" />
    <path d="M12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8z" />
    <path d="M12 8h4.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8z" />
  </svg>
);

export const CarouselIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M3 21h18M12 2v19" />
    <path d="M5 7h14l-2-4H7L5 7z" />
    <circle cx="7" cy="14" r="2" />
    <circle cx="17" cy="14" r="2" />
  </svg>
);

export const FeatherIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

export const FlameIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const SmokeIcon = ({ className = '', size = 24 }) => (
  <svg {...baseProps} className={`${baseProps.className} ${className}`} style={{ width: size, height: size }}>
    <path d="M9.66 16.03a4 4 0 0 1-2.66-3.83c0-2 1.5-3.5 3.5-3.5a4.3 4.3 0 0 1 1-.1A5 5 0 0 1 21 12c0 2.2-1.8 4-4 4H9.66z" />
    <path d="M5.5 18a3 3 0 0 1-2.5-3c0-1.4 1-2.5 2.3-2.9A4 4 0 0 1 11 11.5" />
  </svg>
);



