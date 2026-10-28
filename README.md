# 상식 퀴즈 게임

HTML·CSS·JavaScript로 만든 정적 웹 상식 퀴즈 게임.

## 로컬 실행

`fetch()`를 사용하기 때문에 파일을 직접 열면 CORS 오류가 발생합니다. 간단한 로컬 서버를 띄워야 합니다.

### 방법 1 — npx serve (Node.js 필요)

```bash
npx serve .
```

브라우저에서 `http://localhost:3000` 접속.

### 방법 2 — Python 내장 서버

```bash
# Python 3
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

### 방법 3 — VS Code Live Server 확장

확장 마켓에서 **Live Server** 설치 후 `index.html`에서 우클릭 → "Open with Live Server".

## 문제 데이터 검증

```bash
node scripts/validate.js
```

## GitHub Pages 배포

`main` 브랜치의 루트를 배포 소스로 설정하면 `index.html`이 자동으로 서빙됩니다.

## 파일 구조

```
index.html          진입점
css/style.css       스타일
js/app.js           게임 로직
data/questions.json 문제 데이터 (40문제)
scripts/validate.js 데이터 유효성 검사
docs/PRD.md         기획 문서
```
