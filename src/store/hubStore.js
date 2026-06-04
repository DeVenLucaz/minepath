// Hub Store - Handles Sanctuary buildings and Hatchery

const STORAGE_KEYS = {
  BUILDINGS: 'minepath_hub_buildings',
  HATCHERY_EGGS: 'minepath_hatchery_eggs',
  LAST_COLLECT: 'minepath_hub_last_collect',
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

  // Passive Income (Silo)
  getLastCollect() { return safeGet(STORAGE_KEYS.LAST_COLLECT, Date.now()); },
  collectPassiveIncome() {
    const now = Date.now();
    const last = this.getLastCollect();
    const buildings = this.getBuildings();
    const siloLvl = buildings.silo || 0;
    
    if (siloLvl === 0 || now <= last) {
      safeSet(STORAGE_KEYS.LAST_COLLECT, now);
      return 0;
    }

    const hours = Math.min(24, (now - last) / (1000 * 60 * 60)); // Cap at 24h to prevent extreme exploits
    const amount = Math.floor(hours * siloLvl * 10); // 10 seeds per hour per level
    
    if (amount > 0) {
      safeSet(STORAGE_KEYS.LAST_COLLECT, now);
    }
    return amount;
  },

  // Hatchery: [{ eggId, hatchTime, status: 'incubating' | 'ready' }]
  getEggs() { return safeGet(STORAGE_KEYS.HATCHERY_EGGS, []); },
  addEgg(eggType) {
    const eggs = this.getEggs();
    const buildings = this.getBuildings();
    const nestLvl = buildings.nest || 0;
    
    // Tiered base times: Brown (2h), Blue (4h), Golden (6h)
    let baseHours = 2;
    if (eggType === 'blue_egg') baseHours = 4;
    else if (eggType === 'golden_egg') baseHours = 6;

    const baseTimeMs = 3600 * 1000 * baseHours;
    const reduction = 1 - (nestLvl * 0.15);
    const hatchTime = Date.now() + (baseTimeMs * Math.max(0.1, reduction));

    eggs.push({ eggType, hatchTime, status: 'incubating' });
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
