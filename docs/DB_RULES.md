# HanAreum DB 규칙

이 문서는 HanAreum 프로젝트에서 Supabase DB를 사용할 때 지켜야 할 규칙을 정리합니다.

---

## 1. 기본 원칙

- Supabase를 DB로 사용합니다.
- DB 구조는 `supabase/schema.sql`을 기준으로 합니다.
- DB 컬럼을 임의로 추가, 삭제, 변경하지 않습니다.
- DB 변경이 필요하면 먼저 제안합니다.
- service role key는 사용하지 않습니다.
- 브라우저 코드에 비밀 키를 넣지 않습니다.

---

## 2. 장소 데이터 저장 전략

Kakao Local API에서 받은 장소 데이터를 전부 DB에 저장하지 않습니다.

장소는 아래 행동이 발생했을 때만 저장합니다.

```txt
리뷰 작성
북마크 추가
동선에 추가
```

이유:

```txt
외부 API 결과를 모두 저장하면 데이터가 불필요하게 많아짐
Kakao 장소 정보가 바뀌어도 우리 DB는 최신 상태가 아닐 수 있음
우리 서비스에 필요한 장소만 저장하는 것이 더 단순함
```

---

## 3. 핵심 테이블

### users

```sql
id uuid primary key
email text
nickname text
created_at timestamp
```

### places

```sql
id uuid primary key
provider text
provider_place_id text
name text
category text
address text
lat double precision
lng double precision
place_url text
created_at timestamp
```

### bookmark_folders

```sql
id uuid primary key
user_id uuid
name text
created_at timestamp
```

### bookmarks

```sql
id uuid primary key
user_id uuid
place_id uuid
folder_id uuid
created_at timestamp
```

### reviews

```sql
id uuid primary key
user_id uuid
place_id uuid
rating numeric
content text
visit_time_slot text
created_at timestamp
```

### routes

```sql
id uuid primary key
user_id uuid
title text
description text
is_public boolean
created_at timestamp
```

### route_places

```sql
id uuid primary key
route_id uuid
place_id uuid
order_index integer
```

---

## 4. provider 규칙

기본 provider는 `kakao`입니다.

```txt
provider = kakao
provider_place_id = Kakao Local API의 place id
```

---

## 5. 방문 시간대 값

리뷰의 `visit_time_slot` 값은 아래 중 하나만 사용합니다.

```txt
morning
lunch
afternoon
evening
night
```

화면 표시:

```txt
morning: 오전
lunch: 점심
afternoon: 오후
evening: 저녁
night: 밤
```

---

## 6. DB 변경 요청 형식

DB 변경이 필요하면 바로 SQL을 수정하지 말고 아래 형식으로 먼저 제안합니다.

```txt
DB 변경 제안:
- 변경 테이블:
- 변경 컬럼:
- 변경 이유:
- 영향받는 기능:
```

예시:

```txt
DB 변경 제안:
- 변경 테이블: reviews
- 변경 컬럼: like_count integer 추가
- 변경 이유: 리뷰 좋아요 수를 저장하기 위해 필요
- 영향받는 기능: 리뷰 목록, 리뷰 좋아요 버튼
```

---

## 7. Supabase 환경변수

사용 가능한 환경변수:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

주의:

```txt
service role key 사용 금지
.env 파일 직접 수정 금지
필요한 환경변수는 .env.example에만 제안
```

---

## 8. 금지사항

```txt
임의로 schema.sql 수정 금지
임의로 DB 컬럼명 변경 금지
임의로 테이블 삭제 금지
브라우저 코드에 비밀 키 작성 금지
Kakao API 결과 전체를 DB에 저장 금지
```

---

## 9. 한 줄 요약

```txt
DB는 필요한 사용자 데이터만 저장하고, 구조 변경은 반드시 먼저 제안한다.
```
