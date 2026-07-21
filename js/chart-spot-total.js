import { loadLog } from "./storage.js";

export function initSpotTotalChart(settings) {
  const rangeSelect = document.getElementById("graphRangeSpotTotal");
  rangeSelect.addEventListener("change", () => drawSpotTotalChart(settings));
  drawSpotTotalChart(settings);
}

export function drawSpotTotalChart(settings) {
  const canvas = document.getElementById("spotTotalChart");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 300;

  const logs = loadLog();
  const range = Number(document.getElementById("graphRangeSpotTotal").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!logs.length) return;

  const spotNames = settings.spots.map(s => s.name);

  const spotDaily = {};
  spotNames.forEach(name => spotDaily[name] = {});

  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!spotDaily[l.spot]) return;
    spotDaily[l.spot][l.date] = (spotDaily[l.spot][l.date] || 0) + l.finalDrink;
  });

  const allDates = Array.from(new Set(logs.map(l => l.date))).sort();
  const dateList = allDates.slice(-range);
  if (!dateList.length) return;

  const allValues = [];
  spotNames.forEach(name => {
    dateList.forEach(date => {
      allValues.push(spotDaily[name][date] || 0);
    });
  });

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const diff = max - min || 1;

  const w = canvas.width;
  const h = canvas.height;

  const xPos = (i, len) => (w - 20) * (i / Math.max(len - 1, 1)) + 10;
  const yPos = val => h - 20 - ((val - min) / diff) * (h - 40);

  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  const colors = ["#4a90e2", "#e24a4a", "#4ae27f", "#e2c14a", "#9b4ae2"];

  spotNames.forEach((name, idx) => {
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    dateList.forEach((date, i) => {
      const val = spotDaily[name][date] || 0;
      const x = xPos(i, dateList.length);
      const y = yPos(val);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    /* 凡例 */
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(10, 10 + idx * 20, 12, 12);

    ctx.fillStyle = "#333";
    ctx.fillText(name, 30, 20 + idx * 20);
  });
}
