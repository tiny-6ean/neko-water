export function initCatSettings(settings) {
  const catList = document.getElementById("catList");
  const newCatName = document.getElementById("newCatName");
  const addCatBtn = document.getElementById("addCatBtn");

  const savedCats = JSON.parse(localStorage.getItem("cats") || "null");
  if (savedCats) {
    settings.cats = savedCats;
  } else {
    localStorage.setItem("cats", JSON.stringify(settings.cats));
  }

  function renderCatList() {
    catList.innerHTML = settings.cats
      .map(cat => `<div>${cat}</div>`)
      .join("");
  }

  renderCatList();

  addCatBtn.addEventListener("click", () => {
    const name = newCatName.value.trim();
    if (!name) {
      alert("猫の名前を入力してください");
      return;
    }

    if (settings.cats.includes(name)) {
      alert("その名前はすでに登録されています");
      return;
    }

    settings.cats.push(name);
    localStorage.setItem("cats", JSON.stringify(settings.cats));

    renderCatList();
    newCatName.value = "";

    alert(`猫「${name}」を追加しました`);
  });
}

export function initSourceSettings(settings) {
  const sourceList = document.getElementById("sourceList");
  const newSourceName = document.getElementById("newSourceName");
  const newSourceEvap = document.getElementById("newSourceEvap");
  const addSourceBtn = document.getElementById("addSourceBtn");

  const savedSources = JSON.parse(localStorage.getItem("sources") || "null");
  if (savedSources) {
    settings.sources = savedSources;
  } else {
    localStorage.setItem("sources", JSON.stringify(settings.sources));
  }

  function renderSourceList() {
    sourceList.innerHTML = settings.sources
      .map(src => `<div>${src.name}（蒸発補正 ${src.evap}g）</div>`)
      .join("");
  }

  renderSourceList();

  addSourceBtn.addEventListener("click", () => {
    const name = newSourceName.value.trim();
    const evap = Number(newSourceEvap.value);

    if (!name) {
      alert("飲水源名を入力してください");
      return;
    }
    if (isNaN(evap)) {
      alert("蒸発補正を入力してください");
      return;
    }

    if (settings.sources.some(s => s.name === name)) {
      alert("その飲水源はすでに登録されています");
      return;
    }

    const newSource = { name, evap };
    settings.sources.push(newSource);
    localStorage.setItem("sources", JSON.stringify(settings.sources));

    renderSourceList();
    newSourceName.value = "";
    newSourceEvap.value = "";

    alert(`飲水源「${name}」を追加しました`);
  });
}
