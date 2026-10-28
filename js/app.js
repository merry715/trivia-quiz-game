/* ── 상수 ────────────────────────────────────────────── */
const CATEGORY_LABELS = {
  history: '역사', science: '과학', geography: '지리', general: '일반 상식',
};
const CATEGORY_ORDER = ['history', 'science', 'geography', 'general'];
const STORAGE_KEY    = 'quiz_records';

/* ── 모듈 변수 ───────────────────────────────────────── */
let allQuestions  = [];
let storageOk     = false;
let currentLbMode = 'all';

/* ── 게임 상태 ───────────────────────────────────────── */
const state = {
  nickname:     '',
  mode:         null,
  questions:    [],
  currentIndex: 0,
  score:        0,
  startTime:    null,
  answered:     false,
  answers:      [],       // {isCorrect, selectedText, correctText, question, explanation}
  lastRecordId: null,     // 방금 저장한 기록 ID (순위표 강조용)
  prevScreen:   null,     // 순위표·오답노트에서 돌아갈 화면
};

/* ── 셔플 / 문제 구성 ────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleChoices(q) {
  const indexed = q.choices.map((text, i) => ({ text, originalIndex: i }));
  const shuffled = shuffle(indexed);
  return {
    shuffledChoices:     shuffled.map(x => x.text),
    shuffledAnswerIndex: shuffled.findIndex(x => x.originalIndex === q.answerIndex),
  };
}

function buildQuestions(qs, mode) {
  const pool = mode === 'all'
    ? CATEGORY_ORDER.flatMap(cat => shuffle(qs.filter(q => q.category === cat)))
    : shuffle(qs.filter(q => q.category === mode));
  return pool.map(q => ({ ...q, ...shuffleChoices(q) }));
}

/* ── localStorage ────────────────────────────────────── */
function checkStorage() {
  try {
    localStorage.setItem('__q__', '1');
    localStorage.removeItem('__q__');
    return true;
  } catch { return false; }
}

function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveRecord(rec) {
  if (!storageOk) return;
  try {
    const records = loadRecords();
    records.push(rec);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch { /* 용량 초과 등 — 무시하고 게임 계속 */ }
}

/* ── 순위 정렬 (score↓ → durationSec↑ → playedAt↑) ── */
function sortRecords(records) {
  return [...records].sort((a, b) => {
    if (b.score !== a.score)           return b.score - a.score;
    if (a.durationSec !== b.durationSec) return a.durationSec - b.durationSec;
    return new Date(a.playedAt) - new Date(b.playedAt);
  });
}

/* ── 화면 전환 ───────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── 퀴즈 화면 렌더링 ────────────────────────────────── */
function renderQuestion() {
  const q     = state.questions[state.currentIndex];
  const total = state.questions.length;

  document.getElementById('quiz-progress').textContent = `${state.currentIndex + 1} / ${total}`;
  document.getElementById('quiz-category').textContent = CATEGORY_LABELS[q.category];
  document.getElementById('quiz-score').textContent    = `${state.score}점`;

  const pct = ((state.currentIndex + 1) / total * 100).toFixed(1);
  document.getElementById('progress-bar').style.width = `${pct}%`;

  document.getElementById('quiz-question').textContent = q.question;

  document.querySelectorAll('.btn-choice').forEach((btn, i) => {
    btn.textContent = q.shuffledChoices[i];
    btn.disabled    = false;
    btn.className   = 'btn-choice';
  });

  document.getElementById('quiz-feedback').className = 'feedback hidden';
  state.answered = false;
}

/* ── 보기 선택 (F-05/06/07) ─────────────────────────── */
function handleChoice(selectedIdx) {
  if (state.answered) return;
  state.answered = true;

  const q         = state.questions[state.currentIndex];
  const isCorrect = selectedIdx === q.shuffledAnswerIndex;
  if (isCorrect) state.score += 10;

  // F-11 오답 노트용 기록
  state.answers.push({
    isCorrect,
    selectedText: q.shuffledChoices[selectedIdx],
    correctText:  q.shuffledChoices[q.shuffledAnswerIndex],
    question:     q.question,
    explanation:  q.explanation,
  });

  document.getElementById('quiz-score').textContent = `${state.score}점`;

  document.querySelectorAll('.btn-choice').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.shuffledAnswerIndex) btn.classList.add('correct');
    if (i === selectedIdx && !isCorrect) btn.classList.add('wrong');
  });

  const feedback  = document.getElementById('quiz-feedback');
  const iconEl    = feedback.querySelector('.feedback-icon');
  const verdictEl = feedback.querySelector('.feedback-verdict');
  const answerEl  = feedback.querySelector('.feedback-answer');
  const explanEl  = feedback.querySelector('.feedback-explanation');
  const nextBtn   = document.getElementById('btn-next');

  feedback.className    = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
  iconEl.textContent    = isCorrect ? '⭕' : '❌';
  verdictEl.textContent = isCorrect ? '정답입니다!' : '오답!';

  if (!isCorrect) {
    answerEl.textContent = `정답: ${q.shuffledChoices[q.shuffledAnswerIndex]}`;
    answerEl.classList.remove('hidden');
  } else {
    answerEl.classList.add('hidden');
  }

  explanEl.textContent = q.explanation;
  nextBtn.textContent  = state.currentIndex === state.questions.length - 1 ? '결과 보기' : '다음';

  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function nextQuestion() {
  if (state.currentIndex === state.questions.length - 1) {
    showResult();
  } else {
    state.currentIndex++;
    renderQuestion();
  }
}

/* ── 결과 화면 (F-08/09) ─────────────────────────────── */
function showResult() {
  const total   = state.questions.length;
  const correct = state.score / 10;
  const elapsed = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
  const pct     = Math.round(correct / total * 100);
  const mins    = Math.floor(elapsed / 60);
  const secs    = elapsed % 60;

  document.getElementById('result-emoji').textContent    = pct === 100 ? '🎉' : pct >= 70 ? '😊' : pct >= 40 ? '😐' : '😢';
  document.getElementById('result-nickname').textContent = `${state.nickname} 님의 결과`;
  document.getElementById('result-score').textContent    = `${state.score} / ${total * 10}점`;
  document.getElementById('result-correct').textContent  = `${correct} / ${total}`;
  document.getElementById('result-time').textContent     = `${mins}분 ${String(secs).padStart(2, '0')}초`;

  // 카테고리별 정답률 (전체 도전 모드만)
  const breakdown = document.getElementById('result-category-breakdown');
  if (state.mode === 'all') {
    renderCategoryBreakdown();
    breakdown.classList.remove('hidden');
  } else {
    breakdown.classList.add('hidden');
  }

  // F-09 저장
  const recId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  state.lastRecordId = recId;
  saveRecord({
    id:           recId,
    nickname:     state.nickname,
    mode:         state.mode,
    score:        state.score,
    correctCount: correct,
    totalCount:   total,
    durationSec:  elapsed,
    playedAt:     new Date().toISOString(),
  });

  document.getElementById('result-storage-warn').classList.toggle('hidden', storageOk);

  showScreen('screen-result');
}

function renderCategoryBreakdown() {
  const list = document.getElementById('breakdown-list');
  list.innerHTML = '';

  CATEGORY_ORDER.forEach(cat => {
    const items = state.questions
      .map((q, i) => ({ q, ans: state.answers[i] }))
      .filter(({ q }) => q.category === cat);
    if (!items.length) return;

    const catCorrect = items.filter(({ ans }) => ans && ans.isCorrect).length;
    const catTotal   = items.length;
    const catPct     = Math.round(catCorrect / catTotal * 100);

    const item    = document.createElement('div');
    item.className = 'breakdown-item';

    const label = document.createElement('span');
    label.className   = 'breakdown-label';
    label.textContent = CATEGORY_LABELS[cat];

    const barWrap = document.createElement('div');
    barWrap.className = 'breakdown-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'breakdown-bar';
    // setTimeout 으로 CSS transition 을 발동시킴
    setTimeout(() => { bar.style.width = `${catPct}%`; }, 50);

    const stat = document.createElement('span');
    stat.className   = 'breakdown-stat';
    stat.textContent = `${catCorrect}/${catTotal} (${catPct}%)`;

    barWrap.appendChild(bar);
    item.append(label, barWrap, stat);
    list.appendChild(item);
  });
}

/* ── 오답 노트 (F-11) ────────────────────────────────── */
function showWrongNotes(fromScreen) {
  state.prevScreen = fromScreen;
  const list = document.getElementById('wrong-list');
  list.innerHTML = '';

  const wrongs = state.answers.filter(a => !a.isCorrect);

  if (!wrongs.length) {
    const msg = document.createElement('p');
    msg.className   = 'wrong-empty';
    msg.textContent = '🎊 오답이 없어요! 완벽합니다!';
    list.appendChild(msg);
    showScreen('screen-wrong');
    return;
  }

  wrongs.forEach((ans, i) => {
    const card = document.createElement('div');
    card.className = 'wrong-card';

    const num = document.createElement('p');
    num.className   = 'wrong-num';
    num.textContent = `오답 ${i + 1}`;

    const qEl = document.createElement('p');
    qEl.className   = 'wrong-question';
    qEl.textContent = ans.question;

    function makeRow(labelText, valueText, valueClass) {
      const row = document.createElement('div');
      row.className = 'wrong-row';
      const lbl = document.createElement('span');
      lbl.className   = 'wrong-label';
      lbl.textContent = labelText;
      const val = document.createElement('span');
      val.className   = valueClass;
      val.textContent = valueText;
      row.append(lbl, val);
      return row;
    }

    card.append(
      num,
      qEl,
      makeRow('내 답', ans.selectedText, 'wrong-value wrong-wrong'),
      makeRow('정답',  ans.correctText,  'wrong-value wrong-correct'),
      makeRow('해설',  ans.explanation,  'wrong-expl'),
    );
    list.appendChild(card);
  });

  showScreen('screen-wrong');
}

/* ── 순위표 (F-10) ───────────────────────────────────── */
function showLeaderboard(fromScreen) {
  state.prevScreen = fromScreen;
  renderLeaderboard(currentLbMode);
  showScreen('screen-leaderboard');
}

function renderLeaderboard(mode) {
  currentLbMode = mode;

  document.querySelectorAll('.lb-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.mode === mode)
  );

  const content = document.getElementById('lb-content');
  content.innerHTML = '';

  if (!storageOk) {
    const msg = document.createElement('p');
    msg.className   = 'lb-storage-warn';
    msg.textContent = '기록 저장 불가 — 이 환경에서는 localStorage를 사용할 수 없습니다.';
    content.appendChild(msg);
    return;
  }

  const records  = loadRecords();
  const filtered = sortRecords(records.filter(r => r.mode === mode)).slice(0, 10);

  if (!filtered.length) {
    const msg = document.createElement('p');
    msg.className   = 'lb-empty';
    msg.textContent = '아직 기록이 없습니다. 도전해 보세요!';
    content.appendChild(msg);
    return;
  }

  filtered.forEach((rec, i) => {
    const rank  = i + 1;
    const isNew = rec.id === state.lastRecordId;
    const row   = document.createElement('div');
    row.className = 'lb-row' + (isNew ? ' lb-row-new' : '');

    const rankEl = document.createElement('span');
    rankEl.className   = 'lb-rank';
    rankEl.textContent = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;

    const nameEl = document.createElement('span');
    nameEl.className   = 'lb-name';
    nameEl.textContent = rec.nickname;

    const scoreEl = document.createElement('span');
    scoreEl.className   = 'lb-score';
    scoreEl.textContent = `${rec.score}점`;

    const m = Math.floor(rec.durationSec / 60);
    const s = rec.durationSec % 60;
    const timeEl = document.createElement('span');
    timeEl.className   = 'lb-time';
    timeEl.textContent = `${m}:${String(s).padStart(2, '0')}`;

    row.append(rankEl, nameEl, scoreEl, timeEl);
    content.appendChild(row);
  });
}

/* ── F-12 다시 하기 ──────────────────────────────────── */
function retryGame() {
  state.questions    = buildQuestions(allQuestions, state.mode);
  state.currentIndex = 0;
  state.score        = 0;
  state.answered     = false;
  state.answers      = [];
  state.lastRecordId = null;
  state.startTime    = Date.now();
  renderQuestion();
  showScreen('screen-quiz');
}

/* ── 초기화 ──────────────────────────────────────────── */
(async function init() {
  storageOk = checkStorage();

  const res = await fetch('./data/questions.json');
  allQuestions = (await res.json()).questions;

  /* F-01 닉네임 */
  const nicknameInput = document.getElementById('nickname-input');
  const btnStart      = document.getElementById('btn-start');

  nicknameInput.addEventListener('input', () => {
    const t = nicknameInput.value.trim();
    btnStart.disabled = t.length < 2 || t.length > 10;
  });

  btnStart.addEventListener('click', () => {
    state.nickname = nicknameInput.value.trim();
    document.getElementById('mode-greeting').textContent = `${state.nickname} 님, 안녕하세요!`;
    showScreen('screen-mode');
  });

  /* F-02 모드 선택 */
  document.querySelectorAll('.btn-mode, .btn-all').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode         = btn.dataset.mode;
      state.questions    = buildQuestions(allQuestions, state.mode);
      state.currentIndex = 0;
      state.score        = 0;
      state.answered     = false;
      state.answers      = [];
      state.lastRecordId = null;
      state.startTime    = Date.now();
      renderQuestion();
      showScreen('screen-quiz');
    });
  });

  /* F-05 보기 클릭 */
  document.querySelectorAll('.btn-choice').forEach(btn =>
    btn.addEventListener('click', () => handleChoice(Number(btn.dataset.idx)))
  );

  /* F-06 다음 버튼 */
  document.getElementById('btn-next').addEventListener('click', nextQuestion);

  /* 결과 화면 버튼 */
  document.getElementById('btn-retry').addEventListener('click', retryGame);
  document.getElementById('btn-wrong-notes').addEventListener('click', () => showWrongNotes('screen-result'));
  document.getElementById('btn-to-leaderboard').addEventListener('click', () => showLeaderboard('screen-result'));
  document.getElementById('btn-restart').addEventListener('click', () => {
    nicknameInput.value = '';
    btnStart.disabled   = true;
    showScreen('screen-start');
  });

  /* 순위표 (시작 화면) */
  document.getElementById('btn-start-leaderboard').addEventListener('click', () => showLeaderboard('screen-start'));

  /* 순위표 탭 */
  document.querySelectorAll('.lb-tab').forEach(tab =>
    tab.addEventListener('click', () => renderLeaderboard(tab.dataset.mode))
  );

  /* 순위표 돌아가기 */
  document.getElementById('btn-lb-back').addEventListener('click', () =>
    showScreen(state.prevScreen || 'screen-start')
  );

  /* 오답 노트 돌아가기 */
  document.getElementById('btn-wrong-back').addEventListener('click', () =>
    showScreen(state.prevScreen || 'screen-result')
  );

  /* F-13 키보드 단축키 */
  document.addEventListener('keydown', e => {
    const active = document.querySelector('.screen.active');
    if (!active || active.id !== 'screen-quiz') return;

    if (!state.answered && ['1', '2', '3', '4'].includes(e.key)) {
      const idx  = Number(e.key) - 1;
      const btns = document.querySelectorAll('.btn-choice');
      if (btns[idx] && !btns[idx].disabled) handleChoice(idx);
    }

    if (state.answered && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      document.getElementById('btn-next').click();
    }
  });
})();
