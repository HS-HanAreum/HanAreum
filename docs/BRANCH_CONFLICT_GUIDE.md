# HanAreum 브랜치 전략 & Conflict 대응 가이드

이 문서는 HanAreum 프로젝트의 브랜치 사용 방식과 Git 충돌(conflict)이 발생했을 때의 대응 방법을 정리한 문서입니다.

목표는 모든 문제를 기술 리드에게 넘기는 것이 아니라, **각 팀원이 자기 작업 상황을 1차로 정리하고 기술 리드가 최종 판단을 쉽게 하도록 만드는 것**입니다.

---

## 1. 기본 원칙

우리 팀은 `main`, `dev`, `feat/*` 브랜치를 사용합니다.

```txt
main
→ 최종 발표 / 제출용 안정 버전

dev
→ 개발 내용을 모으는 통합 브랜치

feat/이름이니셜
→ 각자 작업하는 개인 작업 브랜치
```

규칙:

```txt
1. main 브랜치에 직접 push 금지
2. dev 브랜치에 직접 push 금지
3. 각자 feat 브랜치에서만 작업
4. 작업이 끝나면 PR 생성
5. PR의 base는 항상 dev
6. merge는 전공자 / 기술 리드만 진행
```

---

## 2. 역할 분담 원칙

### 팀원이 직접 해야 하는 것

```txt
내 브랜치 관리
내가 수정한 파일 확인
git status 확인
commit / push
PR 작성
에러 메시지 복사
conflict 발생 시 1차 상황 정리
AI에게 원인 설명 요청
내 작업 의도 설명
```

### 기술 리드가 최종 담당하는 것

```txt
dev / main 브랜치 관리
최종 merge 승인
DB / API / 지도 핵심 구조 결정
큰 conflict 최종 해결
배포
```

---

## 3. 담당자별 브랜치

| 담당 영역 | 담당자 | 브랜치 |
|---|---|---|
| 스마트 POI / 지도 / API / DB / 통합 / 장소 리스트 / 필터 / 3-Dot UI | 강경민 | `feat/kkm` |
| 로그인 / 회원가입 / 로그아웃 | 박민재 | `feat/pmj` |
| 북마크 | 김연우 | `feat/kyw` |
| 커스텀 폴더 | 설지희 | `feat/sjh` |
| 리뷰 | 오유민 | `feat/oym` |
| 혼잡도 / 동선 | 최유미 | `feat/cym` |

---

## 4. 담당자별 작업 범위

### 강경민 - 스마트 POI / 지도 / API / DB / 통합 / 장소 리스트 / 필터 / 3-Dot UI

### 박민재 - 로그인 / 회원가입 / 로그아웃 (Supabase Auth 이메일 / 비밀번호)

### 김연우 - 북마크

### 설지희 - 커스텀 폴더

### 오유민 - 리뷰

### 최유미 - 혼잡도 / 동선

## 5. 작업 시작 명령어

### 강경민

```bash
git checkout dev
git pull origin dev
git checkout -b feat/kkm
```

### 박민재

```bash
git checkout dev
git pull origin dev
git checkout -b feat/pmj
```

### 김연우

```bash
git checkout dev
git pull origin dev
git checkout -b feat/kyw
```

### 설지희

```bash
git checkout dev
git pull origin dev
git checkout -b feat/sjh
```

### 오유민

```bash
git checkout dev
git pull origin dev
git checkout -b feat/oym
```

### 최유미

```bash
git checkout dev
git pull origin dev
git checkout -b feat/cym
```

---

## 6. 작업 후 push

```bash
git status
git add .
git commit -m "작업 내용"
git push origin feat/내브랜치
```

예시:

```bash
git status
git add .
git commit -m "리뷰 작성 폼 추가"
git push origin feat/oym
```

주의:

```txt
git add . 하기 전에 반드시 git status를 확인합니다.
수정하면 안 되는 파일이 보이면 commit하지 말고 먼저 확인합니다.
```

---

## 7. PR 만들기

```txt
base: dev
compare: feat/내브랜치
```

예시:

```txt
base: dev
compare: feat/oym
```

절대 아래처럼 만들지 않습니다.

```txt
base: main
compare: feat/oym
```

---

## 8. PR 작성 템플릿

```md
## 작업 내용

- 

## 내가 수정한 이유

- 

## 수정한 파일

- 

## 건드리면 안 됐는데 바뀐 파일이 있나요?

- [ ] 없음
- [ ] 있음:

## AI에게 시킨 내용

- 

## 직접 확인한 화면 / 동작

- 

## 테스트 방법

1. 
2. 
3. 

## 걱정되는 부분

- 
```

---

## 9. Conflict란?

conflict는 내가 수정한 코드와 dev의 최신 코드가 같은 파일의 같은 부분을 수정해서 Git이 자동으로 합치지 못한 상태입니다.

예시:

```txt
CONFLICT (content): Merge conflict in src/components/places/PlaceCard.tsx
Automatic merge failed; fix conflicts and then commit the result.
```

---

## 10. Conflict 발생 시 절대 하면 안 되는 것

```txt
아무 코드나 지우기
AI에게 "알아서 해결해줘"라고 하기
AI에게 바로 파일 수정시키기
git add . 실행하기
git commit 실행하기
git push 실행하기
파일 전체 삭제하기
<<<<<<<, =======, >>>>>>> 표시를 막 지우기
```

---

## 11. Conflict 발생 시 팀원이 해야 할 것

### 1단계: 상태 확인

```bash
git status
```

### 2단계: 충돌 파일 확인

에러 메시지나 `git status`에서 conflict가 난 파일 이름을 확인합니다.

### 3단계: AI에게 원인 설명만 요청

```txt
git pull origin dev를 했더니 conflict가 났어.
아래 에러와 git status 결과를 보고, 코드는 수정하지 말고 원인만 쉽게 설명해줘.

[에러 메시지]
여기에 에러 메시지 붙여넣기

[git status 결과]
여기에 git status 결과 붙여넣기
```

### 4단계: 내 작업 내용 정리

```txt
제가 작업한 부분:
- 장소 카드에 3-Dot 거리 표시 추가
- 거리순 필터 버튼 UI 추가
```

### 5단계: 기술 리드에게 공유

```txt
팀장님, feat/pmj에서 git pull origin dev 하다가 conflict가 났습니다.

충돌 파일:
src/components/places/PlaceCard.tsx

제가 작업한 부분:
- 장소 카드에 3-Dot 거리 표시 추가
- 거리순 필터 버튼 UI 추가

AI에게 원인 설명만 받아본 결과:
- 제가 수정한 PlaceCard.tsx와 dev의 최신 PlaceCard.tsx가 같은 부분을 수정해서 충돌이 난 것 같습니다.
- dev 쪽에서 props 구조가 바뀐 것으로 보입니다.

제가 보기에는:
- 3-Dot UI는 살리고
- props 구조는 dev 기준으로 맞추면 될 것 같습니다.

에러 메시지:
...

git status 결과:
...
```

---

## 12. 기술 리드가 Conflict를 해결하는 방법

conflict 파일에는 보통 아래 표시가 생깁니다.

```tsx
<<<<<<< HEAD
현재 작업 브랜치의 코드
=======
dev에서 가져온 코드
>>>>>>> origin/dev
```

정리 후:

```bash
git add 충돌난파일
git commit -m "dev 병합 충돌 해결"
git push origin feat/작업브랜치
```

예시:

```bash
git add src/components/places/PlaceCard.tsx
git commit -m "장소 카드 병합 충돌 해결"
git push origin feat/pmj
```

---

## 13. Conflict를 줄이는 방법

```txt
1. 같은 파일을 두 명이 동시에 수정하지 않기
2. PR을 작게 만들기
3. 한 PR에 하나의 작업만 하기
4. git add 전에 git status 확인하기
5. 작업 중간에 git pull origin dev를 혼자 자주 하지 않기
```

---

## 14. 한 줄 요약

```txt
내 feat 브랜치에서 작업하고, push하고, PR을 만든다.
문제가 생기면 먼저 상황을 정리하고, merge와 최종 conflict 해결은 기술 리드가 한다.
```
