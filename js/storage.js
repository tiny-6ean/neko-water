const LOG_KEY = "logs";
const CATS_KEY = "cats";
const SETTINGS_KEY = "settings";

export function loadLog() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

export function saveLog(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function loadCats() {
  return JSON.parse(localStorage.getItem(CATS_KEY) || "[]");
}

export function saveCats(cats) {
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) {
    const empty = {
      version: 2,
      spots: [],
      wetProducts: []
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(empty));
    return empty;
  }

  const settings = JSON.parse(raw);

  if (!settings.version || settings.version < 2) {
    settings.version = 2;
    saveSettings(settings);
  }

  settings.spots ??= [];
  settings.wetProducts ??= [];

  return settings;
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
