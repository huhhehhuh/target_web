import { WORDS } from "../data/words.js";
import { addWrong, getFavorites, getWrong, setRecentScore } from "./storage.js";
import { byId, normalize, shuffle } from "./ui.js";

const directionSelect = byId("directionSelect");
const modeSelect = byId("modeSelect");
const sourceSelect = byId("sourceSelect");
const countInput = byId("countInput");
const startBtn = byId("startBtn");
const testCard = byId("testCard");
const scorePill = byId("scorePill");

const params = new URLSearchParams(location.search);
if (params.get("source")) {
  sourceSelect.value = params.get("source");
}

let questions = [];
let current = 0;
let correct = 0;
let locked = false;

const pickDirection = () => {
  if (directionSelect.value !== "mixed") return directionSelect.value;
  return Math.random() > 0.5 ? "word-to-meaning" : "meaning-to-word";
};

const pickMode = () => {
  if (modeSelect.value !== "mixed") return modeSelect.value;
  return Math.random() > 0.5 ? "choice" : "typing";
};

const getSourceWords = () => {
  if (sourceSelect.value === "wrong") {
    const ids = getWrong();
    return WORDS.filter((word) => ids.includes(word.id));
  }
  if (sourceSelect.value === "favorites") {
    const ids = getFavorites();
    return WORDS.filter((word) => ids.includes(word.id));
  }
  return WORDS;
};

const makeQuestion = (word) => {
  const direction = pickDirection();
  const mode = pickMode();
  const prompt = direction === "word-to-meaning" ? word.word : word.meaning;
  const answer = direction === "word-to-meaning" ? word.meaning : word.word;
  return { word, direction, mode, prompt, answer };
};

const startTest = () => {
  const sourceWords = getSourceWords();
  if (!sourceWords.length) {
    testCard.innerHTML = `<div class="empty">이 범위에는 출제할 단어가 없습니다.</div>`;
    return;
  }

  const requested = Math.min(Math.max(Number(countInput.value) || 20, 5), 100);
  questions = shuffle(sourceWords).slice(0, Math.min(requested, sourceWords.length)).map(makeQuestion);
  current = 0;
  correct = 0;
  scorePill.textContent = `0 / ${questions.length}`;
  renderQuestion();
};

const makeChoices = (question) => {
  const isMeaning = question.direction === "word-to-meaning";
  const pool = WORDS.filter((item) => item.id !== question.word.id);
  const distractors = shuffle(pool)
    .slice(0, 3)
    .map((item) => (isMeaning ? item.meaning : item.word));
  return shuffle([question.answer, ...distractors]);
};

const renderQuestion = () => {
  locked = false;
  const question = questions[current];
  const modeLabel = question.mode === "choice" ? "객관식" : "입력형";
  const directionLabel = question.direction === "word-to-meaning" ? "영어 → 뜻" : "뜻 → 영어";
  const head = `
    <div class="question-meta">${current + 1} / ${questions.length} · ${directionLabel} · ${modeLabel}</div>
    <div class="question-text">${question.prompt}</div>
  `;

  if (question.mode === "choice") {
    const choices = makeChoices(question)
      .map((choice) => `<button class="choice-btn" type="button">${choice}</button>`)
      .join("");
    testCard.innerHTML = `${head}<div class="choices">${choices}</div><div id="feedback"></div>`;
    testCard.querySelectorAll(".choice-btn").forEach((button) => {
      button.addEventListener("click", () => grade(button.textContent, button));
    });
  } else {
    testCard.innerHTML = `
      ${head}
      <form class="answer-form" id="answerForm">
        <input id="answerInput" autocomplete="off" placeholder="정답 입력" />
        <button class="primary-btn" type="submit">확인</button>
      </form>
      <div id="feedback"></div>
    `;
    byId("answerInput").focus();
    byId("answerForm").addEventListener("submit", (event) => {
      event.preventDefault();
      grade(byId("answerInput").value);
    });
  }
};

const grade = (given, selectedButton = null) => {
  if (locked) return;
  locked = true;
  const question = questions[current];
  const ok = normalize(given) === normalize(question.answer);

  if (ok) {
    correct += 1;
  } else {
    addWrong(question.word.id);
  }

  if (selectedButton) {
    testCard.querySelectorAll(".choice-btn").forEach((button) => {
      if (normalize(button.textContent) === normalize(question.answer)) button.classList.add("correct");
    });
    if (!ok) selectedButton.classList.add("wrong");
  }

  scorePill.textContent = `${correct} / ${questions.length}`;
  byId("feedback").innerHTML = `
    <div class="feedback">
      <strong>${ok ? "정답" : "오답"}</strong>
      <p>정답: ${question.answer}</p>
      <p>${question.word.word} - ${question.word.meaning}</p>
      <button class="primary-btn" id="nextBtn" type="button">${current + 1 === questions.length ? "결과 보기" : "다음"}</button>
    </div>
  `;
  byId("nextBtn").focus();
  byId("nextBtn").addEventListener("click", nextQuestion);
};

const nextQuestion = () => {
  current += 1;
  if (current >= questions.length) {
    const percent = Math.round((correct / questions.length) * 100);
    const score = `${correct}/${questions.length} (${percent}%)`;
    setRecentScore(score);
    scorePill.textContent = score;
    testCard.innerHTML = `
      <div class="question-meta">시험 완료</div>
      <div class="question-text">${score}</div>
      <div class="button-row">
        <button class="primary-btn" id="retryBtn" type="button">다시 풀기</button>
        <a class="ghost-btn as-link" href="./wrong.html">오답보기</a>
      </div>
    `;
    byId("retryBtn").addEventListener("click", startTest);
    return;
  }
  renderQuestion();
};

startBtn.addEventListener("click", startTest);
