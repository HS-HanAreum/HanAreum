# HanAreum API / Auth / Route 규칙

이 문서는 Kakao API, Naver API, Supabase Auth, 라우트 구현 규칙을 정리한다.

## 1. Kakao Local REST API

Kakao Local REST API는 서버에서만 호출한다.

```txt
프론트엔드 -> /api/places/search -> Kakao Local REST API
```

프론트엔드에서 Kakao Local REST API를 직접 호출하지 않는다.

Kakao는 장소 검색, 좌표, 주소, 지도 표시의 기준 데이터로 사용한다.

## 2. Naver API

Naver API는 서버에서만 호출한다.

```txt
프론트엔드 -> /api/places/search -> 서버에서 Naver API 보강 조회
```

프론트엔드에서 Naver API를 직접 호출하지 않는다.

Naver는 장소 이미지 또는 보조 정보 확인 용도로만 사용한다. 장소 검색 기준 ID와 지도 표시 기준은 Kakao 데이터를 우선 사용한다.

## 3. Kakao Maps JavaScript API

- 지도 표시는 Kakao Maps JavaScript API를 사용한다.
- Google Maps는 사용하지 않는다.
- Naver를 Kakao 대체 지도 또는 검색 기준 데이터로 사용하지 않는다.

## 4. 장소 데이터 저장 규칙

장소 데이터는 외부 API 결과를 전부 저장하지 않는다.

Supabase에는 아래 행동이 발생했을 때만 필요한 장소 정보를 저장한다.

- 리뷰 작성
- 북마크 추가
- 동선 저장

Naver에서 확인한 이미지 URL이나 보조 정보는 검색 결과 표시 용도로 우선 사용하고, 저장이 필요하면 필요한 필드만 제한적으로 저장한다.

## 5. Supabase Auth

로그인과 회원가입은 Supabase Auth를 사용한다.

허용:

- 이메일 / 비밀번호 회원가입
- 이메일 / 비밀번호 로그인
- 로그아웃
- 현재 로그인한 사용자 정보 확인

구현하지 않음:

- 학교 메일 인증
- 이메일 OTP 인증
- 소셜 로그인

## 6. 사용자별 데이터

사용자별 데이터는 로그인한 사용자의 `user_id`를 기준으로 저장한다.

대상:

- 북마크
- 커스텀 폴더
- 리뷰
- 리뷰 좋아요
- 동선
- 동선 좋아요

## 7. 동선 Route 규칙

동선 MVP는 장소 좌표를 순서대로 연결하는 Polyline 방식으로 구현한다.

실제 길찾기 API 기반 도보 경로는 MVP 필수 기능이 아니다.
