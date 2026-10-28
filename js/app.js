/* ── 상수 ────────────────────────────────── */
const CATEGORY_LABELS = {
  history:   '역사',
  science:   '과학',
  geography: '지리',
  general:   '일반 상식',
};

const CATEGORY_ORDER = ['history', 'science', 'geography', 'general'];

/* ── 게임 상태 ──────────────────────────── */
const state = {
  nickname:     '',
  mode:         null,   // 'history' | 'science' | 'geography' | 'general' | 'all'
  questions:    [],     // 섞인 문제 배열, 각 항목에 shuffledChoices·shuffledAnswerIndex 포함
  currentIndex: 0,
  score:        0,
  startTime:    null,   // 첫 문제 표시 시각 (ms)
  answered:     false,
};

/* ── 유틸 ────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * choices 를 무작위로 섞되 정답 위치를 정확히 추적한다.
 * originalIndex 를 키로 삼아 섞인 뒤 정답이 몇 번째에 있는지 찾는다.
 */
function shuffleChoices(question) {
  const indexed = question.choices.map((text, i) => ({ text, originalIndex: i }));
  const shuffled = shuffle(indexed);
  return {
    shuffledChoices:      shuffled.map(item => item.text),
    shuffledAnswerIndex:  shuffled.findIndex(item => item.originalIndex === question.answerIndex),
  };
}

/**
 * 선택한 모드에 맞게 문제 배열을 구성한다.
 * - 카테고리 모드: 해당 카테고리 10문제 순서 섞기
 * - 전체 도전:     카테고리 순서(history→science→geography→general)를 유지하되,
 *                 각 카테고리 안에서는 순서를 섞는다
 */
function buildQuestions(allQuestions, mode) {
  const pool = mode === 'all'
    ? CATEGORY_ORDER.flatMap(cat =>
        shuffle(allQuestions.filter(q => q.category === cat))
      )
    : shuffle(allQuestions.filter(q => q.category === mode));

  return pool.map(q => {
    const { shuffledChoices, shuffledAnswerIndex } = shuffleChoices(q);
    return { ...q, shuffledChoices, shuffledAnswerIndex };
  });
}

/* ── 화면 전환 ──────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── 퀴즈 화면 렌더링 ────────────────────── */
function renderQuestion() {
  const q     = state.questions[state.currentIndex];
  const total = state.questions.length;

  // 헤더
  document.getElementById('quiz-progress').textContent  = `${state.currentIndex + 1} / ${total}`;
  document.getElementById('quiz-category').textContent  = CATEGORY_LABELS[q.category];
  document.getElementById('quiz-score').textContent     = `${state.score}점`;

  // 진행 바
  const pct = ((state.currentIndex + 1) / total * 100).toFixed(1);
  document.getElementById('progress-bar').style.width = `${pct}%`;

  // 문제
  document.getElementById('quiz-question').textContent = q.question;

  // 보기 버튼 초기화
  document.querySelectorAll('.btn-choice').forEach((btn, i) => {
    btn.textContent = q.shuffledChoices[i];
    btn.disabled    = false;
    btn.className   = 'btn-choice';
  });

  // 피드백 숨김
  const feedback = document.getElementById('quiz-feedback');
  feedback.className = 'feedback hidden';

  state.answered = false;
}

/* ── 보기 선택 처리 ─────────────────────── */
function handleChoice(selectedIdx) {
  if (state.answered) return;
  state.answered = true;

  const q         = state.questions[state.currentIndex];
  const isCorrect = selectedIdx === q.shuffledAnswerIndex;
  if (isCorrect) state.score += 10;

  // 점수 즉시 갱신
  document.getElementById('quiz-score').textContent = `${state.score}점`;

  // 보기 버튼 색상 처리
  document.querySelectorAll('.btn-choice').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.shuffledAnswerIndex) btn.classList.add('correct');
    if (i === selectedIdx && !isCorrect) btn.classList.add('wrong');
  });

  // 피드백 영역 표시
  const feedback    = document.getElementById('quiz-feedback');
  const iconEl      = feedback.querySelector('.feedback-icon');
  const verdictEl   = feedback.querySelector('.feedback-verdict');
  const answerEl    = feedback.querySelector('.feedback-answer');
  const explanEl    = feedback.querySelector('.feedback-explanation');
  const nextBtn     = document.getElementById('btn-next');

  feedback.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;

  iconEl.textContent    = isCorrect ? '⭕' : '❌';
  verdictEl.textContent = isCorrect ? '정답입니다!' : '오답!';

  if (!isCorrect) {
    answerEl.textContent = `정답: ${q.shuffledChoices[q.shuffledAnswerIndex]}`;
    answerEl.classList.remove('hidden');
  } else {
    answerEl.classList.add('hidden');
  }

  explanEl.textContent = q.explanation;

  const isLast = state.currentIndex === state.questions.length - 1;
  nextBtn.textContent  = isLast ? '결과 보기' : '다음';

  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── 다음 문제 / 결과 화면 ──────────────── */
function nextQuestion() {
  if (state.currentIndex === state.questions.length - 1) {
    showResult();
  } else {
    state.currentIndex++;
    renderQuestion();
  }
}

/* ── 결과 화면 ──────────────────────────── */
function showResult() {
  const total   = state.questions.length;
  const correct = state.score / 10;
  const elapsed = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
  const mins    = Math.floor(elapsed / 60);
  const secs    = elapsed % 60;

  // textContent 로만 출력 (HTML 삽입 방지)
  document.getElementById('result-nickname').textContent =
    `${state.nickname} 님의 결과`;
  document.getElementById('result-score').textContent =
    `${state.score} / ${total * 10}점`;
  document.getElementById('result-rate').textContent =
    `${correct} / ${total} (${Math.round(correct / total * 100)}%)`;
  document.getElementById('result-time').textContent =
    `${mins}분 ${String(secs).padStart(2, '0')}초`;

  showScreen('screen-result');
}

/* ── 초기화 ─────────────────────────────── */
(async function init() {
  const res = await fetch('./data/questions.json');
  const { questions } = await res.json();

  /* F-01 닉네임 검증 */
  const nicknameInput = document.getElementById('nickname-input');
  const btnStart      = document.getElementById('btn-start');

  nicknameInput.addEventListener('input', () => {
    const trimmed = nicknameInput.value.trim();
    btnStart.disabled = trimmed.length < 2 || trimmed.length > 10;
  });

  btnStart.addEventListener('click', () => {
    state.nickname = nicknameInput.value.trim();
    // textContent 로만 삽입
    document.getElementById('mode-greeting').textContent =
      `${state.nickname} 님, 안녕하세요!`;
    showScreen('screen-mode');
  });

  /* F-02 모드 선택 */
  document.querySelectorAll('.btn-mode, .btn-all').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode         = btn.dataset.mode;
      state.questions    = buildQuestions(questions, state.mode);
      state.currentIndex = 0;
      state.score        = 0;
      state.answered     = false;
      state.startTime    = Date.now(); // 첫 문제 표시 시각 기록
      renderQuestion();
      showScreen('screen-quiz');
    });
  });

  /* F-05 보기 클릭 */
  document.querySelectorAll('.btn-choice').forEach(btn => {
    btn.addEventListener('click', () => handleChoice(Number(btn.dataset.idx)));
  });

  /* F-06 다음 버튼 */
  document.getElementById('btn-next').addEventListener('click', nextQuestion);

  /* 다시 시작 */
  document.getElementById('btn-restart').addEventListener('click', () => {
    nicknameInput.value  = '';
    btnStart.disabled    = true;
    showScreen('screen-start');
  });
})();
