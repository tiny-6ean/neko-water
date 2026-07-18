import { initOCR } from './ocr.js';
import { initRecord } from './record.js';
import { initChart } from './chart.js';
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
   飲水源の登録（単位対応）
------------------------------ */
function initSourceSettings(settings) {
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
   DOMContentLoaded
------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  const settings = await loadSettings();

  initTabs();
  initOCR();
  initRecord(settings);   // 記録タブ（単位対応は record.js 側）
  initChart(settings);
  initCatSettings();
  initSourceSettings(settings);
});

/* ------------------------------
   Service Worker
------------------------------ */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/neko-water/service-worker.js");
}
