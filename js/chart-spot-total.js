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

  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  const range = Number(document.getElementById("graphRangeSpotTotal").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!logs.length) return;

  const spotNames = settings.spots.map(s => s.name);
  const spotDaily = {};

  spotNames.forEach(name => {
    spotDaily[name] = {};
  });

  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!spotDaily[l.spot]) return;

    if (!spotDaily[l.spot][l.date]) spotDaily[l.spot][l.date] = 0;
    spotDaily[l.spot][l.date] += l.finalDrink;
  });

  const allDates = Array.from(
    new Set(
      logs.map(l => l.date)
    )
  ).sort();

  const dateList = allDates.slice(-range);
  if (!dateList.length) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  const colors = ["#4a90e2", "#e24a4a", "#4ae27f", "#e2c14a", "#9b4ae2"];

  const allValues = [];

  spotNames.forEach(name => {
    dateList.forEach(date => {
      const v = spotDaily[name][date] || 0;
      allValues.push(v);
    });
  });

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const diff = max - min || 1;

  spotNames.forEach((name, idx) => {
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    dateList.forEach((date, i) => {
      const val = spotDaily[name][date] || 0;

      const x = (w - 20) * (i / Math.max(dateList.length - 1, 1)) + 10;
      const y = h - 20 - ((val - min) / diff) * (h - 40);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(10, 10 + idx * 20, 12, 12);

    ctx.fillStyle = "#333";
    ctx.fillText(name, 30, 20 + idx * 20);
  });
}
