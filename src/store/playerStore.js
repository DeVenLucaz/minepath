// Player Store - Handles progression, currency, and XP

const STORAGE_KEYS = {
  SEEDS: 'minepath_seeds',
  BEST_LEVEL: 'minepath_best_level',
  LEADERBOARD: 'minepath_leaderboard',
  TUTORIAL_COMPLETE: 'minepath_tutorial_complete',
  ACHIEVEMENTS: 'minepath_achievements',
  DAILY_CHALLENGE: 'minepath_daily_challenge',
  XP: 'minepath_xp',
  LEVEL: 'minepath_level',
  FEATHERS: 'minepath_feathers',
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

export const playerStore = {
  // --- Basic Progression ---
  getSeeds() { return safeGet(STORAGE_KEYS.SEEDS, 0); },
  setSeeds(val) { safeSet(STORAGE_KEYS.SEEDS, val); },
  addSeeds(amt) {
    const cur = this.getSeeds();
    this.setSeeds(cur + amt);
    return cur + amt;
  },
  spendSeeds(amt) {
    const cur = this.getSeeds();
    if (cur < amt) return false;
    this.setSeeds(cur - amt);
    return true;
  },

  getBestLevel() { return safeGet(STORAGE_KEYS.BEST_LEVEL, 0); },
  updateBestLevel(lvl) {
    const best = this.getBestLevel();
    if (lvl > best) safeSet(STORAGE_KEYS.BEST_LEVEL, lvl);
  },

  // --- RPG Elements (V4) ---
  getXP() { return safeGet(STORAGE_KEYS.XP, 0); },
  addXP(amt) {
    let xp = this.getXP() + amt;
    let level = this.getPlayerLevel();
    const needed = this.getXPToNextLevel(level);
    
    if (xp >= needed) {
      xp -= needed;
      level += 1;
      this.addFeathers(1); // Gain a feather point on level up
      safeSet(STORAGE_KEYS.LEVEL, level);
    }
    safeSet(STORAGE_KEYS.XP, xp);
    return { xp, level };
  },
  getPlayerLevel() { return safeGet(STORAGE_KEYS.LEVEL, 1); },
  getXPToNextLevel(lvl) { return lvl * 100; },
  
  getFeathers() { return safeGet(STORAGE_KEYS.FEATHERS, 0); },
  addFeathers(amt) { safeSet(STORAGE_KEYS.FEATHERS, this.getFeathers() + amt); },
  spendFeathers(amt) {
    const cur = this.getFeathers();
    if (cur < amt) return false;
    safeSet(STORAGE_KEYS.FEATHERS, cur - amt);
    return true;
  },

  getSkills() { return safeGet(STORAGE_KEYS.SKILLS, []); },
  unlockSkill(skillId) {
    const skills = this.getSkills();
    if (!skills.includes(skillId)) {
      skills.push(skillId);
      safeSet(STORAGE_KEYS.SKILLS, skills);
    }
  },

  // --- Legacy / Social (kept for internal use) ---
  getLeaderboard() { return safeGet(STORAGE_KEYS.LEADERBOARD, []); },
  addLeaderboardEntry(entry) {
    const board = this.getLeaderboard();
    board.push({ ...entry, date: new Date().toLocaleDateString() });
    board.sort((a, b) => b.level - a.level);
    const top10 = board.slice(0, 10);
    safeSet(STORAGE_KEYS.LEADERBOARD, top10);
    return top10;
  },

  getAchievements() { return safeGet(STORAGE_KEYS.ACHIEVEMENTS, {}); },
  setAchievements(ach) { safeSet(STORAGE_KEYS.ACHIEVEMENTS, ach); },

  isTutorialComplete() { return safeGet(STORAGE_KEYS.TUTORIAL_COMPLETE, false); },
  setTutorialComplete(val) { safeSet(STORAGE_KEYS.TUTORIAL_COMPLETE, val); },

  getDailyChallenge() {
    const today = new Date().toDateString();
    const data = safeGet(STORAGE_KEYS.DAILY_CHALLENGE, { date: '', played: false, score: 0 });
    return data.date === today ? data : { date: today, played: false, score: 0 };
  },
  setDailyPlayed(score) {
    safeSet(STORAGE_KEYS.DAILY_CHALLENGE, { date: new Date().toDateString(), played: true, score });
  },
};
