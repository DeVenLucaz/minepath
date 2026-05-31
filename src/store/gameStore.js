// Game Store - localStorage persistence layer

const STORAGE_KEYS = {
  SEEDS: 'minepath_seeds',
  UNLOCKED_SKINS: 'minepath_unlocked_skins',
  UNLOCKED_TILES: 'minepath_unlocked_tiles',
  UNLOCKED_TRAILS: 'minepath_unlocked_trails',
  EQUIPPED_SKIN: 'minepath_equipped_skin',
  EQUIPPED_TILE: 'minepath_equipped_tile',
  EQUIPPED_TRAIL: 'minepath_equipped_trail',
  BEST_LEVEL: 'minepath_best_level',
  LEADERBOARD: 'minepath_leaderboard',
  SETTINGS: 'minepath_settings',
  TUTORIAL_COMPLETE: 'minepath_tutorial_complete',
  ACHIEVEMENTS: 'minepath_achievements',
  DAILY_CHALLENGE: 'minepath_daily_challenge',
  UNLOCKED_PETS: 'minepath_unlocked_pets',
  EQUIPPED_PET: 'minepath_equipped_pet',
};

function safeGet(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    if (val === null || val === 'undefined' || val === 'null') return defaultVal;
    const parsed = JSON.parse(val);
    return parsed !== null && parsed !== undefined ? parsed : defaultVal;
  } catch {
    return defaultVal;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export const gameStore = {
  getSettings() {
    return safeGet(STORAGE_KEYS.SETTINGS, { bgm: true, sfx: true });
  },
  setSettings(settings) {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  },

  isTutorialComplete() {
    return safeGet(STORAGE_KEYS.TUTORIAL_COMPLETE, false);
  },
  setTutorialComplete(complete) {
    safeSet(STORAGE_KEYS.TUTORIAL_COMPLETE, complete);
  },

  getAchievements() {
    return safeGet(STORAGE_KEYS.ACHIEVEMENTS, {
      earlyBird: false,
      seedHoarder: 0,
      survivor: 0,
      perfectionist: false,
    });
  },
  updateAchievement(key, val) {
    const ach = this.getAchievements();
    if (typeof val === 'boolean') ach[key] = val;
    else ach[key] += val;
    safeSet(STORAGE_KEYS.ACHIEVEMENTS, ach);
  },

  getDailyChallenge() {
    const today = new Date().toDateString();
    const data = safeGet(STORAGE_KEYS.DAILY_CHALLENGE, { date: '', played: false, score: 0 });
    if (data.date !== today) {
      return { date: today, played: false, score: 0 };
    }
    return data;
  },
  setDailyPlayed(score) {
    const today = new Date().toDateString();
    safeSet(STORAGE_KEYS.DAILY_CHALLENGE, { date: today, played: true, score });
  },

  getUnlockedPets() {
    return safeGet(STORAGE_KEYS.UNLOCKED_PETS, []);
  },
  unlockPet(id) {
    const unlocked = this.getUnlockedPets();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      safeSet(STORAGE_KEYS.UNLOCKED_PETS, unlocked);
    }
  },
  getEquippedPet() {
    return safeGet(STORAGE_KEYS.EQUIPPED_PET, null);
  },
  setEquippedPet(id) {
    safeSet(STORAGE_KEYS.EQUIPPED_PET, id);
  },

  getSeeds() {
    return safeGet(STORAGE_KEYS.SEEDS, 0);
  },
  setSeeds(amount) {
    safeSet(STORAGE_KEYS.SEEDS, amount);
  },
  addSeeds(amount) {
    const current = this.getSeeds();
    safeSet(STORAGE_KEYS.SEEDS, current + amount);
    this.updateAchievement('seedHoarder', amount);
    return current + amount;
  },
  spendSeeds(amount) {
    const current = this.getSeeds();
    if (current < amount) return false;
    safeSet(STORAGE_KEYS.SEEDS, current - amount);
    return true;
  },

  getUnlockedSkins() {
    return safeGet(STORAGE_KEYS.UNLOCKED_SKINS, ['classic']);
  },
  unlockSkin(id) {
    const unlocked = this.getUnlockedSkins();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      safeSet(STORAGE_KEYS.UNLOCKED_SKINS, unlocked);
    }
  },

  getUnlockedTiles() {
    return safeGet(STORAGE_KEYS.UNLOCKED_TILES, ['classic']);
  },
  unlockTile(id) {
    const unlocked = this.getUnlockedTiles();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      safeSet(STORAGE_KEYS.UNLOCKED_TILES, unlocked);
    }
  },

  getUnlockedTrails() {
    return safeGet(STORAGE_KEYS.UNLOCKED_TRAILS, ['none']);
  },
  unlockTrail(id) {
    const unlocked = this.getUnlockedTrails();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      safeSet(STORAGE_KEYS.UNLOCKED_TRAILS, unlocked);
    }
  },

  getEquippedSkin() {
    return safeGet(STORAGE_KEYS.EQUIPPED_SKIN, 'classic');
  },
  setEquippedSkin(id) {
    safeSet(STORAGE_KEYS.EQUIPPED_SKIN, id);
  },

  getEquippedTile() {
    return safeGet(STORAGE_KEYS.EQUIPPED_TILE, 'classic');
  },
  setEquippedTile(id) {
    safeSet(STORAGE_KEYS.EQUIPPED_TILE, id);
  },

  getEquippedTrail() {
    return safeGet(STORAGE_KEYS.EQUIPPED_TRAIL, 'none');
  },
  setEquippedTrail(id) {
    safeSet(STORAGE_KEYS.EQUIPPED_TRAIL, id);
  },

  getBestLevel() {
    return safeGet(STORAGE_KEYS.BEST_LEVEL, 0);
  },
  updateBestLevel(level) {
    const best = this.getBestLevel();
    if (level > best) {
      safeSet(STORAGE_KEYS.BEST_LEVEL, level);
    }
    if (level >= 5) this.updateAchievement('earlyBird', true);
  },

  getLeaderboard() {
    return safeGet(STORAGE_KEYS.LEADERBOARD, []);
  },
  addLeaderboardEntry(entry) {
    const board = this.getLeaderboard();
    board.push({ ...entry, date: new Date().toLocaleDateString() });
    board.sort((a, b) => b.level - a.level);
    const top10 = board.slice(0, 10);
    safeSet(STORAGE_KEYS.LEADERBOARD, top10);
    this.updateAchievement('survivor', 1);
    return top10;
  },
};
