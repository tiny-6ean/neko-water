import { loadCats, loadLog } from "./storage.js";

export function initDashboardAlerts(settings) {
  drawDashboardAlerts(settings);
}

export function drawDashboardAlerts(settings) {
  const alertBox = document.getElementById("alertBox");
  alertBox.innerHTML = "";

  const logs = loadLog();
  const cats = loadCats();

  if (!logs.length || !cats.length) return;

  const THRESH_UP = settings.threshold?.up ?? 40;
  const THRESH_DOWN = settings.threshold?.down ?? -40;

  const allDates = Array.from(new Set(logs.map(l => l.date))).sort();
  const latest = allDates[allDates.length - 1];
  const prev = allDates[allDates.length - 2];
  if (!latest || !prev) return;

  const totalToday = logs
    .filter(l => l.date === latest)
    .reduce((a, b) => a + (b.finalDrink || 0), 0);

  const totalPrev = logs
    .filter(l => l.date === prev)
    .reduce((a, b) => a + (b.finalDrink || 0), 0);

  const diffTotal = totalToday - totalPrev;

  function guessReason(date) {
    const todayLogs = logs.filter(l => l.date === date);
    const prevLogs = logs.filter(l => l.date === prev);

    const reasons = [];

    const wetToday = todayLogs.reduce((a, b) => a + (b.wetAmount || 0), 0);
    const wetPrev = prevLogs.reduce((a, b) => a + (b.wetAmount || 0), 0);
    if (wetToday > wetPrev) reasons.push("ウェット増加");

    const addToday = todayLogs.reduce((a, b) => a + (b.wetAddWater || 0), 0);
    const addPrev = prevLogs.reduce((a, b) => a + (b.wetAddWater || 0), 0);
    if (addToday > addPrev) reasons.push("追い水増加");

    const spotToday = todayLogs.map(l => l.spot).join(",");
    const spotPrev = prevLogs.map(l => l.spot).join(",");
    if (spotToday !== spotPrev) reasons.push("スポット変更");

    const evapToday = todayLogs.reduce((a, b) => a + (b.evap || 0), 0);
    const evapPrev = prevLogs.reduce((a, b) => a + (b.evap || 0), 0);
    if (evapToday !== evapPrev) reasons.push("蒸発補正の変化");

    return reasons.join(" / ");
  }

  const reason = guessReason(latest);

  function addAlert(type, message) {
    const div = document.createElement("div");
    div.className = "alert-item";

    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.style.borderRadius = "6px";
    div.style.color = "#fff";

    div.style.background = type === "up" ? "#e24a4a" : "#4a6fe2";

    div.innerHTML = `
      <strong>${message}</strong><br>
      <span style="font-size:13px;">理由候補：${reason || "なし"}</span>
    `;

    alertBox.appendChild(div);
  }

  if (diffTotal >= THRESH_UP) {
    addAlert("up", `急増：前日比 +${diffTotal} ml`);
  }

  if (diffTotal <= THRESH_DOWN) {
    addAlert("down", `急減：前日比 ${diffTotal} ml`);
  }

  cats.forEach(cat => {
    const today = logs
      .filter(l => l.date === latest && l.cat === cat.name)
      .reduce((a, b) => a + (b.finalDrink || 0), 0);

    const prevDay = logs
      .filter(l => l.date === prev && l.cat === cat.name)
      .reduce((a, b) => a + (b.finalDrink || 0), 0);

    const diff = today - prevDay;

    if (diff >= THRESH_UP) {
      addAlert("up", `${cat.name} が急増：+${diff} ml`);
    }

    if (diff <= THRESH_DOWN) {
      addAlert("down", `${cat.name} が急減：${diff} ml`);
    }
  });
}
