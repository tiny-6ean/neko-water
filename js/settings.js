export function initCatSettings(settings) {
  const catList = document.getElementById("catList");
  const newCatName = document.getElementById("newCatName");
  const addCatBtn = document.getElementById("addCatBtn");

  /* cats のロード */
  const savedCats = JSON.parse(localStorage.getItem("cats") || "[]");
  settings.cats = savedCats;

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
