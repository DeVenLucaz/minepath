export const SKILLS = [
  // --- Path of the Scout ---
  {
    id: 'fast_peek',
    path: 'scout',
    name: 'Quick Eyes',
    description: 'Reduces Peek time cost by 50%',
    rarity: 'basic',
    cost: 2,
    icon: '👁️'
  },
  {
    id: 'wider_vision',
    path: 'scout',
    name: 'Wider Vision',
    description: 'Increases Reveal powerup range',
    rarity: 'rare',
    cost: 4,
    icon: '🔭'
  },
  {
    id: 'hazard_sense',
    path: 'scout',
    name: 'Hazard Sense',
    description: '10% chance to reveal nearby mines when stepping on safe tiles',
    rarity: 'epic',
    cost: 7,
    icon: '⚠️'
  },

  // --- Path of the Tank ---
  {
    id: 'shield_master',
    path: 'tank',
    name: 'Shield Master',
    description: 'Shields last 2 hits instead of 1',
    rarity: 'basic',
    cost: 2,
    icon: '🛡️'
  },
  {
    id: 'tough_feathers',
    path: 'tank',
    name: 'Tough Feathers',
    description: '5% chance to survive a mine hit without a shield',
    rarity: 'rare',
    cost: 4,
    icon: '🪶'
  },
  {
    id: 'blast_resistance',
    path: 'tank',
    name: 'Blast Resistance',
    description: 'Mining a mine only consumes 50% of the remaining time instead of game over (once per run)',
    rarity: 'epic',
    cost: 7,
    icon: '💥'
  },

  // --- Path of the Merchant ---
  {
    id: 'seed_finder',
    path: 'merchant',
    name: 'Seed Finder',
    description: 'Increases Seeds found in levels by 20%',
    rarity: 'basic',
    cost: 2,
    icon: '🔍'
  },
  {
    id: 'shop_discount',
    path: 'merchant',
    name: 'Bargain Hunter',
    description: '10% discount on all shop items',
    rarity: 'rare',
    cost: 4,
    icon: '🏷️'
  },
  {
    id: 'golden_touch',
    path: 'merchant',
    name: 'Golden Touch',
    description: 'Small chance to find a Golden Seed in normal levels',
    rarity: 'epic',
    cost: 7,
    icon: '✨'
  },

  // --- Path of the Skin ---
  // Space Chicken
  {
    id: 'space_zero_gravity',
    path: 'skin',
    skinId: 'space',
    name: 'Zero Gravity',
    description: '15% chance mine does not trigger when stepped on',
    rarity: 'basic',
    cost: 5,
    icon: '🌌'
  },
  {
    id: 'space_orbit_scan',
    path: 'skin',
    skinId: 'space',
    name: 'Orbit Scan',
    description: 'Reveal powerup reveals 2 extra tiles',
    rarity: 'rare',
    cost: 8,
    icon: '🔭'
  },
  {
    id: 'space_warp_step',
    path: 'skin',
    skinId: 'space',
    name: 'Warp Step',
    description: 'Once per run, teleport to any revealed tile',
    rarity: 'epic',
    cost: 12,
    icon: '⚡'
  },
  // Ninja Chicken
  {
    id: 'ninja_shadow_step',
    path: 'skin',
    skinId: 'ninja',
    name: 'Shadow Step',
    description: 'First step on any hidden tile is always safe',
    rarity: 'basic',
    cost: 7,
    icon: '🥷'
  },
  {
    id: 'ninja_smoke_bomb',
    path: 'skin',
    skinId: 'ninja',
    name: 'Smoke Bomb',
    description: 'Long press peek costs 0 seeds once every 3 peeks',
    rarity: 'rare',
    cost: 11,
    icon: '💨'
  },
  {
    id: 'ninja_assassins_eye',
    path: 'skin',
    skinId: 'ninja',
    name: "Assassin's Eye",
    description: 'Mines show a faint shadow before being stepped on',
    rarity: 'epic',
    cost: 16,
    icon: '👁️'
  },
  // Royal Chicken
  {
    id: 'royal_decree',
    path: 'skin',
    skinId: 'royal',
    name: 'Royal Decree',
    description: '+15% seeds earned every level',
    rarity: 'basic',
    cost: 5,
    icon: '👑'
  },
  {
    id: 'royal_tax_collection',
    path: 'skin',
    skinId: 'royal',
    name: 'Tax Collection',
    description: 'Every 5 levels earn a bonus seed cache',
    rarity: 'rare',
    cost: 8,
    icon: '💰'
  },
  {
    id: 'royal_golden_crown',
    path: 'skin',
    skinId: 'royal',
    name: 'Golden Crown',
    description: 'Shop discount increases from 10% to 20%',
    rarity: 'epic',
    cost: 12,
    icon: '✨'
  },
  // Ghost Chicken
  {
    id: 'ghost_phase_through',
    path: 'skin',
    skinId: 'ghost',
    name: 'Phase Through',
    description: '20% chance to pass through a mine safely',
    rarity: 'basic',
    cost: 10,
    icon: '👻'
  },
  {
    id: 'ghost_haunting',
    path: 'skin',
    skinId: 'ghost',
    name: 'Haunting',
    description: 'Mines within 1 tile get revealed automatically',
    rarity: 'rare',
    cost: 15,
    icon: '🔮'
  },
  {
    id: 'ghost_possession',
    path: 'skin',
    skinId: 'ghost',
    name: 'Possession',
    description: 'Once per run, survive any death with 1 second of invincibility',
    rarity: 'epic',
    cost: 22,
    icon: '💀'
  }
];
