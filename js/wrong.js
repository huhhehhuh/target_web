import { WORDS } from "../data/words.js";
import { clearWrong, getWrong, getWrongCounts } from "./storage.js";
import { byId, renderWordRows } from "./ui.js";

const wrongList = byId("wrongList");
const clearButton = byId("clearWrong");

const render = () => {
  const ids = getWrong();
  const words = WORDS.filter((word) => ids.includes(word.id));
  const wrongCounts = getWrongCounts();
  const maxWrongCount = Math.max(1, ...Object.values(wrongCounts));
  renderWordRows(wrongList, words, {
    emptyText: "아직 저장된 오답이 없습니다.",
    removableWrong: true,
    wrongCounts,
    maxWrongCount,
    onChange: render,
  });
};

clearButton.addEventListener("click", () => {
  if (confirm("오답 목록을 모두 삭제할까요?")) {
    clearWrong();
    render();
  }
});

render();
