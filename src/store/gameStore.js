// Game Store Facade - Delegating to modular stores for V4

import { playerStore } from './playerStore';
import { inventoryStore } from './inventoryStore';
import { settingsStore } from './settingsStore';
import { hubStore } from './hubStore';
import { DEFAULT_ACHIEVEMENTS } from '../data/achievements';

export const gameStore = {
  // Settings
  getSettings() { return settingsStore.getSettings(); },
  setSettings(s) { settingsStore.setSettings(s); },

  // Tutorial
  isTutorialComplete() { return playerStore.isTutorialComplete(); },
  setTutorialComplete(c) { playerStore.setTutorialComplete(c); },

  // Achievements
  getAchievements() {
    const ach = playerStore.getAchievements();
    return Object.keys(ach).length === 0 ? DEFAULT_ACHIEVEMENTS : ach;
  },
  setAchievement(key) {
    const ach = this.getAchievements();
    if (!ach[key]) { ach[key] = true; playerStore.setAchievements(ach); }
  },
  incrementAchievement(key, amount = 1) {
    const ach = this.getAchievements();
    if (typeof ach[key] === 'number') {
      ach[key] = (ach[key] || 0) + amount;
      playerStore.setAchievements(ach);
    }
  },
  updateAchievement(key, val) {
    if (typeof val === 'boolean') this.setAchievement(key);
    else this.incrementAchievement(key, val);
  },
  claimFeat(key, reward) {
    const ach = this.getAchievements();
    if (!ach._claimed) ach._claimed = {};
    if (!ach._claimed[key]) {
      ach._claimed[key] = true;
      playerStore.setAchievements(ach);
      playerStore.addSeeds(reward);
      return true;
    }
    return false;
  },
  isFeatClaimed(key) {
    const ach = this.getAchievements();
    return !!(ach._claimed && ach._claimed[key]);
  },

  // Daily Challenge
  getDailyChallenge() { return playerStore.getDailyChallenge(); },
  setDailyPlayed(score) { playerStore.setDailyPlayed(score); },

  // Pets
  getUnlockedPets() { return inventoryStore.getUnlockedPets(); },
  getPetLevels() { return inventoryStore.getPetLevels(); },
  upgradePet(id) { return inventoryStore.upgradePet(id); },
  unlockPet(id) { inventoryStore.unlockPet(id); },
  getEquippedPet() { return inventoryStore.getEquippedPet(); },
  setEquippedPet(id) { inventoryStore.setEquippedPet(id); },

  // Seeds
  getSeeds() { return playerStore.getSeeds(); },
  setSeeds(val) { playerStore.setSeeds(val); },
  addSeeds(amt) {
    const total = playerStore.addSeeds(amt);
    this.updateAchievement('seedHoarder', amt);
    return total;
  },
  spendSeeds(amt) { return playerStore.spendSeeds(amt); },

  // Skins
  getUnlockedSkins() { return inventoryStore.getUnlockedSkins(); },
  unlockSkin(id) { inventoryStore.unlockSkin(id); },
  getEquippedSkin() { return inventoryStore.getEquippedSkin(); },
  setEquippedSkin(id) { inventoryStore.setEquippedSkin(id); },

  // Tiles
  getUnlockedTiles() { return inventoryStore.getUnlockedTiles(); },
  unlockTile(id) { inventoryStore.unlockTile(id); },
  getEquippedTile() { return inventoryStore.getEquippedTile(); },
  setEquippedTile(id) { inventoryStore.setEquippedTile(id); },

  // Trails
  getUnlockedTrails() { return inventoryStore.getUnlockedTrails(); },
  unlockTrail(id) { inventoryStore.unlockTrail(id); },
  getEquippedTrail() { return inventoryStore.getEquippedTrail(); },
  setEquippedTrail(id) { inventoryStore.setEquippedTrail(id); },

  // Best Level
  getBestLevel() { return playerStore.getBestLevel(); },
  updateBestLevel(lvl) {
    playerStore.updateBestLevel(lvl);
    if (lvl >= 5) this.updateAchievement('earlyBird', true);
  },

  // Leaderboard
  getLeaderboard() { return playerStore.getLeaderboard(); },
  addLeaderboardEntry(entry) {
    const board = playerStore.addLeaderboardEntry(entry);
    this.updateAchievement('survivor', 1);
    return board;
  },

  // Special
  hasGoldenHomeMascot() { return inventoryStore.hasGoldenMascot(); },
  unlockGoldenMascot() { inventoryStore.unlockGoldenMascot(); },

  // Hub (V4)
  getBuildings() { return hubStore.getBuildings(); },
  upgradeBuilding(id) { return hubStore.upgradeBuilding(id); },
  collectPassiveIncome() {
    const amt = hubStore.collectPassiveIncome();
    if (amt > 0) playerStore.addSeeds(amt);
    return amt;
  },
  getEggs() { return hubStore.getEggs(); },
  addEgg(id) { hubStore.addEgg(id); },
  removeEgg(index) { hubStore.removeEgg(index); },
  updateEggs(eggs) { hubStore.setEggs(eggs); },
};
