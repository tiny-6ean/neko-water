export function initHybridChart(settings) {
  const rangeSelect = document.getElementById("hybridRange");
  rangeSelect.addEventListener("change", () => drawHybridChart(settings));

  drawHybridChart(settings);
}

export function drawHybridChart(settings) {
  const canvas = document.getElementById("hybridChart");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 300;

  const logs = JSON.parse(localStorage.getItem("logs") || "[]");
  const cats = loadCats();
  const range = Number(document.getElementById("hybridRange").value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!logs.length || !cats.length) return;

  /* ▼ 家庭総量（日付別） */
  const dailyTotal = {};
  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!dailyTotal[l.date]) dailyTotal[l.date] = 0;
    dailyTotal[l.date] += l.finalDrink;
  });

  /* ▼ 個体別（日付別） */
  const dailyCats = {};
  cats.forEach(c => {
    dailyCats[c.name] = {};
  });

  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!dailyCats[l.cat]) return;

    if (!dailyCats[l.cat][l.date]) dailyCats[l.cat][l.date] = 0;
    dailyCats[l.cat][l.date] += l.finalDrink;
  });

  /* ▼ 日付リスト */
  const allDates = Array.from(new Set(logs.map(l => l.date))).sort();
  const dateList = allDates.slice(-range);
  if (!dateList.length) return;

  /* ▼ min/max */
  const allValues = [];

  dateList.forEach(d => {
    allValues.push(dailyTotal[d] || 0);
    cats.forEach(c => {
      allValues.push(dailyCats[c.name][d] || 0);
    });
  });

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const diff = max - min || 1;

  const w = canvas.width;
  const h = canvas.height;

  /* ▼ 横軸 */
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  /* ▼ 家庭総量（太線） */
  ctx.strokeStyle = "#e28a4a";
  ctx.lineWidth = 3;
  ctx.beginPath();

  dateList.forEach((d, i) => {
    const val = dailyTotal[d] || 0;
    const x = (w - 20) * (i / Math.max(dateList.length - 1, 1)) + 10;
    const y = h - 20 - ((val - min) / diff) * (h - 40);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  /* ▼ 個体別（細線） */
  const colors = ["#4a90e2", "#e24a4a", "#4ae27f", "#e2c14a", "#9b4ae2"];

  cats.forEach((c, idx) => {
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    dateList.forEach((d, i) => {
      const val = dailyCats[c.name][d] || 0;
      const x = (w - 20) * (i / Math.max(dateList.length - 1, 1)) + 10;
      const y = h - 20 - ((val - min) / diff) * (h - 40);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    /* ▼ 凡例 */
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(10, 10 + idx * 20, 12, 12);

    ctx.fillStyle = "#333";
    ctx.fillText(c.name, 30, 20 + idx * 20);
  });
}
