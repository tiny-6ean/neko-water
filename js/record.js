import { saveLog, loadLog, loadSettings } from './storage.js';
import { analyzeToday, updateDashboard } from './analyze.js';

export function initRecord(settings) {

  const catSelect = document.getElementById("catSelect");
  const sourceSelect = document.getElementById("sourceSelect");
  const weightInput = document.getElementById("weightInput");
  const evapInput = document.getElementById("evapInput");
  const memoInput = document.getElementById("memoInput");
  const saveBtn = document.getElementById("saveBtn");
  const resultBox = document.getElementById("recordResult");

const cats = loadCats();

cats.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat.name;
  opt.textContent = cat.name;
  catSelect.appendChild(opt);
});

  settings.sources.forEach(src => {
    const opt = document.createElement("option");
    opt.value = src.name;
    opt.textContent = src.name;
    sourceSelect.appendChild(opt);
  });

  sourceSelect.addEventListener("change", () => {
    const src = settings.sources.find(s => s.name === sourceSelect.value);
    evapInput.value = src ? src.evap : 0;
  });

  const firstSource = settings.sources[0];
  evapInput.value = firstSource.evap;

  saveBtn.addEventListener("click", () => {

    const cat = catSelect.value;
    const source = sourceSelect.value;
    const weight = Number(weightInput.value);
    const evap = Number(evapInput.value || 0);
    const memo = memoInput.value;

    if (!weight) {
      alert("重量を入力してください。");
      return;
    }

    const logs = loadLog();

    const filtered = logs.filter(l => l.cat === cat && l.source === source);
    const prev = filtered.length ? filtered[filtered.length - 1].weight : null;
    const diff = prev !== null ? weight - prev : null;

    const drink = diff !== null ? diff + evap : null;

    const entry = {
      cat,
      source,
      date: new Date().toLocaleDateString("ja-JP"),
      weight,
      diff,
      drink,
      evap,
      memo
    };

    logs.push(entry);
    saveLog(logs);

    resultBox.textContent =
      `${entry.date} / ${entry.cat} / ${entry.source}：` +
      `${entry.weight} g（差分 ${entry.diff ?? "-"} g / 飲水量 ${entry.drink ?? "-"} g）`;

    analyzeToday(logs, settings);
    updateDashboard(logs, settings);

    weightInput.value = "";
    memoInput.value = "";
  });
}
