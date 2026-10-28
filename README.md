# 상식 퀴즈 게임

HTML·CSS·JavaScript로 만든 정적 웹 상식 퀴즈 게임.  
빌드 도구·프레임워크·서버 없이 동작하며 GitHub Pages로 배포 가능합니다.

## 기능 목록

| 기능 | 설명 |
|------|------|
| 닉네임 입력 | 2~10자, 공백만 입력 시 시작 불가 |
| 모드 선택 | 역사·과학·지리·일반 상식(10문제) 또는 전체 도전(40문제) |
| 문제 셔플 | 매 게임 문제 순서와 보기 순서를 무작위로 섞음. 섞인 뒤에도 정답 위치 정확히 추적 |
| 진행 표시 | 현재 번호 / 전체, 카테고리 뱃지, 실시간 점수, 진행 바 |
| 즉시 정답 확인 | 보기 클릭 후 ⭕/❌ 아이콘·색상·텍스트로 정오 표시, 해설 제공 |
| 점수 | 정답 1개당 10점, 감점 없음 |
| 결과 화면 | 최종 점수·정답 수·소요 시간. 전체 도전 시 카테고리별 정답률 바 차트 포함 |
| 기록 저장 | `localStorage` 에 자동 저장 (저장 불가 환경에서도 게임 진행 가능) |
| 순위표 | 모드별 상위 10명. 점수↓ → 시간↑ → 날짜↑ 정렬. 방금 저장한 기록 강조 |
| 오답 노트 | 틀린 문제·내 답·정답·해설 목록 |
| 다시 하기 | 같은 모드로 문제·보기 새로 섞어 재시작 |
| 키보드 | 1~4: 보기 선택 / Enter 또는 Space: 다음 문제 |

## 로컬 실행

`fetch()`를 사용하므로 파일을 직접 열면 CORS 오류가 발생합니다. 간단한 로컬 서버가 필요합니다.

### 방법 1 — npx serve (Node.js 필요, 추천)

```bash
npx serve .
```

브라우저에서 `http://localhost:3000` 접속.

### 방법 2 — Python 내장 서버

```bash
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

### 방법 3 — VS Code Live Server

확장 마켓에서 **Live Server** 설치 후 `index.html` 우클릭 → "Open with Live Server".

## 데이터 검증

```bash
node scripts/validate.js      # questions.json 유효성 검사
node scripts/test-shuffle.js  # 보기 셔플 후 정답 추적 테스트 (1280회)
node scripts/test-ranking.js  # 순위 정렬 동점 케이스 테스트 (14회)
```

## GitHub Pages 배포

1. GitHub 저장소 Settings → Pages → Source: **Deploy from a branch**
2. Branch: `main` / Folder: `/ (root)` 선택 후 Save
3. 잠시 후 `https://<username>.github.io/<repo-name>/` 에서 접속 가능

> `index.html` 이 루트에 있으므로 별도 빌드 없이 바로 배포됩니다.

## 파일 구조

```
index.html              진입점 (6개 화면 포함)
css/style.css           스타일 (360px ~ 데스크톱 반응형)
js/app.js               게임 전체 로직
data/questions.json     문제 데이터 40문제
scripts/
  validate.js           JSON 유효성 검사
  test-shuffle.js       셔플 로직 테스트
  test-ranking.js       순위 정렬 로직 테스트
docs/PRD.md             기획 문서
```
