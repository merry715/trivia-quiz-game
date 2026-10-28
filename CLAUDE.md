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
