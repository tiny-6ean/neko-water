import { saveLog, loadLog, loadCats } from './storage.js';
import { analyzeToday, updateDashboard } from './analyze.js';

export function initRecord(settings) {

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

  const cats = loadCats();
  cats.forEach(cat => {
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
  if (firstSpot.method === "weight") {
    measureWeightBlock.style.display = "block";
    measureVolumeBlock.style.display = "none";
  } else {
    measureWeightBlock.style.display = "none";
    measureVolumeBlock.style.display = "block";
  }
  evapInput.value = firstSpot.evap;
  evapUnitSelect.value = firstSpot.evapUnit;

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

    const filtered = logs.filter(l => l.spot === spotName);
    const prev = filtered.length ? filtered[filtered.length - 1].value : null;

    const diff = prev !== null ? currentValue - prev : null;

    let drink = null;

    if (diff !== null) {
      if (evapUnit === "g" || evapUnit === "ml") {
        drink = diff - evap;
      } else if (evapUnit === "percent") {
        drink = diff - (diff * (evap / 100));
      }
    }

    let wetWater = 0;

    if (wetProduct && settings.wetProducts) {
      const product = settings.wetProducts.find(p => p.name === wetProduct);
      if (product) {
        wetWater = (wetAmount * (product.moisture / 100)) + wetAddWater;
      }
    }

    let finalDrink = 0;

    if (drink !== null) {
      finalDrink = drink + wetWater;
    } else {
      finalDrink = wetWater;
    }

    const entry = {
      cat,
      spot: spotName,
      method: spot.method,
      date: new Date().toLocaleDateString("ja-JP"),

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

      memo
    };

    logs.push(entry);
    saveLog(logs);

    resultBox.textContent =
      `${entry.date} / ${entry.cat} / ${entry.spot}：` +
      `現在 ${entry.value}${entry.unit} / 差分 ${entry.diff ?? "-"}${entry.unit} / ` +
      `蒸発補正 ${entry.evap}${entry.evapUnit} / ` +
      `ウェット水分 ${entry.wetWater.toFixed(1)}ml / ` +
      `最終 ${entry.finalDrink.toFixed(1)}ml`;

    analyzeToday(logs, settings);
    updateDashboard(logs, settings);

    weightInput.value = "";
    volumeInput.value = "";
    memoInput.value = "";
    wetAmountInput.value = "";
    wetAddWaterInput.value = "";
  });
}
