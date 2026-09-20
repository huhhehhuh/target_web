const KEYS = {
  favorites: "targetVoca:favorites",
  wrong: "targetVoca:wrong",
  wrongCounts: "targetVoca:wrongCounts",
  recentScore: "targetVoca:recentScore",
};

const readArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeArray = (key, ids) => {
  localStorage.setItem(key, JSON.stringify([...new Set(ids)].sort((a, b) => a - b)));
};

const readWrongCounts = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEYS.wrongCounts) || "{}");
    if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed).map(([id, count]) => [Number(id), Math.max(Number(count) || 0, 0)]),
      );
    }
  } catch {
    return {};
  }
  return {};
};

const writeWrongCounts = (counts) => {
  const cleaned = Object.fromEntries(
    Object.entries(counts)
      .map(([id, count]) => [Number(id), Number(count)])
      .filter(([id, count]) => Number.isInteger(id) && count > 0),
  );
  localStorage.setItem(KEYS.wrongCounts, JSON.stringify(cleaned));
};

export const getFavorites = () => readArray(KEYS.favorites);
export const getWrongCounts = () => {
  const counts = readWrongCounts();
  if (Object.keys(counts).length) return counts;

  const legacyWrong = readArray(KEYS.wrong);
  return Object.fromEntries(legacyWrong.map((id) => [id, 1]));
};

export const getWrong = () => Object.keys(getWrongCounts()).map(Number).sort((a, b) => a - b);

export const isFavorite = (id) => getFavorites().includes(id);
export const isWrong = (id) => getWrong().includes(id);

export const toggleFavorite = (id) => {
  const current = getFavorites();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeArray(KEYS.favorites, next);
  return next.includes(id);
};

export const addWrong = (id) => {
  const counts = getWrongCounts();
  counts[id] = (counts[id] || 0) + 1;
  writeWrongCounts(counts);
  writeArray(KEYS.wrong, getWrong());
};

export const removeWrong = (id) => {
  const counts = getWrongCounts();
  delete counts[id];
  writeWrongCounts(counts);
  writeArray(KEYS.wrong, getWrong());
};

export const clearWrong = () => {
  writeWrongCounts({});
  writeArray(KEYS.wrong, []);
};
export const clearFavorites = () => writeArray(KEYS.favorites, []);

export const setRecentScore = (score) => {
  localStorage.setItem(KEYS.recentScore, score);
};

export const getRecentScore = () => localStorage.getItem(KEYS.recentScore) || "-";
