export const SKILLS = [
  // --- Path of the Scout ---
  {
    id: 'fast_peek',
    path: 'scout',
    name: 'Quick Eyes',
    description: 'Reduces Peek time cost by 50%',
    cost: 1,
    icon: '👁️'
  },
  {
    id: 'wider_vision',
    path: 'scout',
    name: 'Wider Vision',
    description: 'Increases Reveal powerup range',
    cost: 2,
    icon: '🔭'
  },
  {
    id: 'hazard_sense',
    path: 'scout',
    name: 'Hazard Sense',
    description: '10% chance to reveal nearby mines when stepping on safe tiles',
    cost: 3,
    icon: '⚠️'
  },

  // --- Path of the Tank ---
  {
    id: 'shield_master',
    path: 'tank',
    name: 'Shield Master',
    description: 'Shields last 2 hits instead of 1',
    cost: 1,
    icon: '🛡️'
  },
  {
    id: 'tough_feathers',
    path: 'tank',
    name: 'Tough Feathers',
    description: '5% chance to survive a mine hit without a shield',
    cost: 2,
    icon: '🪶'
  },
  {
    id: 'blast_resistance',
    path: 'tank',
    name: 'Blast Resistance',
    description: 'Mining a mine only consumes 50% of the remaining time instead of game over (once per run)',
    cost: 3,
    icon: '💥'
  },

  // --- Path of the Merchant ---
  {
    id: 'seed_finder',
    path: 'merchant',
    name: 'Seed Finder',
    description: 'Increases Seeds found in levels by 20%',
    cost: 1,
    icon: '🔍'
  },
  {
    id: 'shop_discount',
    path: 'merchant',
    name: 'Bargain Hunter',
    description: '10% discount on all shop items',
    cost: 2,
    icon: '🏷️'
  },
  {
    id: 'golden_touch',
    path: 'merchant',
    name: 'Golden Touch',
    description: 'Small chance to find a Golden Seed in normal levels',
    cost: 3,
    icon: '✨'
  }
];
