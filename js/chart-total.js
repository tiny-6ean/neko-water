export function initTotalChart(settings) {
  const rangeSelect = document.getElementById("graphRangeTotal");
  rangeSelect.addEventListener("change", () => drawTotalChart(settings));

  drawTotalChart(settings);
}

export function drawTotalChart(settings) {
  const canvas = document.getElementById("totalDrinkChart");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 300;

  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  const range = Number(document.getElementById("graphRangeTotal").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!logs.length) return;

  const dailyMap = {};

  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!dailyMap[l.date]) dailyMap[l.date] = 0;
    dailyMap[l.date] += l.finalDrink;
  });

  const dailyList = Object.entries(dailyMap)
    .map(([date, total]) => ({ date, total }))
    .slice(-range);

  if (!dailyList.length) return;

  const values = dailyList.map(d => d.total);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const diff = max - min || 1;

  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  ctx.strokeStyle = "#e28a4a";
  ctx.lineWidth = 2;
  ctx.beginPath();

  dailyList.forEach((d, i) => {
    const x = (w - 20) * (i / Math.max(dailyList.length - 1, 1)) + 10;
    const y = h - 20 - ((d.total - min) / diff) * (h - 40);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  ctx.strokeStyle = "#ffcc99";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();

  const avgY = h - 20 - ((avg - min) / diff) * (h - 40);
  ctx.moveTo(10, avgY);
  ctx.lineTo(w - 10, avgY);
  ctx.stroke();
  ctx.setLineDash([]);
}
