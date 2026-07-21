import { loadCats, loadLog } from "./storage.js";

export function initChart(settings) {
  const graphCat = document.getElementById("graphCat");
  const graphSpot = document.getElementById("graphSpot");
  const graphRange = document.getElementById("graphRange");

  loadCats().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    graphCat.appendChild(opt);
  });

  settings.spots.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = `${s.name}（${s.method}）`;
    graphSpot.appendChild(opt);
  });

  graphCat.addEventListener("change", drawChart);
  graphSpot.addEventListener("change", drawChart);
  graphRange.addEventListener("change", drawChart);

  drawChart();
}

export function drawChart() {
  const canvas = document.getElementById("drinkChart");
  const ctx = canvas.getContext("2d");

  const logs = loadLog();

  const cat = document.getElementById("graphCat").value;
  const spot = document.getElementById("graphSpot").value;
  const range = Number(document.getElementById("graphRange").value);

  const filtered = logs.filter(l => l.cat === cat && l.spot === spot);
  const data = filtered.slice(-range);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!data.length) return;

  const drinks = data.map(d => d.finalDrink ?? 0);

  const min = Math.min(...drinks);
  const max = Math.max(...drinks);
  const diff = max - min || 1;

  const w = canvas.width;
  const h = canvas.height;

  const xPos = i => (w - 20) * (i / Math.max(data.length - 1, 1)) + 10;
  const yPos = val => h - 20 - ((val - min) / diff) * (h - 40);

  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  ctx.strokeStyle = "#4a90e2";
  ctx.lineWidth = 2;
  ctx.beginPath();

  data.forEach((d, i) => {
    const x = xPos(i);
    const y = yPos(d.finalDrink);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  const avg = drinks.reduce((a, b) => a + b, 0) / drinks.length;
  const avgY = yPos(avg);

  ctx.strokeStyle = "#7fb3ff";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(10, avgY);
  ctx.lineTo(w - 10, avgY);
  ctx.stroke();
  ctx.setLineDash([]);
}
