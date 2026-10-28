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
| 스피드 퀴즈 모드 | 문제당 제한 시간(10초) 내에 답변. 시간 초과 시 오답 처리 |
| 힌트 | 문제당 1회 사용 가능. 오답 보기 하나를 제거해 3지선다로 변환 |
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

## Claude Code 활용

### 7장 — 교차 검증 가이드라인 · /memory · /clear

#### 교차 검증 가이드라인

`CLAUDE.md`에 문제 품질 기준을 명시해 두면 Claude가 문제를 생성·수정할 때 자동으로 4가지 항목을 체크합니다.

| 항목 | 내용 |
|------|------|
| 정답이 하나뿐인가? | 복수 해석 가능 시 조건을 question에 명시 |
| 최상급 표현 기준 | "가장 큰", "최초" 등에 측정 기준 명시 |
| 시간·범위 명확성 | 변할 수 있는 정보는 시점·범위 한정 |
| 교차 검증 | 의심스러운 정보는 2개 이상 출처 확인, 주류 학설 기준 |

#### /memory

대화 컨텍스트를 파일로 저장해 다음 세션에서도 이어받을 수 있습니다. 사용자 성향, 프로젝트 맥락, 피드백 등을 기억합니다.

```
/memory          # 현재 기억 목록 확인
```

#### /clear

누적된 대화 내용을 초기화해 컨텍스트 창을 비웁니다. 응답이 느려지거나 이전 맥락의 영향을 끊고 싶을 때 사용합니다.

```
/clear           # 대화 컨텍스트 초기화
```

---

### 8장 — 스피드 퀴즈·힌트 · 커스텀 명령어

#### 스피드 퀴즈 모드 · 힌트

| 기능 | 설명 |
|------|------|
| 스피드 퀴즈 모드 | 게임 시작 전 토글로 활성화. 문제당 10초 제한, 타이머 소진 시 오답 처리 |
| 힌트 | 문제당 1회 사용 가능. 오답 보기 하나를 제거해 3지선다로 변환 |

#### 커스텀 명령어

`.claude/commands/` 디렉터리에 Markdown 파일로 저장된 프로젝트 전용 슬래시 명령어입니다. Claude Code가 실행 시 자동으로 인식합니다.

##### `/quiz-validate [카테고리]`

`data/questions.json`의 최상급 표현이 기준을 명시했는지 검증합니다.

```
/quiz-validate              # 전체 문제 검증
/quiz-validate 한국사        # history 카테고리만 검증
/quiz-validate science      # science 카테고리만 검증
```

카테고리 생략 시 전체 검증. 입력값: `history` · `역사` · `한국사` / `science` · `과학` / `geography` · `지리` / `general` · `일반상식`

##### `/quiz-range <시작번호> <끝번호>`

지정 범위 문제의 난이도 분포와 정답 분포를 분석합니다. 특정 보기 편중 여부를 진단해 줍니다.

```
/quiz-range 1 10            # 1~10번 문제 검토
/quiz-range 21 30           # 21~30번 문제 검토
/quiz-range 15              # 15번 문제 1개만 검토
```

##### `/quiz-add <카테고리> <난이도>`

교차 검증 가이드라인을 준수한 퀴즈 문제 1개를 생성해 `data/questions.json` 끝에 추가합니다. 추가 후 자동으로 `validate.js`를 실행해 검증 결과를 출력합니다.

```
/quiz-add history easy      # 역사 쉬운 문제 추가
/quiz-add 한국사 medium      # 역사 보통 문제 추가
/quiz-add science hard      # 과학 어려운 문제 추가
```

카테고리 입력값: `history` · `역사` · `한국사` / `science` · `과학` / `geography` · `지리` / `general` · `일반상식`  
난이도 입력값: `easy` · `쉬움` / `medium` · `보통` / `hard` · `어려움`

## 파일 구조

```
index.html              진입점 (6개 화면 포함)
css/style.css           스타일 (360px ~ 데스크톱 반응형)
js/app.js               게임 전체 로직
data/questions.json     문제 데이터 40문제+
scripts/
  validate.js           JSON 유효성 검사
  test-shuffle.js       셔플 로직 테스트
  test-ranking.js       순위 정렬 로직 테스트
.claude/commands/
  quiz-validate.md      최상급 표현 검증 명령어
  quiz-range.md         범위별 문제 분석 명령어
  quiz-add.md           문제 추가 명령어
docs/PRD.md             기획 문서
```
