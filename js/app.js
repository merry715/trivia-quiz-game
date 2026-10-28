// 진입점 — 다음 단계에서 게임 로직 구현 예정
(async function init() {
  const res = await fetch('./data/questions.json');
  const { questions } = await res.json();
  console.log(`문제 로드 완료: ${questions.length}개`);
})();
