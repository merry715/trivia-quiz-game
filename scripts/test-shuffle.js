/**
 * 섞인 보기에서 정답 위치 추적 로직 테스트
 * app.js 의 shuffle / shuffleChoices 와 동일한 구현을 사용한다.
 */
const { questions } = require('../data/questions.json');

let passed = 0;
let failed = 0;

function fail(msg) { console.error(`  FAIL  ${msg}`); failed++; }
function pass()    { passed++; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleChoices(question) {
  const indexed = question.choices.map((text, i) => ({ text, originalIndex: i }));
  const shuffled = shuffle(indexed);
  return {
    shuffledChoices:     shuffled.map(item => item.text),
    shuffledAnswerIndex: shuffled.findIndex(item => item.originalIndex === question.answerIndex),
  };
}

console.log('=== 정답 추적 로직 테스트 ===\n');

/* 테스트 1: 섞은 뒤에도 shuffledChoices[shuffledAnswerIndex] 가 원래 정답과 일치 */
console.log('[Test 1] 섞인 보기에서 정답 위치 추적 (40문제 × 20회 = 800회)');
questions.forEach(q => {
  const originalAnswer = q.choices[q.answerIndex];
  for (let t = 0; t < 20; t++) {
    const { shuffledChoices, shuffledAnswerIndex } = shuffleChoices(q);
    if (shuffledChoices[shuffledAnswerIndex] === originalAnswer) {
      pass();
    } else {
      fail(`[${q.id}] trial ${t}: 기대값="${originalAnswer}", 실제="${shuffledChoices[shuffledAnswerIndex]}"`);
    }
  }
});

/* 테스트 2: 섞은 뒤 보기 4개가 모두 보존 */
console.log('[Test 2] 섞은 뒤 4개 보기가 모두 보존 (40문제)');
questions.forEach(q => {
  const { shuffledChoices } = shuffleChoices(q);
  const original = [...q.choices].sort();
  const shuffled = [...shuffledChoices].sort();
  if (JSON.stringify(original) === JSON.stringify(shuffled)) {
    pass();
  } else {
    fail(`[${q.id}] 보기 내용이 달라졌음`);
  }
});

/* 테스트 3: shuffledAnswerIndex 가 항상 0~3 범위 */
console.log('[Test 3] shuffledAnswerIndex 범위 검사 (40문제 × 10회 = 400회)');
questions.forEach(q => {
  for (let t = 0; t < 10; t++) {
    const { shuffledAnswerIndex } = shuffleChoices(q);
    if (shuffledAnswerIndex >= 0 && shuffledAnswerIndex <= 3) {
      pass();
    } else {
      fail(`[${q.id}] shuffledAnswerIndex=${shuffledAnswerIndex} (범위 초과)`);
    }
  }
});

/* 테스트 4: 정답이 네 위치(0~3)에 골고루 분포하는지 확인 (분포 편향 검출) */
console.log('[Test 4] 정답 위치 분포 편향 검사 (질문당 100회 샘플링)');
let biasFailures = 0;
questions.forEach(q => {
  const counts = [0, 0, 0, 0];
  for (let t = 0; t < 100; t++) {
    counts[shuffleChoices(q).shuffledAnswerIndex]++;
  }
  // 어느 위치도 0회이면 편향 의심 (기대: 각 약 25회)
  if (counts.some(c => c === 0)) {
    fail(`[${q.id}] 정답 위치 분포 이상: [${counts}]`);
    biasFailures++;
  } else {
    pass();
  }
});
if (biasFailures === 0) console.log('  → 모든 문제에서 정답이 4개 위치에 고르게 분포');

/* 결과 요약 */
console.log(`\n=== 결과 요약 ===`);
console.log(`  총 테스트: ${passed + failed}`);
console.log(`  PASS: ${passed}`);
console.log(`  FAIL: ${failed}`);
if (failed === 0) {
  console.log('\n모든 테스트 통과 — 섞인 보기에서도 정답 위치가 정확히 추적됩니다.');
  process.exit(0);
} else {
  console.error('\n실패한 테스트가 있습니다. 위의 FAIL 항목을 확인하세요.');
  process.exit(1);
}
