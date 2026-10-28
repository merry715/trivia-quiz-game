const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'questions.json');
let exitCode = 0;

function pass(msg) { console.log(`  PASS  ${msg}`); }
function fail(msg) { console.error(`  FAIL  ${msg}`); exitCode = 1; }

console.log('=== questions.json 유효성 검사 ===\n');

// 1. JSON 파싱
let data;
try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  data = JSON.parse(raw);
  pass('유효한 JSON 형식');
} catch (e) {
  fail(`JSON 파싱 오류: ${e.message}`);
  process.exit(1);
}

const questions = data.questions;
const CATEGORIES = ['history', 'science', 'geography', 'general'];
const REQUIRED_FIELDS = ['id', 'category', 'difficulty', 'question', 'choices', 'answerIndex', 'explanation'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// 2. 총 문제 수
if (questions.length === 40) {
  pass(`총 문제 수: ${questions.length}개 (40개 충족)`);
} else {
  fail(`총 문제 수: ${questions.length}개 (40개 필요)`);
}

// 3. 카테고리별 문제 수
console.log('');
const byCategory = {};
CATEGORIES.forEach(c => { byCategory[c] = []; });

questions.forEach(q => {
  if (byCategory[q.category] !== undefined) {
    byCategory[q.category].push(q);
  }
});

CATEGORIES.forEach(cat => {
  const count = byCategory[cat].length;
  if (count === 10) {
    pass(`${cat}: ${count}문제`);
  } else {
    fail(`${cat}: ${count}문제 (10문제 필요)`);
  }
});

// 4. 카테고리별 난이도 분포
console.log('');
CATEGORIES.forEach(cat => {
  const byCat = byCategory[cat];
  const easy   = byCat.filter(q => q.difficulty === 'easy').length;
  const medium = byCat.filter(q => q.difficulty === 'medium').length;
  const hard   = byCat.filter(q => q.difficulty === 'hard').length;
  if (easy === 4 && medium === 4 && hard === 2) {
    pass(`${cat} 난이도: 쉬움 ${easy} / 보통 ${medium} / 어려움 ${hard}`);
  } else {
    fail(`${cat} 난이도: 쉬움 ${easy} / 보통 ${medium} / 어려움 ${hard} (4/4/2 필요)`);
  }
});

// 5. 각 문제 필드 검사
console.log('');
let fieldErrors = 0;
questions.forEach(q => {
  REQUIRED_FIELDS.forEach(f => {
    if (q[f] === undefined || q[f] === null) {
      fail(`${q.id}: 필드 '${f}' 누락`);
      fieldErrors++;
    }
  });
  if (!Array.isArray(q.choices) || q.choices.length !== 4) {
    fail(`${q.id}: choices가 4개가 아님 (현재 ${Array.isArray(q.choices) ? q.choices.length : 'N/A'}개)`);
    fieldErrors++;
  }
  if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) {
    fail(`${q.id}: answerIndex(${q.answerIndex})가 0~3 범위를 벗어남`);
    fieldErrors++;
  }
  if (!CATEGORIES.includes(q.category)) {
    fail(`${q.id}: 알 수 없는 카테고리 '${q.category}'`);
    fieldErrors++;
  }
  if (!DIFFICULTIES.includes(q.difficulty)) {
    fail(`${q.id}: 알 수 없는 난이도 '${q.difficulty}'`);
    fieldErrors++;
  }
});
if (fieldErrors === 0) {
  pass('모든 문제 필수 필드 정상');
}

// 6. ID 중복 검사
const ids = questions.map(q => q.id);
const uniqueIds = new Set(ids);
if (uniqueIds.size === ids.length) {
  pass(`ID 중복 없음 (${ids.length}개 고유)`);
} else {
  fail(`중복 ID 존재: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(', ')}`);
}

// 7. answerIndex가 실제 choices 범위 내인지
let answerErrors = 0;
questions.forEach(q => {
  if (Array.isArray(q.choices) && q.choices[q.answerIndex] === undefined) {
    fail(`${q.id}: answerIndex(${q.answerIndex})에 해당하는 보기가 없음`);
    answerErrors++;
  }
});
if (answerErrors === 0) {
  pass('모든 answerIndex가 유효한 보기를 가리킴');
}

// 요약
console.log('\n=== 결과 요약 ===');
if (exitCode === 0) {
  console.log('검사 통과 - questions.json이 모든 조건을 충족합니다.');
} else {
  console.error('검사 실패 - 위의 FAIL 항목을 확인하세요.');
}
process.exit(exitCode);
