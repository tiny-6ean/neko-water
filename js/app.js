import { initOCR } from './ocr.js';
import { initRecord } from './record.js';
import { initChart } from './chart.js';
import { initCatCompare } from './chart-compare.js';
import { initTotalChart } from './chart-total.js';
import { initSpotTotalChart } from './chart-spot-total.js';
import { initHybridChart } from './chart-hybrid.js';
import { initDashboardAlerts } from './dashboard-alerts.js';
import { loadSettings, saveSettings, loadCats, saveCats } from './storage.js';

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
  initDashboardAlerts(settings);
});

document.addEventListener("click", e => {
  if (!e.target.classList.contains("help-icon")) return;

  const text = e.target.dataset.help;

  const tip = document.createElement("div");
  tip.className = "help-tip";
  tip.textContent = text;

  document.body.appendChild(tip);

  const rect = e.target.getBoundingClientRect();
  tip.style.left = rect.right + 8 + "px";
  tip.style.top = rect.top + "px";

  setTimeout(() => tip.remove(), 3000);
});

function renderRecordList() {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  const box = document.getElementById("recordResult");
  box.innerHTML = "";

  records.forEach((rec, index) => {
    const div = document.createElement("div");
    div.textContent = `${rec.date} / ${rec.cat} / ${rec.spot} / ${rec.amount}ml`;
    const btn = document.createElement("button");
    btn.textContent = "編集";
    btn.onclick = () => loadRecordForEdit(index);
    div.appendChild(btn);
    box.appendChild(div);
  });
}

let editingIndex = null;

function loadRecordForEdit(index) {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  const rec = records[index];
  editingIndex = index;

  document.getElementById("recordDate").value = rec.date;
  document.getElementById("catSelect").value = rec.cat;
  document.getElementById("spotSelect").value = rec.spot;
  document.getElementById("weightInput").value = rec.weight || "";
  document.getElementById("volumeInput").value = rec.volume || "";
  document.getElementById("evapInput").value = rec.evap || "";
  document.getElementById("evapUnitSelect").value = rec.evapUnit || "g";
  document.getElementById("wetProductSelect").value = rec.wetProduct || "";
  document.getElementById("wetAmountInput").value = rec.wetAmount || "";
  document.getElementById("wetAddWaterInput").value = rec.wetAddWater || "";
  document.getElementById("memoInput").value = rec.memo || "";

  document.getElementById("saveBtn").textContent = "編集を保存";

  const btn = document.getElementById("saveBtn");
  btn.textContent = "編集を保存";
  btn.style.background = "#ffcc66";

  document.getElementById("editStatus").textContent =
    `編集モード：${rec.date} / ${rec.cat} / ${rec.spot}`;
}

if (editingIndex !== null) {
  records[editingIndex] = newRec;
  editingIndex = null;

  saveBtn.textContent = "保存";
  saveBtn.style.background = "";

  document.getElementById("editStatus").textContent = "";
}

document.getElementById("saveBtn").onclick = () => {
  const records = JSON.parse(localStorage.getItem("records") || "[]");

  const newRec = {
    date: recordDate.value,
    cat: catSelect.value,
    spot: spotSelect.value,
    weight: weightInput.value,
    volume: volumeInput.value,
    evap: evapInput.value,
    evapUnit: evapUnitSelect.value,
    wetProduct: wetProductSelect.value,
    wetAmount: wetAmountInput.value,
    wetAddWater: wetAddWaterInput.value,
    memo: memoInput.value
  };

  if (editingIndex !== null) {
    // 編集モード
    records[editingIndex] = newRec;
    editingIndex = null;
    saveBtn.textContent = "保存";
  } else {
    // 新規
    records.push(newRec);
  }

  localStorage.setItem("records", JSON.stringify(records));
  renderRecordList();
};
