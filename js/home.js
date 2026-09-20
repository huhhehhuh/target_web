import { WORDS } from "../data/words.js";
import { getFavorites, getRecentScore, getWrong } from "./storage.js";
import { byId } from "./ui.js";

byId("totalCount").textContent = WORDS.length;
byId("wrongCount").textContent = getWrong().length;
byId("favoriteCount").textContent = getFavorites().length;
byId("recentScore").textContent = `최근 점수 ${getRecentScore()}`;
