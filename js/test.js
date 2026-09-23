import { WORDS } from "../data/words.js";
import { addWrong, getFavorites, getWrong, setRecentScore } from "./storage.js";

// DOM 요소
const settingsEl = document.querySelector('.settings');
const testCard = document.getElementById('testCard');
const startBtn = document.getElementById('startBtn');
const scorePill = document.getElementById('scorePill');

const directionSelect = document.getElementById('directionSelect');
const modeSelect = document.getElementById('modeSelect');
const sourceSelect = document.getElementById('sourceSelect');
const countInput = document.getElementById('countInput');

// 상태 변수
let questions = [];
let currentIndex = 0;
let score = 0;
let wrongAnswers = [];

// URL 파라미터 체크 (예: ?source=favorites)
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const srcParam = params.get('source');
  if (srcParam && sourceSelect) {
    sourceSelect.value = srcParam;
  }
});

startBtn.addEventListener('click', startTest);

function startTest() {
  const direction = directionSelect.value;
  const mode = modeSelect.value;
  const source = sourceSelect.value;
  let count = parseInt(countInput.value, 10) || 20;

  let pool = [...WORDS];

  if (source === 'favorites') {
    const favs = getFavorites();
    pool = pool.filter(w => favs.includes(w.id));
  } else if (source === 'wrong') {
    const wrongs = getWrong();
    pool = pool.filter(w => wrongs.includes(w.id));
  }

  if (pool.length === 0) {
    alert('선택한 범위에 해당하는 단어가 없습니다.');
    return;
  }

  // Shuffle pool
  pool.sort(() => Math.random() - 0.5);
  count = Math.min(count, pool.length);
  const selectedWords = pool.slice(0, count);

  questions = selectedWords.map(word => {
    let currentDirection = direction;
    if (direction === 'mixed') {
      currentDirection = Math.random() > 0.5 ? 'word-to-meaning' : 'meaning-to-word';
    }

    let currentMode = mode;
    if (mode === 'mixed') {
      currentMode = Math.random() > 0.5 ? 'choice' : 'typing';
    }

    return {
      wordObj: word,
      direction: currentDirection,
      mode: currentMode
    };
  });

  currentIndex = 0;
  score = 0;
  wrongAnswers = [];

  // [개선 2] 시험 시작 시 설정창 숨기기
  if (settingsEl) {
    settingsEl.style.display = 'none';
  }

  renderQuestion();
}

function renderQuestion() {
  if (currentIndex >= questions.length) {
    finishTest();
    return;
  }

  scorePill.textContent = `${currentIndex + 1} / ${questions.length}`;

  const q = questions[currentIndex];
  const { wordObj, direction, mode } = q;

  const questionText = direction === 'word-to-meaning' ? wordObj.word : wordObj.meaning;
  const answerText = direction === 'word-to-meaning' ? wordObj.meaning : wordObj.word;

  let html = `
    <div class="test-card-inner">
      <div class="q-badge">${q.mode === 'choice' ? '객관식' : '서술형'} (${currentIndex + 1}/${questions.length})</div>
      <h2 class="q-text">${questionText}</h2>
  `;

  if (mode === 'choice') {
    // 오답 보기 3개 생성
    const otherWords = WORDS.filter(w => w.id !== wordObj.id);
    otherWords.sort(() => Math.random() - 0.5);
    const distractors = otherWords.slice(0, 3).map(w => direction === 'word-to-meaning' ? w.meaning : w.word);

    const options = [answerText, ...distractors];
    options.sort(() => Math.random() - 0.5);

    html += `<div class="options-grid">`;
    options.forEach(opt => {
      // opt 내 따옴표 예방 처리
      const safeOpt = opt.replace(/"/g, '&quot;');
      html += `<button class="option-btn" type="button" data-val="${safeOpt}">${opt}</button>`;
    });
    html += `</div>`;
  } else {
    // 서술형
    html += `
      <form id="typingForm" class="typing-box">
        <input type="text" id="typingInput" class="typing-input" placeholder="정답 입력..." autocomplete="off" autofocus />
        <button type="submit" class="primary-btn submit-btn">제출</button>
      </form>
    `;
  }

  html += `</div>`;
  testCard.innerHTML = html;

  // 이벤트 바인딩
  if (mode === 'choice') {
    const btns = testCard.querySelectorAll('.option-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.val, answerText));
    });
  } else {
    const form = document.getElementById('typingForm');
    const input = document.getElementById('typingInput');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAnswer(input.value.trim(), answerText);
    });
    input.focus();
  }
}

function handleAnswer(userAns, correctAns) {
  const q = questions[currentIndex];
  
  // 정답 처리 (공백 및 대소문자 정리)
  const isCorrect = userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();

  if (isCorrect) {
    score++;
    currentIndex++;
    // [개선 1] 맞았을 경우 확인 과정 없이 바로 다음 문제로 이동!
    renderQuestion();
  } else {
    // 틀렸을 경우 오답 저장 및 결과 확인 화면 표시
    wrongAnswers.push(q.wordObj);
    saveToWrongStorage(q.wordObj);

    testCard.innerHTML = `
      <div class="test-card-inner feedback-box">
        <div class="result-icon wrong">✕</div>
        <h3 class="feedback-title wrong-text">오답입니다</h3>
        <p class="user-ans">내가 쓴 답: <span>${userAns || '(빈칸)'}</span></p>
        <p class="correct-ans">정답: <strong>${correctAns}</strong></p>
        <button class="primary-btn next-btn" id="nextQuestionBtn" type="button">다음 문제</button>
      </div>
    `;

    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
      currentIndex++;
      renderQuestion();
    });
  }
}

function saveToWrongStorage(wordObj) {
  addWrong(wordObj.id);
}

function finishTest() {
  scorePill.textContent = '완료';

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  // 최근 점수 저장
  setRecentScore(`${score}/${total} (${percentage}점)`);

  testCard.innerHTML = `
    <div class="test-card-inner result-summary">
      <h2>시험 종료</h2>
      <div class="final-score">${score} / ${total}</div>
      <p class="score-desc">정답률: ${percentage}%</p>
      <div class="result-actions">
        <button class="primary-btn" id="restartBtn" type="button">다시 시험보기</button>
      </div>
    </div>
  `;

  document.getElementById('restartBtn').addEventListener('click', () => {
    // [개선 2] 시험 종료 후 다시 시작할 때 설정창 복원
    if (settingsEl) {
      settingsEl.style.display = 'grid';
    }
    testCard.innerHTML = `<p class="muted">설정을 고른 뒤 시작을 누르세요.</p>`;
    scorePill.textContent = '준비';
  });
}
