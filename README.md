# Target 영어 단어 학습 사이트

2026년도 2학년 1학기 2차 Target 정기 범위 PDF에서 추출한 1-400번 Word / Meaning 데이터 기반 정적 학습 사이트입니다.

## 폴더 구조

```text
target-vocabulary/
├── index.html
├── test.html
├── vocabulary.html
├── wrong.html
├── favorites.html
├── css/
│   └── style.css
├── data/
│   └── words.js
└── js/
    ├── favorites.js
    ├── home.js
    ├── storage.js
    ├── test.js
    ├── ui.js
    ├── vocabulary.js
    └── wrong.js
```

## 기능

- 시험보기: 영어 → 뜻, 뜻 → 영어, 객관식, 서술형, 섞어서 출제
- 단어장보기: 전체 단어 검색, 범위 필터, 뜻 가리기
- 오답보기: 시험에서 틀린 단어 자동 저장, 오답만 재시험
- 즐겨찾기: 중요한 단어 저장, 즐겨찾기만 재시험
- 저장 방식: 서버 없이 `localStorage` 사용
- 디자인: Flutter `targetapp`의 홈 2x2 버튼, 초록 Material 테마, 카드형 단어 목록 흐름 반영

## 새 PDF로 업데이트하는 방법

`data/words.js`의 `WORDS` 배열만 같은 형태로 교체하면 됩니다.

```js
export const WORDS = [
  {
    id: 1,
    no: 2241,
    word: "worthless",
    meaning: "價値[가치] 없는"
  }
];
```

`id`는 사이트 안에서 1번부터 이어지는 순서, `no`는 PDF에 적힌 Target 번호입니다.

## GitHub Pages 배포

1. 이 폴더의 파일을 GitHub 저장소에 올립니다.
2. 저장소 Settings → Pages로 이동합니다.
3. Deploy from a branch를 선택하고 `main` 브랜치의 루트 또는 이 폴더 위치를 지정합니다.
4. 배포된 주소에서 `index.html`이 첫 화면으로 열립니다.

로컬에서 확인할 때는 이 폴더를 간단한 정적 서버로 열면 됩니다.

```bash
python3 -m http.server 8765 --directory target-vocabulary
```

그다음 `http://127.0.0.1:8765/index.html`을 열면 됩니다.
