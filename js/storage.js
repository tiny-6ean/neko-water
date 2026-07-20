const LOG_KEY = "logs";

export function loadLog() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

export function saveLog(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

const CATS_KEY = "cats";

export function loadCats() {
  return JSON.parse(localStorage.getItem(CATS_KEY) || "[]");
}

export function saveCats(cats) {
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) {
    const emptySettings = {
      version: 2,
      spots: [],
      wetProducts: []
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(emptySettings));
    return emptySettings;
  }

  const settings = JSON.parse(raw);

  if (!settings.version || settings.version < 2) {
    settings.version = 2;
    saveSettings(settings);
  }

  if (!Array.isArray(settings.spots)) settings.spots = [];
  if (!Array.isArray(settings.wetProducts)) settings.wetProducts = [];

  return settings;
}
