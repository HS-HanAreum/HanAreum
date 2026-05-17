# HanAreum 기술 스택

이 문서는 HanAreum 프로젝트에서 사용하는 기술과 사용하지 않는 기술을 정리한다.

## 1. 사용

- Next.js
- TypeScript
- Supabase
- Supabase Auth
- Kakao Maps JavaScript API
- Kakao Local REST API
- Tailwind CSS
- npm

## 2. 사용하지 않음

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

## 3. 패키지 추가 규칙

패키지가 필요하면 바로 설치하지 않고 먼저 제안한다.

```txt
패키지 추가 제안:
- 패키지명:
- 필요한 이유:
- 대안:
- 영향받는 기능:
```

## 4. 코드 규칙

- TypeScript를 사용한다.
- `any`로 타입 오류를 덮지 않는다.
- 컴포넌트 이름은 PascalCase를 사용한다.
- 함수와 변수 이름은 camelCase를 사용한다.
- 상수 이름은 UPPER_SNAKE_CASE를 사용한다.
- UI 문구는 한국어로 작성한다.
- 기존 코드 스타일을 우선 따른다.
