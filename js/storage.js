const SETTINGS_KEY = "settings";
const CATS_KEY = "cats";
const LOG_KEY = "logs";

/* ------------------------------
   設定（スポット・飲水源・ウェット商品）
------------------------------ */
export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);

  if (!raw) {
    // 初期設定（スポット対応）
    const defaultSettings = {
      version: 2,

      // ▼ 飲水スポット（新構造）
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

      // ▼ 従来の飲水源（後方互換のため残す）
      sources: [
        { name: "水", evap: 0, unit: "g" },
        { name: "ウェット", evap: 5, unit: "g" }
      ],

      // ▼ ウェット商品
      wetProducts: []
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  const settings = JSON.parse(raw);

  /* ▼▼▼ 後方互換処理（古い設定を新構造にアップグレード） ▼▼▼ */
  if (!settings.spots) {
    settings.spots = [];
  }
  if (!settings.wetProducts) {
    settings.wetProducts = [];
  }
  if (!settings.sources) {
    settings.sources = [];
  }

  // バージョンアップ
  if (!settings.version || settings.version < 2) {
    settings.version = 2;
    saveSettings(settings);
  }

  return settings;
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ------------------------------
   猫
------------------------------ */
export function loadCats() {
  return JSON.parse(localStorage.getItem(CATS_KEY) || "[]");
}

export function saveCats(cats) {
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}

/* ------------------------------
   記録ログ（スポット対応）
------------------------------ */
export function loadLog() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

export function saveLog(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}
