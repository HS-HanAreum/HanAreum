# HS-Road 프로젝트 스펙

## 1. 프로젝트 개요

**프로젝트명**: HS-Road  
**목표**: 한성대학교 학생을 위한 장소 탐색, 리뷰, 북마크 기반 개인화 추천 서비스  
**형태**: Web Application, Desktop 중심  
**개발 기간**: 2026.05.01 ~ 2026.05.30  
**핵심 가치**:

- 학교 주변 장소를 빠르게 탐색
- 거리 기반 직관적 비교
- 리뷰 기반 시간대 혼잡도 확인
- 개인 북마크와 폴더 관리

---

## 2. 핵심 MVP

### 2.1 장소 검색

- Kakao Local API 기반 장소 검색
- 키워드 기반 검색
- 카테고리 기반 검색
- 한성대 주변 반경 검색

### 2.2 지도 표시

- Kakao Maps JavaScript API 사용
- 검색 결과 마커 표시
- 선택한 장소 강조
- 장소 리스트와 지도 연동

### 2.3 장소 리스트

장소 카드에 표시할 정보:

- 장소명
- 카테고리
- 주소
- 3-Dot 거리 표시
- 북마크 버튼
- 리뷰 요약

### 2.4 3-Dot 거리 시스템

기준 지점:

1. 한성대학교
2. 한성대입구역
3. 창신역

표현 예시:

```txt
한성대 ●●●
한성대입구역 ●●○
창신역 ●○○
```

정확한 도보 시간이 아니라 직선거리 기준으로 계산해도 됩니다.

### 2.5 북마크

- 장소 북마크 저장
- 사용자별 북마크 목록
- 커스텀 폴더 분류

### 2.6 리뷰

- 별점
- 한 줄 평
- 방문 시간대
- 좋아요

### 2.7 시간대 기반 혼잡도

리뷰 작성 시 방문 시간대를 필수로 선택합니다.

시간대:

```txt
morning
lunch
afternoon
evening
night
```

화면 표시:

```txt
오전
점심
오후
저녁
밤
```

예시 문구:

```txt
이 장소는 점심 시간대에 방문 리뷰가 많아요.
```

---

## 3. 후순위 기능

아래 기능은 MVP 이후 구현합니다.

- 동선 Polyline
- 동선 추천 게시판
- 커뮤니티 게시판
- 학교 메일 인증
- 친구 기능
- 시간표 공유
- 댓글 / 대댓글
- 실시간 영업 중 필터

---

## 4. 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Kakao Maps JavaScript API
- Kakao Local REST API

---

## 5. 시스템 구조

```txt
사용자
↓
Next.js 화면
↓
Next.js API Route
↓
Kakao Local API / Supabase
↓
Next.js 화면에 결과 표시
```

---

## 6. 추천 폴더 구조

```txt
src/app/
  page.tsx
  places/
  bookmarks/
  api/
    places/
      search/
        route.ts

src/components/
  map/
  places/
  reviews/
  bookmarks/
  common/

src/lib/
  kakao.ts
  supabase.ts
  distance.ts
  constants.ts

src/types/
  place.ts
  review.ts
  bookmark.ts

supabase/
  schema.sql

docs/
  GITHUB_GUIDE.md
  BRANCH_CONFLICT_GUIDE.md
  PROJECT_SPEC.md
  DB_RULES.md
  PROMPT_GUIDE.md
```

---

## 7. 담당자별 기능

| 담당 영역 | 담당자 | 주요 내용 |
|---|---|---|
| 스마트 POI / 지도 / API / 통합 | 강경민 | Kakao API, 지도, DB, 통합 |
| 스마트 POI / 장소 리스트 / 필터 UI | 박민재 | 장소 카드, 리스트, 필터, 3-Dot UI |
| 북마크 | 김연우 | 북마크 버튼, 저장 목록 |
| 커스텀 폴더 | 설지희 | 폴더 생성, 폴더 선택 UI |
| 리뷰 | 오유민 | 리뷰 작성 폼, 별점, 리뷰 목록 |
| 혼잡도 | 최유미 | 방문 시간대 선택, 혼잡도 표시 |

---

## 8. 개발 범위 제한

이번 MVP에서는 아래를 구현하지 않아도 됩니다.

```txt
실시간 혼잡도
실제 도보 길찾기
복잡한 추천 알고리즘
완전한 인증 시스템
커뮤니티 전체 기능
시간표 공유
친구 기능
```

---

## 9. 발표용 핵심 포인트

- 한성대 주변에 특화된 로컬 서비스
- 3-Dot 거리 시스템으로 직관적인 거리 비교
- 방문 시간대 리뷰를 활용한 혼잡도 정보
- AI 도구를 활용한 비전공자 협업 개발

---

## 10. 한 줄 정의

```txt
한성대 주변에서 어디 갈지 빠르게 결정할 수 있게 도와주는 서비스
```
