const LOG_KEY = "water_log";

export function loadLog() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
}

export function saveLog(data) {
  localStorage.setItem(LOG_KEY, JSON.stringify(data));
}

export async function loadSettings() {
  const res = await fetch("./data/settings.json");
  const json = await res.json();
  return json;
}

export function exportCSV() {
  const logs = loadLog();
  if (!logs.length) {
    alert("データがありません");
    return;
  }

  const header = [
    "date", "cat", "source", "weight", "diff", "drink", "evap", "memo"
  ];

  const rows = logs.map(l => [
    l.date, l.cat, l.source, l.weight, l.diff, l.drink, l.evap, l.memo
  ]);

  const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "water_log.csv";
  a.click();

  URL.revokeObjectURL(url);
}

export function exportJSON() {
  const logs = loadLog();
  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "water_log_backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      saveLog(data);
      alert("データを復元しました");
    } catch {
      alert("JSONファイルが不正です");
    }
  };

  reader.readAsText(file);
}

const CAT_KEY = "cats";

export function loadCats() {
  return JSON.parse(localStorage.getItem(CAT_KEY) || "[]");
}

export function saveCats(data) {
  localStorage.setItem(CAT_KEY, JSON.stringify(data));
}
