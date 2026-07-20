import { initOCR } from './ocr.js';
import { initRecord } from './record.js';
import { initChart } from './chart.js';
import { initCatCompare } from './chart-compare.js';
import { initTotalChart } from './chart-total.js';
import { initSpotTotalChart } from './chart-spot-total.js';
import { initHybridChart } from './chart-hybrid.js';
import { initDashboardAlerts } from './dashboard-alerts.js';   // ★ 追加
import { loadSettings, saveSettings, loadCats, saveCats } from './storage.js';

/* ------------------------------
   タブ切り替え
------------------------------ */
function initTabs() {
  const tabs = document.querySelectorAll(".tabs button");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabs.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");

      contents.forEach(c => {
        c.classList.remove("active");
        if (c.id === target) c.classList.add("active");
      });
    });
  });

  tabs[0].classList.add("active");
  contents[0].classList.add("active");
}

/* ------------------------------
   猫の登録
------------------------------ */
function initCatSettings() {
  const newCatName = document.getElementById("newCatName");
  const addCatBtn = document.getElementById("addCatBtn");
  const catList = document.getElementById("catList");

  function renderCats() {
    const cats = loadCats();
    catList.innerHTML = "";

    cats.forEach(cat => {
      const div = document.createElement("div");
      div.textContent = cat.name;
      catList.appendChild(div);
    });
  }

  addCatBtn.addEventListener("click", () => {
    const name = newCatName.value.trim();
    if (!name) return;

    const cats = loadCats();
    cats.push({ name });
    saveCats(cats);

    newCatName.value = "";
    renderCats();
  });

  renderCats();
}

/* ------------------------------
   飲水スポットの登録
------------------------------ */
function initSpotSettings(settings) {
  const newSpotName = document.getElementById("newSpotName");
  const newSpotMethod = document.getElementById("newSpotMethod");
  const newSpotInit = document.getElementById("newSpotInit");
  const newSpotEvap = document.getElementById("newSpotEvap");
  const newSpotEvapUnit = document.getElementById("newSpotEvapUnit");
  const addSpotBtn = document.getElementById("addSpotBtn");
  const spotList = document.getElementById("spotList");

  if (!settings.spots) {
    settings.spots = [];
    saveSettings(settings);
  }

  function renderSpots() {
    spotList.innerHTML = "";
    settings.spots.forEach(s => {
      const div = document.createElement("div");
      div.textContent =
        `${s.name}（方式: ${s.method}, 初期量: ${s.init}, 蒸発補正: ${s.evap}${s.evapUnit}）`;
      spotList.appendChild(div);
    });
  }

  addSpotBtn.addEventListener("click", () => {
    const name = newSpotName.value.trim();
    const method = newSpotMethod.value;
    const init = Number(newSpotInit.value);
    const evap = Number(newSpotEvap.value);
    const evapUnit = newSpotEvapUnit.value;

    if (!name) return;

    settings.spots.push({ name, method, init, evap, evapUnit });
    saveSettings(settings);

    newSpotName.value = "";
    newSpotInit.value = "";
    newSpotEvap.value = "";

    renderSpots();
  });

  renderSpots();
}

/* ------------------------------
   従来の飲水源（後方互換）
------------------------------ */
function initSourceSettings(settings) {
  if (!settings.sources) {
    settings.sources = [];
    saveSettings(settings);
  }
  const newSourceName = document.getElementById("newSourceName");
  const newSourceEvap = document.getElementById("newSourceEvap");
  const newSourceUnit = document.getElementById("newSourceUnit");
  const addSourceBtn = document.getElementById("addSourceBtn");
  const sourceList = document.getElementById("sourceList");

  function renderSources() {
    sourceList.innerHTML = "";
    settings.sources.forEach(src => {
      const div = document.createElement("div");
      div.textContent = `${src.name}（蒸発補正: ${src.evap}${src.unit}）`;
      sourceList.appendChild(div);
    });
  }

  addSourceBtn.addEventListener("click", () => {
    const name = newSourceName.value.trim();
    const evap = Number(newSourceEvap.value);
    const unit = newSourceUnit.value;

    if (!name) return;

    settings.sources.push({ name, evap, unit });
    saveSettings(settings);

    newSourceName.value = "";
    newSourceEvap.value = "";
    renderSources();
  });

  renderSources();
}

/* ------------------------------
   ウェット商品の登録
------------------------------ */
function initWetSettings(settings) {
  const newWetName = document.getElementById("newWetName");
  const newWetMoisture = document.getElementById("newWetMoisture");
  const addWetBtn = document.getElementById("addWetBtn");
  const wetProductList = document.getElementById("wetProductList");

  if (!settings.wetProducts) {
    settings.wetProducts = [];
    saveSettings(settings);
  }

  function renderWetProducts() {
    wetProductList.innerHTML = "";
    settings.wetProducts.forEach(p => {
      const div = document.createElement("div");
      div.textContent = `${p.name}（水分率: ${p.moisture}%）`;
      wetProductList.appendChild(div);
    });
  }

  addWetBtn.addEventListener("click", () => {
    const name = newWetName.value.trim();
    const moisture = Number(newWetMoisture.value);

    if (!name || moisture <= 0 || moisture > 100) return;

    settings.wetProducts.push({ name, moisture });
    saveSettings(settings);

    newWetName.value = "";
    newWetMoisture.value = "";
    renderWetProducts();
  });

  renderWetProducts();
}

/* ------------------------------
   異常検知の閾値設定
------------------------------ */
function initThresholdSettings(settings) {
  const upInput = document.getElementById("thresholdUpInput");
  const downInput = document.getElementById("thresholdDownInput");
  const saveBtn = document.getElementById("saveThresholdBtn");

  if (!settings.threshold) {
    settings.threshold = { up: 40, down: -40 };
    saveSettings(settings);
  }

  upInput.value = settings.threshold.up;
  downInput.value = settings.threshold.down;

  saveBtn.addEventListener("click", () => {
    const up = Number(upInput.value);
    const down = Number(downInput.value);

    if (isNaN(up) || isNaN(down)) return;

    settings.threshold.up = up;
    settings.threshold.down = down;
    saveSettings(settings);

    alert("閾値を保存しました");
  });
}

/* ------------------------------
   DOMContentLoaded
------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  const settings = await loadSettings();

  initTabs();
  initOCR();
  initRecord(settings);
  initChart(settings);
  initCatCompare(settings);
  initCatSettings();
  initSpotSettings(settings);
  initWetSettings(settings);
  initThresholdSettings(settings);
  initSpotTotalChart(settings);
  initHybridChart(settings);

  initDashboardAlerts(settings);   // ★ ダッシュボード異常警告カード
});

/* ------------------------------
   Service Worker
------------------------------ */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/neko-water/service-worker.js");
}
