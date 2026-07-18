import { saveLog, loadLog, loadCats } from './storage.js';
import { analyzeToday, updateDashboard } from './analyze.js';

export function initRecord(settings) {

  const catSelect = document.getElementById("catSelect");
  const sourceSelect = document.getElementById("sourceSelect");

  const weightInput = document.getElementById("weightInput");
  const weightUnitSelect = document.getElementById("weightUnitSelect");

  const evapInput = document.getElementById("evapInput");
  const evapUnitSelect = document.getElementById("evapUnitSelect");

  const memoInput = document.getElementById("memoInput");
  const saveBtn = document.getElementById("saveBtn");
  const resultBox = document.getElementById("recordResult");

  /* 猫リスト */
  const cats = loadCats();
  cats.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    catSelect.appendChild(opt);
  });

  /* 飲水源リスト */
  settings.sources.forEach(src => {
    const opt = document.createElement("option");
    opt.value = src.name;
    opt.textContent = src.name;
    sourceSelect.appendChild(opt);
  });

  /* 飲水源選択時：蒸発補正反映 */
  sourceSelect.addEventListener("change", () => {
    const src = settings.sources.find(s => s.name === sourceSelect.value);
    if (!src) return;

    evapInput.value = src.evap;
    evapUnitSelect.value = src.unit;
  });

  // 初期値
  const firstSource = settings.sources[0];
  evapInput.value = firstSource.evap;
  evapUnitSelect.value = firstSource.unit;

  /* 記録処理（完全版） */
  saveBtn.addEventListener("click", () => {

    const cat = catSelect.value;
    const source = sourceSelect.value;

    const weight = Number(weightInput.value);
    const weightUnit = weightUnitSelect.value;

    const evap = Number(evapInput.value || 0);
    const evapUnit = evapUnitSelect.value;

    const memo = memoInput.value;

    if (!weight) {
      alert("総重量を入力してください。");
      return;
    }

    const logs = loadLog();

    /* 前回の重量 */
    const filtered = logs.filter(l => l.cat === cat && l.source === source);
    const prev = filtered.length ? filtered[filtered.length - 1].weight : null;

    /* 差分（単位は weightUnit と同じ） */
    const diff = prev !== null ? weight - prev : null;

    /* 飲水量計算（単位対応） */
    let drink = null;

    if (diff !== null) {

      if (evapUnit === "g" || evapUnit === "ml") {
        drink = diff - evap;

      } else if (evapUnit === "percent") {
        drink = diff - (diff * (evap / 100));
      }
    }

    /* 保存データ */
    const entry = {
      cat,
      source,
      date: new Date().toLocaleDateString("ja-JP"),
      weight,
      weightUnit,
      diff,
      drink,
      evap,
      evapUnit,
      memo
    };

    logs.push(entry);
    saveLog(logs);

    /* 表示 */
    resultBox.textContent =
      `${entry.date} / ${entry.cat} / ${entry.source}：` +
      `${entry.weight}${entry.weightUnit}（差分 ${entry.diff ?? "-"}${entry.weightUnit} / 飲水量 ${entry.drink ?? "-"}${entry.weightUnit}）`;

    analyzeToday(logs, settings);
    updateDashboard(logs, settings);

    weightInput.value = "";
    memoInput.value = "";
  });
}
