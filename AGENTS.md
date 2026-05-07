# AGENTS.md - HanAreum

HanAreum은 한성대학교 학생들의 공강 시간 및 방과 후 활동을 위한 장소 추천, 북마크, 리뷰, 시간대 기반 혼잡도 확인 웹 서비스다.

팀원 대부분은 비전공자이며, AI 코딩 도구를 사용해 협업한다.  
에이전트는 작게 수정하고, 요청받은 범위만 구현하고, 쉽게 설명해야 한다.

---

## 1. MVP 우선순위

1. Kakao 기반 장소 검색
2. Kakao 지도 표시
3. 장소 리스트 표시
4. 전역 카테고리 필터
   - 맛집
   - 술집
   - 카페
   - 서점
   - 스터디 장소
   - 가볼만한 곳
5. 학교 / 한성대입구역 / 창신역 기준 3-Dot 거리 표시
6. 거리순 / 별점순 필터
7. 장소 북마크
8. 커스텀 폴더 기반 장소 분류
9. 리뷰 작성
   - 별점
   - 한 줄 평
   - 좋아요
10. 방문 시간대 기반 혼잡도 표시
11. Supabase Auth 기반 기본 로그인 / 회원가입
    - 이메일 / 비밀번호 회원가입
    - 이메일 / 비밀번호 로그인
    - 로그아웃
    - 로그인한 사용자 기준 북마크 저장
    - 로그인한 사용자 기준 리뷰 작성

---

## 2. 후순위 기능

아래 기능은 MVP가 완성되기 전까지 구현하지 않는다.

- 영업 중 필터
- 동선 생성
- 지도 위 Polyline 시각화
- 동선 추천 게시판 공유
- 커뮤니티 게시판
- 친구 기능
- 시간표 공유
- 댓글 / 대댓글

---

## 3. 제외 기능

아래 기능은 구현하지 않는다.

- 학교 메일 인증
- 이메일 OTP 인증
- 소셜 로그인
- Google Maps
- Naver Maps

---

## 4. 기술 스택

사용:

- Next.js
- TypeScript
- Supabase
- Supabase Auth
- Kakao Maps JavaScript API
- Kakao Local REST API
- Tailwind CSS
- npm

사용하지 말 것:

- Google Maps API
- Naver Maps API
- Redux
- Zustand
- React Query
- Prisma
- Express
- NestJS
- MongoDB
- UI 컴포넌트 라이브러리

패키지 추가가 필요하면 설치하지 말고 먼저 제안한다.

---

## 5. Code Convention

기본 스타일은 Airbnb JavaScript Style Guide를 따른다.

추가 규칙:

- TypeScript를 사용한다.
- `any`로 타입 오류를 덮지 않는다.
- 컴포넌트 이름은 PascalCase를 사용한다.
- 함수와 변수 이름은 camelCase를 사용한다.
- 상수 이름은 UPPER_SNAKE_CASE를 사용한다.
- UI 문구는 한국어로 작성한다.
- 복잡한 추상화보다 읽기 쉬운 코드를 우선한다.
- 한 번만 쓰는 코드는 무리하게 공통화하지 않는다.
- 기존 코드 스타일이 있으면 기존 스타일을 우선 따른다.
- 관련 없는 파일은 수정하지 않는다.
- 관련 없는 코드 포맷팅을 하지 않는다.

---

## 6. Git Commit Convention

커밋 메시지는 한국어로 짧고 명확하게 작성한다.

형식:

```txt
타입: 작업 내용
```

타입:

- feat: 기능 추가
- fix: 버그 수정
- style: UI / 스타일 수정
- refactor: 코드 구조 개선
- docs: 문서 수정
- chore: 설정 / 기타 작업

좋은 예시:

```txt
feat: 장소 카드 UI 추가
feat: Supabase 로그인 기능 추가
fix: 리뷰 폼 입력 오류 수정
style: 북마크 버튼 디자인 수정
docs: GitHub 사용 가이드 추가
chore: 프로젝트 초기 설정 추가
```

나쁜 예시:

```txt
수정
완성
asdf
테스트
```

규칙:

- 한 커밋에는 하나의 작업만 담는다.
- 커밋 메시지는 작업 내용을 구체적으로 쓴다.
- 의미 없는 커밋 메시지를 사용하지 않는다.

---

## 7. 작업 전 규칙

수정 전에 먼저 정리한다.

1. 이해한 작업
2. 수정할 파일
3. 수정하지 않을 파일
4. 검증 방법

요구사항이 불명확하면 구현 전에 질문한다.

---

## 8. 절대 금지

아래 행동은 하지 않는다.

- 요청받지 않은 기능 추가
- 전체 구조 리팩토링
- 폴더 구조 변경
- 파일명 임의 변경
- 기존 함수명 임의 변경
- DB 컬럼 임의 변경
- 환경변수 이름 변경
- 패키지 임의 설치
- 인증 방식 임의 변경
- UI 라이브러리 교체
- `.env` 생성 / 수정
- API 키, 토큰, 비밀번호 하드코딩
- 관련 없는 파일 수정
- 관련 없는 코드 포맷팅
- `main` 또는 `dev` 직접 push
- PR 없이 merge
- 실패한 작업을 성공했다고 말하기

---

## 9. 파일 수정 원칙

작업 요청에 적힌 수정 가능 파일만 수정한다.

특히 아래 파일은 기술 리드 확인 없이 수정하지 않는다.

- `src/app/api/**`
- `src/lib/**`
- `supabase/schema.sql`
- `.env.example`
- `package.json`
- 배포 설정 파일

담당자별 상세 수정 범위는 `docs/BRANCH_CONFLICT_GUIDE.md`를 따른다.

---

## 10. API / DB 규칙

Kakao Local REST API는 서버에서만 호출한다.

올바른 흐름:

```txt
프론트엔드 → /api/places/search → Kakao Local REST API
```

잘못된 흐름:

```txt
프론트엔드 → Kakao Local REST API 직접 호출
```

장소 데이터는 외부 API 결과를 전부 저장하지 않는다.  
리뷰 작성, 북마크 추가 시에만 필요한 장소 정보를 Supabase에 저장한다.

동선 기능은 후순위이므로 MVP 단계에서 동선 저장 로직을 먼저 만들지 않는다.

DB 변경이 필요하면 먼저 제안한다.

```txt
DB 변경 제안:
- 변경 테이블:
- 변경 컬럼:
- 변경 이유:
- 영향받는 기능:
```

---

## 11. Auth 규칙

로그인과 회원가입은 Supabase Auth를 사용한다.

MVP에서 허용하는 인증 방식:

- 이메일 / 비밀번호 회원가입
- 이메일 / 비밀번호 로그인
- 로그아웃
- 현재 로그인한 사용자 정보 확인

MVP에서 구현하지 않는 인증 방식:

- 학교 메일 인증
- 이메일 OTP 인증
- 소셜 로그인
- 관리자 승인
- 친구 인증

사용자별 데이터는 로그인한 사용자의 `user_id`를 기준으로 저장한다.

대상:

- 북마크
- 커스텀 폴더
- 리뷰

인증 구조를 임의로 바꾸지 않는다.

---

## 12. Git / PR 규칙

브랜치:

```txt
main: 최종 발표용
dev: 개발 통합용
feat/이름이니셜: 개인 작업용
```

예시:

```txt
feat/kkm
feat/pmj
feat/kyw
feat/sjh
feat/oym
feat/cym
```

규칙:

- PR base는 항상 `dev`로 한다.
- merge는 기술 리드만 한다.
- conflict가 나면 바로 수정하지 말고 상황을 정리한다.
- conflict 대응은 `docs/BRANCH_CONFLICT_GUIDE.md`를 따른다.

---

## 13. 작업 후 보고

작업 후 반드시 정리한다.

1. 변경한 파일
2. 구현한 내용
3. 실행 명령어
4. 테스트 방법
5. 주의할 점
6. 테스트하지 못한 부분

가능하면 실행한다.

```bash
npm run dev
npm run lint
npm run build
```

테스트하지 못했다면 반드시 말한다.

---

## 14. 설명 방식

팀원 대부분이 비전공자다.

나쁜 설명:

```txt
비동기 fetch 핸들러에서 provider abstraction을 분리했습니다.
```

좋은 설명:

```txt
장소 검색 버튼을 누르면 우리 서버가 Kakao API에 대신 요청하고, 결과를 리스트로 보여주게 했습니다.
```

화면에서 무엇을 확인하면 되는지 함께 설명한다.

---

## 15. 참고 문서

- `docs/GITHUB_GUIDE.md`
- `docs/BRANCH_CONFLICT_GUIDE.md`
- `docs/PROJECT_SPEC.md`
- `docs/DB_RULES.md`
- `docs/PROMPT_GUIDE.md`