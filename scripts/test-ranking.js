/**
 * 순위 정렬 로직 테스트 (동점 케이스 포함)
 * 기준: score 내림차순 → durationSec 오름차순 → playedAt 오름차순
 */

/* ── 테스트 대상 함수 (app.js 와 동일한 구현) ── */
function sortRecords(records) {
  return [...records].sort((a, b) => {
    if (b.score !== a.score)             return b.score - a.score;
    if (a.durationSec !== b.durationSec) return a.durationSec - b.durationSec;
    return new Date(a.playedAt) - new Date(b.playedAt);
  });
}

/* ── 테스트 헬퍼 ── */
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function makeRec(id, score, durationSec, playedAt) {
  return { id, nickname: id, mode: 'history', score, durationSec, playedAt };
}

console.log('=== 순위 정렬 로직 테스트 ===\n');

/* ── 케이스 1: 점수가 모두 다른 경우 ── */
console.log('[Case 1] 점수가 모두 다를 때 — score 내림차순');
{
  const recs = [
    makeRec('C', 70, 100, '2026-01-01T10:00:00Z'),
    makeRec('A', 90, 200, '2026-01-01T10:00:00Z'),
    makeRec('B', 80, 150, '2026-01-01T10:00:00Z'),
  ];
  const sorted = sortRecords(recs).map(r => r.id);
  assert(JSON.stringify(sorted) === JSON.stringify(['A', 'B', 'C']),
    `결과: [${sorted}] (기대: A, B, C)`);
}

/* ── 케이스 2: 점수 동점, 시간이 다른 경우 ── */
console.log('[Case 2] 점수 동점일 때 — durationSec 오름차순');
{
  const recs = [
    makeRec('X', 80, 300, '2026-01-01T10:00:00Z'),
    makeRec('Y', 80, 100, '2026-01-01T10:00:00Z'),
    makeRec('Z', 80, 200, '2026-01-01T10:00:00Z'),
  ];
  const sorted = sortRecords(recs).map(r => r.id);
  assert(JSON.stringify(sorted) === JSON.stringify(['Y', 'Z', 'X']),
    `결과: [${sorted}] (기대: Y, Z, X — 빠를수록 상위)`);
}

/* ── 케이스 3: 점수·시간 모두 동점, 날짜가 다른 경우 ── */
console.log('[Case 3] 점수·시간 동점일 때 — playedAt 오름차순');
{
  const recs = [
    makeRec('Late',   80, 120, '2026-01-03T10:00:00Z'),
    makeRec('Early',  80, 120, '2026-01-01T10:00:00Z'),
    makeRec('Middle', 80, 120, '2026-01-02T10:00:00Z'),
  ];
  const sorted = sortRecords(recs).map(r => r.id);
  assert(JSON.stringify(sorted) === JSON.stringify(['Early', 'Middle', 'Late']),
    `결과: [${sorted}] (기대: Early, Middle, Late — 먼저 달성할수록 상위)`);
}

/* ── 케이스 4: 복합 동점 케이스 ── */
console.log('[Case 4] 복합 케이스 — 점수·시간·날짜 혼합');
{
  const recs = [
    makeRec('A', 80, 120, '2026-01-01T10:00:00Z'), // 80점, 120s, 1월1일
    makeRec('B', 80, 100, '2026-01-01T10:00:00Z'), // 80점, 100s (빠름) → 1위
    makeRec('C', 90, 200, '2026-01-01T10:00:00Z'), // 90점 → 최상위
    makeRec('D', 80, 120, '2025-12-31T10:00:00Z'), // 80점, 120s, 더 이른 날짜 → A보다 앞
    makeRec('E', 70,  50, '2026-01-01T10:00:00Z'), // 70점 → 최하위
  ];
  // 기대 순서: C(90), B(80 100s), D(80 120s 12/31), A(80 120s 1/1), E(70)
  const sorted = sortRecords(recs).map(r => r.id);
  assert(sorted[0] === 'C', `1위: ${sorted[0]} (기대: C — 90점)`);
  assert(sorted[1] === 'B', `2위: ${sorted[1]} (기대: B — 80점 100초)`);
  assert(sorted[2] === 'D', `3위: ${sorted[2]} (기대: D — 80점 120초 12/31)`);
  assert(sorted[3] === 'A', `4위: ${sorted[3]} (기대: A — 80점 120초 1/1)`);
  assert(sorted[4] === 'E', `5위: ${sorted[4]} (기대: E — 70점)`);
}

/* ── 케이스 5: 전체 완벽 점수 동점 ── */
console.log('[Case 5] 모두 만점일 때 — durationSec 으로만 구분');
{
  const recs = [
    makeRec('Slow',   100, 999, '2026-01-01T10:00:00Z'),
    makeRec('Fast',   100, 100, '2026-01-01T11:00:00Z'), // 늦게 했지만 빠름 → 앞
    makeRec('Medium', 100, 500, '2026-01-01T09:00:00Z'), // 먼저 했지만 느림
  ];
  const sorted = sortRecords(recs).map(r => r.id);
  assert(sorted[0] === 'Fast',   `1위: ${sorted[0]} (기대: Fast)`);
  assert(sorted[1] === 'Medium', `2위: ${sorted[1]} (기대: Medium)`);
  assert(sorted[2] === 'Slow',   `3위: ${sorted[2]} (기대: Slow)`);
}

/* ── 케이스 6: top 10 슬라이싱 ── */
console.log('[Case 6] 10개 초과 기록에서 상위 10명만 반환');
{
  const recs = Array.from({ length: 15 }, (_, i) =>
    makeRec(`P${15 - i}`, (15 - i) * 10, 100, '2026-01-01T10:00:00Z')
  );
  const top10 = sortRecords(recs).slice(0, 10);
  assert(top10.length === 10, `반환 수: ${top10.length} (기대: 10)`);
  assert(top10[0].score === 150, `1위 점수: ${top10[0].score} (기대: 150)`);
  assert(top10[9].score === 60,  `10위 점수: ${top10[9].score} (기대: 60)`);
}

/* ── 결과 요약 ── */
console.log(`\n=== 결과 요약 ===`);
console.log(`  총 테스트: ${passed + failed}`);
console.log(`  PASS: ${passed}`);
console.log(`  FAIL: ${failed}`);
if (failed === 0) {
  console.log('\n모든 테스트 통과 — 동점 케이스 포함 정렬 로직이 올바릅니다.');
  process.exit(0);
} else {
  console.error('\n실패 항목이 있습니다.');
  process.exit(1);
}
