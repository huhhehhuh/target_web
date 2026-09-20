import { WORDS } from "../data/words.js";
import { byId, normalize, renderWordRows } from "./ui.js";

const wordList = byId("wordList");
const searchInput = byId("searchInput");
const rangeSelect = byId("rangeSelect");
const listCount = byId("listCount");
const toggleMeanings = byId("toggleMeanings");

let meaningsHidden = false;

const inRange = (word) => {
  if (rangeSelect.value === "all") return true;
  const [start, end] = rangeSelect.value.split("-").map(Number);
  return word.id >= start && word.id <= end;
};

const render = () => {
  const query = normalize(searchInput.value);
  const filtered = WORDS.filter((word) => {
    const target = normalize(`${word.word} ${word.meaning} ${word.no}`);
    return inRange(word) && target.includes(query);
  });
  wordList.classList.toggle("hidden-meaning", meaningsHidden);
  listCount.textContent = `${filtered.length}개 표시 중`;
  renderWordRows(wordList, filtered);
};

searchInput.addEventListener("input", render);
rangeSelect.addEventListener("change", render);
toggleMeanings.addEventListener("click", () => {
  meaningsHidden = !meaningsHidden;
  toggleMeanings.textContent = meaningsHidden ? "뜻 보이기" : "뜻 가리기";
  render();
});

render();
