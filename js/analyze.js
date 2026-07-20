export function analyzeToday(logs, settings) {
  const alertBox = document.getElementById("alertBox");
  const todayDrink = document.getElementById("todayDrink");
  const avg7 = document.getElementById("avg7");
  const ratioBox = document.getElementById("ratioBox");
  const memoList = document.getElementById("memoList");

  if (!logs.length) return;

  const today = new Date().toLocaleDateString("ja-JP");

  const todayLogs = logs.filter(l => l.date === today);
  const todayTotal = todayLogs
    .map(l => l.finalDrink || 0)
    .reduce((a, b) => a + b, 0);

  todayDrink.textContent = `${todayTotal.toFixed(1)} ml`;

  const abnormal = detectAbnormal(logs, todayTotal);
  if (abnormal) {
    alertBox.style.display = "block";
    alertBox.textContent = abnormal;
  } else {
    alertBox.style.display = "none";
  }

  const avg = movingAverage(logs, 7);
  avg7.textContent = `${avg} ml`;

  ratioBox.textContent = calcSpotRatio(logs, settings);

  memoList.innerHTML = logs
    .slice(-10)
    .map(l => `${l.date}：${l.memo || "（なし）"}`)
    .join("<br>");
}

export function detectAbnormal(logs, todayTotal) {
  if (!todayTotal) return null;

  const prev = logs.length > 1 ? logs[logs.length - 2].finalDrink : null;

  if (prev !== null && Math.abs(todayTotal - prev) >= 50) {
    return `⚠ 飲水量が前日比で大きく変化しています（${(todayTotal - prev).toFixed(1)} ml）`;
  }

  const last7 = logs.slice(-7).map(l => l.finalDrink).filter(v => v !== null);
  const avg7 = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : null;

  if (avg7 !== null) {
    const diffRate = (todayTotal - avg7) / avg7;
    if (Math.abs(diffRate) >= 0.4) {
      return `⚠ 飲水量が7日平均から大きく外れています（平均 ${avg7.toFixed(1)} ml）`;
    }
  }

  if (prev !== null && todayTotal < prev - 40) {
    return `⚠ 飲水量が急激に減少しています`;
  }

  if (prev !== null && todayTotal > prev + 60) {
    return `⚠ 飲水量が急激に増加しています`;
  }

  return null;
}

export function movingAverage(logs, days) {
  const arr = logs.slice(-days).map(l => l.finalDrink).filter(v => v !== null);
  if (!arr.length) return "-";
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return avg.toFixed(1);
}

export function calcSpotRatio(logs, settings) {
  const sum = {};

  settings.spots.forEach(s => {
    sum[s.name] = 0;
  });

  logs.forEach(l => {
    if (!l.finalDrink) return;
    if (sum[l.spot] !== undefined) {
      sum[l.spot] += l.finalDrink;
    }
  });

  const total = Object.values(sum).reduce((a, b) => a + b, 0);
  if (total === 0) return "データなし";

  return Object.entries(sum)
    .map(([name, val]) => `${name}: ${Math.round((val / total) * 100)}%`)
    .join(" / ");
}

export function updateDashboard(logs, settings) {
  analyzeToday(logs, settings);
}

export function generateMonthlyReport(logs, settings) {
  const monthlyReport = document.getElementById("monthlyReport");
  if (!logs.length) {
    monthlyReport.textContent = "データがありません";
    return;
  }

  const now = new Date();
  const ym = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthLogs = logs.filter(l => l.date.startsWith(ym));

  if (!monthLogs.length) {
    monthlyReport.textContent = "今月のデータがありません";
    return;
  }

  const total = monthLogs
    .map(l => l.finalDrink || 0)
    .reduce((a, b) => a + b, 0);

  const avg = (total / monthLogs.length).toFixed(1);

  const abnormalDays = monthLogs
    .map(l => {
      const abnormal = detectAbnormal(logs, l.finalDrink);
      return abnormal ? `${l.date}：${abnormal}` : null;
    })
    .filter(v => v !== null);

  const spotSum = {};
  settings.spots.forEach(s => (spotSum[s.name] = 0));

  monthLogs.forEach(l => {
    if (l.finalDrink && spotSum[l.spot] !== undefined) {
      spotSum[l.spot] += l.finalDrink;
    }
  });

  const spotRatio = Object.entries(spotSum)
    .map(([name, val]) => `${name}: ${val.toFixed(1)} ml`)
    .join("<br>");

  const maxDay = monthLogs.reduce((a, b) => (a.finalDrink > b.finalDrink ? a : b));
  const minDay = monthLogs.reduce((a, b) => (a.finalDrink < b.finalDrink ? a : b));

  monthlyReport.innerHTML = `
    <div class="analysis-item">
      <h3>今月の総飲水量</h3>
      <div>${total.toFixed(1)} ml</div>
    </div>

    <div class="analysis-item">
      <h3>1日平均</h3>
      <div>${avg} ml</div>
    </div>

    <div class="analysis-item">
      <h3>最多飲水日</h3>
      <div>${maxDay.date}：${maxDay.finalDrink} ml</div>
    </div>

    <div class="analysis-item">
      <h3>最少飲水日</h3>
      <div>${minDay.date}：${minDay.finalDrink} ml</div>
    </div>

    <div class="analysis-item">
      <h3>スポットごとの合計</h3>
      <div>${spotRatio}</div>
    </div>

    <div class="analysis-item">
      <h3>異常日の一覧</h3>
      <div>${abnormalDays.length ? abnormalDays.join("<br>") : "異常なし"}</div>
    </div>
  `;
}
