import { isFavorite, removeWrong, toggleFavorite } from "./storage.js";

export const byId = (id) => document.getElementById(id);

export const normalize = (value) =>
  String(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();

export const shuffle = (items) => {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

const blendWrongColor = (ratio) => {
  const start = [232, 245, 233];
  const end = [255, 235, 238];
  const mixed = start.map((value, index) => Math.round(value + (end[index] - value) * ratio));
  return `rgb(${mixed.join(", ")})`;
};

export const renderWordRows = (container, words, options = {}) => {
  const {
    emptyText = "표시할 단어가 없습니다.",
    removableWrong = false,
    wrongCounts = {},
    maxWrongCount = 1,
    onChange = null,
  } = options;
  container.innerHTML = "";

  if (!words.length) {
    container.innerHTML = `<div class="empty">${emptyText}</div>`;
    return;
  }

  words.forEach((item) => {
    const wrongCount = wrongCounts[item.id] || 0;
    const wrongRatio = removableWrong ? Math.min(wrongCount / maxWrongCount, 1) : 0;
    const row = document.createElement("article");
    row.className = "word-row";
    if (removableWrong) {
      row.classList.add("wrong-row");
      row.style.setProperty("--wrong-ratio", wrongRatio.toFixed(2));
      row.style.setProperty("--wrong-bg", blendWrongColor(wrongRatio));
    }
    row.innerHTML = `
      <div class="word-no">${item.id}. <small>No.${item.no}</small></div>
      <div class="word-body">
        <div class="word-line">
          <div class="word-main">${item.word}</div>
          ${!removableWrong ? `<button class="star-btn" type="button" aria-label="즐겨찾기">${isFavorite(item.id) ? "★" : "☆"}</button>` : ""}
        </div>
        <div class="word-meaning">${item.meaning}</div>
        ${removableWrong ? `<div class="wrong-count">${wrongCount}회 틀림</div>` : ""}
      </div>
      <button class="${removableWrong ? "small-btn" : "star-btn"}" type="button" aria-label="${removableWrong ? "오답에서 삭제" : "즐겨찾기"}">
        ${removableWrong ? "삭제" : isFavorite(item.id) ? "★" : "☆"}
      </button>
    `;

    const button = removableWrong ? row.querySelector(".small-btn") : row.querySelector(".word-line .star-btn");
    const trailingButton = row.querySelector(":scope > .star-btn");
    if (trailingButton && !removableWrong) trailingButton.remove();
    if (!removableWrong && isFavorite(item.id)) {
      button.classList.add("is-on");
    }

    button.addEventListener("click", () => {
      if (removableWrong) {
        removeWrong(item.id);
      } else {
        const active = toggleFavorite(item.id);
        button.textContent = active ? "★" : "☆";
        button.classList.toggle("is-on", active);
      }
      onChange?.();
    });

    container.append(row);
  });
};
