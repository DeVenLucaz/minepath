// Hub Store - Handles Sanctuary buildings and Hatchery

const STORAGE_KEYS = {
  BUILDINGS: 'minepath_hub_buildings',
  HATCHERY_EGGS: 'minepath_hatchery_eggs',
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

export const hubStore = {
  // Buildings: { buildingId: level }
  getBuildings() {
    return safeGet(STORAGE_KEYS.BUILDINGS, {
      silo: 0,
      nest: 0,
      playground: 0
    });
  },
  upgradeBuilding(id) {
    const buildings = this.getBuildings();
    buildings[id] = (buildings[id] || 0) + 1;
    safeSet(STORAGE_KEYS.BUILDINGS, buildings);
    return buildings[id];
  },

  // Hatchery: [{ eggId, hatchTime, status: 'incubating' | 'ready' }]
  getEggs() { return safeGet(STORAGE_KEYS.HATCHERY_EGGS, []); },
  addEgg(eggId) {
    const eggs = this.getEggs();
    const hatchTime = Date.now() + (3600 * 1000 * 2); // 2 hours default
    eggs.push({ eggId, hatchTime, status: 'incubating' });
    safeSet(STORAGE_KEYS.HATCHERY_EGGS, eggs);
  },
  updateEggStatus(index, status) {
    const eggs = this.getEggs();
    if (eggs[index]) {
      eggs[index].status = status;
      safeSet(STORAGE_KEYS.HATCHERY_EGGS, eggs);
    }
  },
  removeEgg(index) {
    const eggs = this.getEggs();
    eggs.splice(index, 1);
    safeSet(STORAGE_KEYS.HATCHERY_EGGS, eggs);
  },
  setEggs(eggs) {
    safeSet(STORAGE_KEYS.HATCHERY_EGGS, eggs);
  }
};
