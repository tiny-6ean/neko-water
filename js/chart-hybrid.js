import { loadCats } from './storage.js';

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

  const THRESH_UP = settings.threshold?.up ?? 40;
  const THRESH_DOWN = settings.threshold?.down ?? -40;

  const abnormalPoints = [];

  const dailyTotal = {};
  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!dailyTotal[l.date]) dailyTotal[l.date] = 0;
    dailyTotal[l.date] += l.finalDrink;
  });

  const dailyCats = {};
  cats.forEach(c => dailyCats[c.name] = {});
  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (!dailyCats[l.cat]) return;
    if (!dailyCats[l.cat][l.date]) dailyCats[l.cat][l.date] = 0;
    dailyCats[l.cat][l.date] += l.finalDrink;
  });

  const allDates = Array.from(new Set(logs.map(l => l.date))).sort();
  const dateList = allDates.slice(-range);
  if (!dateList.length) return;

  const allValues = [];
  dateList.forEach(d => {
    allValues.push(dailyTotal[d] || 0);
    cats.forEach(c => allValues.push(dailyCats[c.name][d] || 0));
  });

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const diff = max - min || 1;

  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, h - 20);
  ctx.lineTo(w, h - 20);
  ctx.stroke();

  ctx.strokeStyle = "#e28a4a";
  ctx.lineWidth = 3;
  ctx.beginPath();

  const totalPoints = [];

  dateList.forEach((d, i) => {
    const val = dailyTotal[d] || 0;
    const x = (w - 20) * (i / Math.max(dateList.length - 1, 1)) + 10;
    const y = h - 20 - ((val - min) / diff) * (h - 40);
    totalPoints.push({ x, y, val, date: d });

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  function guessReason(date) {
    const todayLogs = logs.filter(l => l.date === date);
    const prevLogs = logs.filter(l => l.date === allDates[allDates.indexOf(date) - 1]);

    let reasons = [];

    const wetToday = todayLogs.reduce((a, b) => a + (b.wetAmount || 0), 0);
    const wetPrev = prevLogs.reduce((a, b) => a + (b.wetAmount || 0), 0);
    if (wetToday > wetPrev) reasons.push("ウェット増加");

    const addToday = todayLogs.reduce((a, b) => a + (b.wetAddWater || 0), 0);
    const addPrev = prevLogs.reduce((a, b) => a + (b.wetAddWater || 0), 0);
    if (addToday > addPrev) reasons.push("追い水増加");

    const spotToday = todayLogs.map(l => l.spot);
    const spotPrev = prevLogs.map(l => l.spot);
    if (spotToday.join(",") !== spotPrev.join(",")) reasons.push("スポット変更");

    const evapToday = todayLogs.reduce((a, b) => a + (b.evap || 0), 0);
    const evapPrev = prevLogs.reduce((a, b) => a + (b.evap || 0), 0);
    if (evapToday !== evapPrev) reasons.push("蒸発補正の変化");

    return reasons.join(" / ");
  }

  for (let i = 1; i < totalPoints.length; i++) {
    const diffVal = totalPoints[i].val - totalPoints[i - 1].val;
    const reason = guessReason(totalPoints[i].date);

    if (diffVal >= THRESH_UP) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(totalPoints[i].x, totalPoints[i].y, 5, 0, Math.PI * 2);
      ctx.fill();

      abnormalPoints.push({
        x: totalPoints[i].x,
        y: totalPoints[i].y,
        date: totalPoints[i].date,
        reason,
        type: "up"
      });
    }

    if (diffVal <= THRESH_DOWN) {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(totalPoints[i].x, totalPoints[i].y, 5, 0, Math.PI * 2);
      ctx.fill();

      abnormalPoints.push({
        x: totalPoints[i].x,
        y: totalPoints[i].y,
        date: totalPoints[i].date,
        reason,
        type: "down"
      });
    }
  }

  const colors = ["#4a90e2", "#e24a4a", "#4ae27f", "#e2c14a", "#9b4ae2"];

  cats.forEach((c, idx) => {
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2;
    ctx.beginPath();

    const catPoints = [];

    dateList.forEach((d, i) => {
      const val = dailyCats[c.name][d] || 0;
      const x = (w - 20) * (i / Math.max(dateList.length - 1, 1)) + 10;
      const y = h - 20 - ((val - min) / diff) * (h - 40);

      catPoints.push({ x, y, val, date: d });

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    for (let i = 1; i < catPoints.length; i++) {
      const diffVal = catPoints[i].val - catPoints[i - 1].val;
      const reason = guessReason(catPoints[i].date);

      if (diffVal >= THRESH_UP) {
        ctx.fillStyle = colors[idx % colors.length];
        ctx.beginPath();
        ctx.arc(catPoints[i].x, catPoints[i].y, 3, 0, Math.PI * 2);
        ctx.fill();

        abnormalPoints.push({
          x: catPoints[i].x,
          y: catPoints[i].y,
          date: catPoints[i].date,
          reason,
          type: "up"
        });
      }

      if (diffVal <= THRESH_DOWN) {
        ctx.fillStyle = "#555";
        ctx.beginPath();
        ctx.arc(catPoints[i].x, catPoints[i].y, 3, 0, Math.PI * 2);
        ctx.fill();

        abnormalPoints.push({
          x: catPoints[i].x,
          y: catPoints[i].y,
          date: catPoints[i].date,
          reason,
          type: "down"
        });
      }
    }

    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(10, 10 + idx * 20, 12, 12);

    ctx.fillStyle = "#333";
    ctx.fillText(c.name, 30, 20 + idx * 20);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(500, 10, 12, 12);
  ctx.fillStyle = "#333";
  ctx.fillText("急増", 520, 20);

  ctx.fillStyle = "blue";
  ctx.fillRect(500, 30, 12, 12);
  ctx.fillStyle = "#333";
  ctx.fillText("急減", 520, 40);

  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    abnormalPoints.forEach(p => {
      const dx = clickX - p.x;
      const dy = clickY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        showLogModal(p.date, p.reason);
      }
    });
  };

  function showLogModal(date, reason) {
    const modal = document.getElementById("logModal");
    const body = document.getElementById("logModalBody");
    const closeBtn = document.getElementById("logModalClose");

    const dayLogs = logs.filter(l => l.date === date);

    body.innerHTML = `
      <p><strong>${date}</strong></p>
      <p style="color:#d9534f;"><strong>推定理由：</strong> ${reason || "なし"}</p>
      <hr>
      ${dayLogs.map(l => `
        <div class="log-item">
          <p>猫：${l.cat}</p>
          <p>スポット：${l.spot}</p>
          <p>飲水量：${l.finalDrink} ml</p>
          <p>ウェット：${l.wetAmount || 0} g（追い水 ${l.wetAddWater || 0} ml）</p>
          <p>蒸発補正：${l.evap || 0}</p>
          <p>メモ：${l.memo || ""}</p>
        </div>
        <hr>
      `).join("")}
    `;

    modal.style.display = "block";
    closeBtn.onclick = () => modal.style.display = "none";
  }
}
