const SETTINGS_KEY = "settings";
const CATS_KEY = "cats";
const LOG_KEY = "logs";

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) {
    const defaultSettings = {
      version: 2,

      spots: [
        {
          name: "給水器",
          method: "weight",   // weight = g計測
          init: 0,
          evap: 0,
          evapUnit: "g"
        },
        {
          name: "食器A",
          method: "volume",   // volume = ml計測
          init: 200,
          evap: 0,
          evapUnit: "ml"
        },
        {
          name: "食器B",
          method: "volume",
          init: 200,
          evap: 0,
          evapUnit: "ml"
        }
      ],

      wetProducts: []
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  const settings = JSON.parse(raw);

  if (!settings.version || settings.version < 2) {
    settings.version = 2;
    saveSettings(settings);
  }

  return settings;
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadCats() {
  return JSON.parse(localStorage.getItem(CATS_KEY) || "[]");
}

export function saveCats(cats) {
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}

export function loadLog() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

export function saveLog(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}
