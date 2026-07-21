import { loadCats, loadLog } from "./storage.js";

export function initCatCompare(settings) {
  const graphRange = document.getElementById("graphRangeCompare");

  graphRange.addEventListener("change", () => {
    drawCatCompare(settings);
  });

  drawCatCompare(settings);
}

export function drawCatCompare(settings) {
  const canvas = document.getElementById("catCompareChart");
  const ctx = canvas.getContext("2d");

  const logs = loadLog();
  const cats = loadCats();
  const range = Number(document.getElementById("graphRangeCompare").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!logs.length || !cats.length) return;

  const catData = {};

  cats.forEach(cat => {
    const filtered = logs.filter(l => l.cat === cat.name);
    catData[cat.name] = filtered.slice(-range).map(l => l.finalDrink || 0);
  });

  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  const colors = ["#4a90e2", "#e24a4a", "#4ae27f", "#e2c14a", "#9b4ae2"];

  const allValues = Object.values(catData).flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const diff = max - min || 1;

  const xPos = (i, len) => (w - 20) * (i / Math.max(len - 1, 1)) + 10;
  const yPos = val => h - 20 - ((val - min) / diff) * (h - 40);

  Object.entries(catData).forEach(([catName, arr], idx) => {
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    arr.forEach((val, i) => {
      const x = xPos(i, arr.length);
      const y = yPos(val);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(10, 10 + idx * 20, 12, 12);

    ctx.fillStyle = "#333";
    ctx.fillText(catName, 30, 20 + idx * 20);
  });
}
