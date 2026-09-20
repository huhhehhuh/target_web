import { WORDS } from "../data/words.js";
import { clearFavorites, getFavorites } from "./storage.js";
import { byId, renderWordRows } from "./ui.js";

const favoriteList = byId("favoriteList");
const clearButton = byId("clearFavorites");

const render = () => {
  const ids = getFavorites();
  const words = WORDS.filter((word) => ids.includes(word.id));
  renderWordRows(favoriteList, words, {
    emptyText: "아직 즐겨찾기한 단어가 없습니다.",
    onChange: render,
  });
};

clearButton.addEventListener("click", () => {
  if (confirm("즐겨찾기를 모두 삭제할까요?")) {
    clearFavorites();
    render();
  }
});

render();
