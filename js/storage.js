export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);

  // settings が存在しない場合は「空の設定」を作る
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

  // version が古い場合だけ更新
  if (!settings.version || settings.version < 2) {
    settings.version = 2;
    saveSettings(settings);
  }

  // spots や wetProducts が存在しない古いデータにも対応
  if (!Array.isArray(settings.spots)) settings.spots = [];
  if (!Array.isArray(settings.wetProducts)) settings.wetProducts = [];

  return settings;
}
