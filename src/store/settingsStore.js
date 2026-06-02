// Settings Store - Handles audio and preferences

const STORAGE_KEYS = {
  SETTINGS: 'minepath_settings',
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

export const settingsStore = {
  getSettings() {
    return safeGet(STORAGE_KEYS.SETTINGS, { bgm: true, sfx: true });
  },
  setSettings(settings) {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  },
};
