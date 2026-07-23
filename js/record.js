import { saveLog, loadLog, loadCats } from './storage.js';
import { analyzeToday, updateDashboard } from './analyze.js';

export function initRecord(settings) {
  const recordDate = document.getElementById("recordDate");

  const catSelect = document.getElementById("catSelect");
  const spotSelect = document.getElementById("spotSelect");

  const weightInput = document.getElementById("weightInput");
  const volumeInput = document.getElementById("volumeInput");

  const measureWeightBlock = document.getElementById("measureWeightBlock");
  const measureVolumeBlock = document.getElementById("measureVolumeBlock");

  const evapInput = document.getElementById("evapInput");
  const evapUnitSelect = document.getElementById("evapUnitSelect");

  const memoInput = document.getElementById("memoInput");
  const saveBtn = document.getElementById("saveBtn");
  const resultBox = document.getElementById("recordResult");

  const wetProductSelect = document.getElementById("wetProductSelect");
  const wetAmountInput = document.getElementById("wetAmountInput");
  const wetAddWaterInput = document.getElementById("wetAddWaterInput");

  let editingIndex = null;

  function renderLogList() {
    const logs = loadLog();
    resultBox.innerHTML = "";

    logs.forEach((entry, index) => {
      const div = document.createElement("div");
      div.textContent =
        `${entry.date} / ${entry.cat} / ${entry.spot}：${entry.finalDrink.toFixed(1)}ml`;

      const editBtn = document.createElement("button");
      editBtn.textContent = "編集";
      editBtn.className = "record-btn";
      editBtn.onclick = () => loadLogForEdit(index);
      div.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "削除";
      delBtn.className = "record-btn";
      delBtn.onclick = () => deleteLog(index);
      div.appendChild(delBtn);

      resultBox.appendChild(div);
    });
  }

  function loadLogForEdit(index) {
    const logs = loadLog();
    const entry = logs[index];
    editingIndex = index;

    recordDate.value = entry.date;
    catSelect.value = entry.cat;
    spotSelect.value = entry.spot;

    if (entry.method === "weight") {
      weightInput.value = entry.value;
      volumeInput.value = "";
    } else {
      volumeInput.value = entry.value;
      weightInput.value = "";
    }

    evapInput.value = entry.evap;
    evapUnitSelect.value = entry.evapUnit;

    wetProductSelect.value = entry.wetProduct || "";
    wetAmountInput.value = entry.wetAmount || "";
    wetAddWaterInput.value = entry.wetAddWater || "";
    memoInput.value = entry.memo || "";

    saveBtn.textContent = "編集を保存";
    saveBtn.style.background = "#ffcc66";
  }

  function deleteLog(index) {
    const logs = loadLog();
    logs.splice(index, 1);
    saveLog(logs);

    if (editingIndex === index) {
      editingIndex = null;
      saveBtn.textContent = "保存";
      saveBtn.style.background = "";
    }

    renderLogList();
  }

  loadCats().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    catSelect.appendChild(opt);
  });

  settings.spots.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = `${s.name}（${s.method}）`;
    spotSelect.appendChild(opt);
  });

  if (settings.wetProducts) {
    settings.wetProducts.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = `${p.name}（${p.moisture}%）`;
      wetProductSelect.appendChild(opt);
    });
  }

  spotSelect.addEventListener("change", () => {
    const spot = settings.spots.find(s => s.name === spotSelect.value);
    if (!spot) return;

    if (spot.method === "weight") {
      measureWeightBlock.style.display = "block";
      measureVolumeBlock.style.display = "none";
    } else {
      measureWeightBlock.style.display = "none";
      measureVolumeBlock.style.display = "block";
    }

    evapInput.value = spot.evap;
    evapUnitSelect.value = spot.evapUnit;
  });

  const firstSpot = settings.spots[0];
  if (firstSpot) {
    measureWeightBlock.style.display =
      firstSpot.method === "weight" ? "block" : "none";
    measureVolumeBlock.style.display =
      firstSpot.method === "volume" ? "block" : "none";

    evapInput.value = firstSpot.evap;
    evapUnitSelect.value = firstSpot.evapUnit;
  }

  saveBtn.addEventListener("click", () => {
    const cat = catSelect.value;
    const spotName = spotSelect.value;
    const spot = settings.spots.find(s => s.name === spotName);

    const evap = Number(evapInput.value || 0);
    const evapUnit = evapUnitSelect.value;

    const memo = memoInput.value;
    const wetProduct = wetProductSelect.value;
    const wetAmount = Number(wetAmountInput.value || 0);
    const wetAddWater = Number(wetAddWaterInput.value || 0);

    let currentValue = 0;
    let unit = "";

    if (spot.method === "weight") {
      currentValue = Number(weightInput.value);
      unit = "g";
    } else {
      currentValue = Number(volumeInput.value);
      unit = "ml";
    }

    if (!currentValue) {
      alert("今日の量を入力してください。");
      return;
    }

    const logs = loadLog();
    const initValue = spot.init;

    const diff = initValue - currentValue;

    let drink = diff;

    if (evapUnit === "g" || evapUnit === "ml") {
      drink -= evap;
    } else if (evapUnit === "percent") {
      drink -= (drink * (evap / 100));
    }

    let wetWater = 0;
    if (wetProduct && settings.wetProducts) {
      const product = settings.wetProducts.find(p => p.name === wetProduct);
      if (product) {
        wetWater = (wetAmount * (product.moisture / 100)) + wetAddWater;
      }
    }

    const finalDrink = drink + wetWater;

    const entry = {
      cat,
      spot: spotName,
      method: spot.method,
      date: recordDate.value,

      value: currentValue,
      unit,
      diff,

      drink,
      finalDrink,

      evap,
      evapUnit,

      wetProduct,
      wetAmount,
      wetAddWater,
      wetWater,

      memo,

      roomTemp: Number(document.getElementById("roomTempInput").value),
      waterTemp: Number(document.getElementById("waterTempInput").value),
    };

    if (editingIndex !== null) {
      logs[editingIndex] = entry;
      editingIndex = null;

      saveBtn.textContent = "保存";
      saveBtn.style.background = "";
    } else {
      logs.push(entry);
    }

    saveLog(logs);

    renderLogList();
    analyzeToday(logs, settings, recordDate.value);
    updateDashboard(logs, settings, recordDate.value);

    weightInput.value = "";
    volumeInput.value = "";
    memoInput.value = "";
    wetAmountInput.value = "";
    wetAddWaterInput.value = "";
  });

  renderLogList();
}
