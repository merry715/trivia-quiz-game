# PRD: 상식 퀴즈 게임

## 개요
HTML·CSS·JavaScript만 사용하는 정적 단일 페이지 상식 퀴즈 게임. 빌드 도구·프레임워크·서버 없이 동작하며 GitHub Pages로 배포한다.

## 기술 조건
- 순수 HTML / CSS / JavaScript (ES6+)
- 외부 라이브러리 없음
- 정적 파일만으로 실행 가능해야 함

## 파일 구조
```
index.html
css/style.css
js/app.js
data/questions.json
docs/PRD.md
scripts/validate.js
README.md
```

## 문제 데이터 (`data/questions.json`)

### 카테고리 (4개 × 10문제 = 40문제)
| 카테고리 | ID 접두사 | 설명 |
|----------|-----------|------|
| history  | hist-     | 한국사·세계사 |
| science  | sci-      | 기초 과학 |
| geography | geo-     | 세계 지리 |
| general  | gen-      | 일반 상식 |

### 문제 필드
```json
{
  "id": "hist-01",
  "category": "history",
  "difficulty": "easy",
  "question": "...",
  "choices": ["A", "B", "C", "D"],
  "answerIndex": 0,
  "explanation": "한 줄 해설"
}
```

### 난이도 배분 (카테고리당)
- 쉬움(easy): 4문제
- 보통(medium): 4문제
- 어려움(hard): 2문제

### 출제 원칙
- 정답이 하나로 확정되는 사실만 출제
- 현직자·최신 통계처럼 변동 가능한 내용 제외
- 오답 보기는 정답과 같은 종류(예: 연도 → 연도, 인명 → 인명)
- "모두 정답"·"정답 없음" 보기 금지
- 문제: 40자 안팎 / 보기: 15자 이내

## 게임 흐름 (향후 구현)
1. 홈 화면 — 카테고리 선택
2. 퀴즈 화면 — 문제·보기 표시, 정답 선택
3. 결과 화면 — 점수 및 오답 해설

## 배포
GitHub Pages (정적 호스팅)
