// Inventory Store - Handles skins, tiles, trails, and pets

const STORAGE_KEYS = {
  UNLOCKED_SKINS: 'minepath_unlocked_skins',
  UNLOCKED_TILES: 'minepath_unlocked_tiles',
  UNLOCKED_TRAILS: 'minepath_unlocked_trails',
  UNLOCKED_PETS: 'minepath_unlocked_pets',
  EQUIPPED_SKIN: 'minepath_equipped_skin',
  EQUIPPED_TILE: 'minepath_equipped_tile',
  EQUIPPED_TRAIL: 'minepath_equipped_trail',
  EQUIPPED_PET: 'minepath_equipped_pet',
  GOLDEN_MASCOT: 'minepath_golden_mascot',
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

export const inventoryStore = {
  // Skins
  getUnlockedSkins() { return safeGet(STORAGE_KEYS.UNLOCKED_SKINS, ['classic']); },
  unlockSkin(id) {
    const unlocked = this.getUnlockedSkins();
    if (!unlocked.includes(id)) safeSet(STORAGE_KEYS.UNLOCKED_SKINS, [...unlocked, id]);
  },
  getEquippedSkin() { return safeGet(STORAGE_KEYS.EQUIPPED_SKIN, 'classic'); },
  setEquippedSkin(id) { safeSet(STORAGE_KEYS.EQUIPPED_SKIN, id); },

  // Tiles
  getUnlockedTiles() { return safeGet(STORAGE_KEYS.UNLOCKED_TILES, ['classic']); },
  unlockTile(id) {
    const unlocked = this.getUnlockedTiles();
    if (!unlocked.includes(id)) safeSet(STORAGE_KEYS.UNLOCKED_TILES, [...unlocked, id]);
  },
  getEquippedTile() { return safeGet(STORAGE_KEYS.EQUIPPED_TILE, 'classic'); },
  setEquippedTile(id) { safeSet(STORAGE_KEYS.EQUIPPED_TILE, id); },

  // Trails
  getUnlockedTrails() { return safeGet(STORAGE_KEYS.UNLOCKED_TRAILS, ['none']); },
  unlockTrail(id) {
    const unlocked = this.getUnlockedTrails();
    if (!unlocked.includes(id)) safeSet(STORAGE_KEYS.UNLOCKED_TRAILS, [...unlocked, id]);
  },
  getEquippedTrail() { return safeGet(STORAGE_KEYS.EQUIPPED_TRAIL, 'none'); },
  setEquippedTrail(id) { safeSet(STORAGE_KEYS.EQUIPPED_TRAIL, id); },

  // Pets
  getUnlockedPets() { return safeGet(STORAGE_KEYS.UNLOCKED_PETS, []); },
  unlockPet(id) {
    const unlocked = this.getUnlockedPets();
    if (!unlocked.includes(id)) safeSet(STORAGE_KEYS.UNLOCKED_PETS, [...unlocked, id]);
  },
  getEquippedPet() { return safeGet(STORAGE_KEYS.EQUIPPED_PET, null); },
  setEquippedPet(id) { safeSet(STORAGE_KEYS.EQUIPPED_PET, id); },

  // Special
  hasGoldenMascot() { return safeGet(STORAGE_KEYS.GOLDEN_MASCOT, false); },
  unlockGoldenMascot() { safeSet(STORAGE_KEYS.GOLDEN_MASCOT, true); },
};
