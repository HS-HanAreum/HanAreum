# CLAUDE.md - HS-Road
## 1. Project Overview
HS-Road는 한성대학교 학생을 위한 장소 추천 및 동선 공유 웹 서비스입니다.  
전공자 1명과 비전공자 5명이 AI 코딩 도구를 활용해 함께 개발합니다.

## 2. Tech Stack
- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Supabase
- Map: Kakao Maps JavaScript API
- Place Search: Kakao Local REST API
- Package Manager: npm
새로운 프레임워크나 라이브러리는 임의로 추가하지 않습니다.  
패키지 추가가 필요하면 먼저 이유를 설명하고 제안합니다.

## 3. Core Features
### Smart POI System
- Kakao API 기반 장소 검색
- 장소 리스트 표시
- 지도 마커 표시
- 학교 / 한성대입구역 / 창신역 기준 3-Dot 거리 표시
- 거리순 / 별점순 / 영업 중 필터

### Bookmark & Personalization
- 장소 북마크
- 전역 카테고리
- 커스텀 폴더 저장

### Review & Crowd System
- 별점 기반 리뷰
- 한 줄 평
- 좋아요
- 방문 시간대 선택
- 시간대 기반 혼잡도 표시

### Route System (Low Priority)
- 여러 장소를 연결한 동선 생성
- Polyline 기반 지도 시각화
- 동선 공유 게시판
후순위 기능은 MVP가 완성되기 전까지 구현하지 않습니다.

## 4. Code Convention
- Airbnb JavaScript Style Guide를 따릅니다.
- TypeScript를 사용합니다.
- `any` 사용을 피합니다.
- 컴포넌트 이름은 PascalCase를 사용합니다.
- 함수와 변수 이름은 camelCase를 사용합니다.
- 상수 이름은 UPPER_SNAKE_CASE를 사용합니다.
- UI 문구는 한국어로 작성합니다.
- 복잡한 추상화보다 읽기 쉬운 코드를 우선합니다.
- 관련 없는 파일은 수정하지 않습니다.

## 5. Git Commit Convention
커밋 메시지는 한국어로 짧고 명확하게 작성합니다.
**커밋은 반드시 하나의 파일**을 단위로 합니다. 여러 파일을 작업했다면 여러 번 커밋해주세요.
형식: git commit -m "타입: 작업 내용"
타입 예시:
- feat: 기능 추가
- fix: 버그 수정
- style: UI / 스타일 수정
- refactor: 코드 구조 개선
- docs: 문서 수정
- chore: 설정 / 기타 작업

좋은 예시:
feat: 장소 카드 UI 추가
fix: 리뷰 폼 입력 오류 수정
style: 북마크 버튼 디자인 수정

나쁜 예시:
수정
완성
테스트