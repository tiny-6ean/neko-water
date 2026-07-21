export function initOCR() {
  const photoInput = document.getElementById("photoInput");
  const weightInput = document.getElementById("weightInput");
  const resultBox = document.getElementById("recordResult");

  if (!photoInput) return;

  photoInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    resultBox.textContent = "画像から数字を読み取り中…";

    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: m => console.log(m)
      });

      // 最初に見つかった数字を抽出
      const match = text.match(/\d+/);

      if (match) {
        const num = match[0];
        weightInput.value = num;

        resultBox.textContent =
          `画像から ${num} g を読み取りました。必要なら手入力で修正してください。`;
      } else {
        resultBox.textContent =
          "数字が読み取れませんでした。手入力してください。";
      }

    } catch (err) {
      console.error(err);
      resultBox.textContent =
        "画像の読み取りでエラーが発生しました。手入力してください。";
    }
  });
}
