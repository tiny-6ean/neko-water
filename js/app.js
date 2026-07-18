import { initOCR } from './ocr.js';
import { initRecord } from './record.js';
import { initChart } from './chart.js';
import { loadSettings } from './storage.js';

function initTabs() {
  const tabs = document.querySelectorAll(".tabs button");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      // active切り替え
      tabs.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");

      contents.forEach(c => {
        c.classList.remove("active");
        if (c.id === target) c.classList.add("active");
      });
    });
  });

  tabs[0].classList.add("active");
  contents[0].classList.add("active");
}

document.addEventListener("DOMContentLoaded", async () => {
  // 設定読み込み（猫・飲水源・蒸発補正）
  const settings = await loadSettings();

  initTabs();

  initOCR();
  initRecord(settings);
  initChart(settings);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/neko-water/service-worker.js");
}

