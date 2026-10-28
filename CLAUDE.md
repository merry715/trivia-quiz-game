# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

순수 HTML·CSS·JavaScript로 만드는 정적 상식 퀴즈 게임. 프레임워크·빌드 도구·서버 없음. GitHub Pages 배포 예정.

## 개발 환경

`fetch()`를 사용하므로 로컬 서버 필요:
```bash
npx serve .          # 가장 간단
python -m http.server 8080
```

## 문제 데이터 검증

```bash
node scripts/validate.js
```

카테고리 4개(`history` / `science` / `geography` / `general`) × 10문제 = 40문제.  
각 카테고리는 easy 4 / medium 4 / hard 2 구성.

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `index.html` | 진입점 |
| `css/style.css` | 스타일 |
| `js/app.js` | 게임 로직 |
| `data/questions.json` | 문제 데이터 (40문제) |
| `scripts/validate.js` | 데이터 유효성 검사 스크립트 |
| `docs/PRD.md` | 기획 문서 |

## questions.json 스키마

```jsonc
{
  "id": "hist-01",           // 카테고리 접두사 + 2자리 숫자
  "category": "history",     // history | science | geography | general
  "difficulty": "easy",      // easy | medium | hard
  "question": "...",         // 40자 안팎
  "choices": ["A","B","C","D"],  // 4개, 각 15자 이내
  "answerIndex": 0,          // 0~3
  "explanation": "..."       // 한 줄 해설
}
```

## 퀴즈 문제 교차 검증 가이드라인

모든 문제 작성 시 반드시 확인할 사항
1. 정답이 하나뿐인가?
   - 다른 해석이 가능하면 조건 명시 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가?
   - '가장 큰', '최초의' 등 표현에는 측정 기준 명시
3. 시간과 범위가 명확한가?
   - 변할 수 있는 정보는 시점 명시
   - 지리적, 분류적 범위 한정
4. 교차 검증했는가?
   - 의심스러운 정보는 2개 이상 출처 확인
   - 논란 있는 내용은 주류 학설 기준