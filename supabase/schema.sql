-- HanAreum DB 스키마
-- 기준 문서: docs/DB_RULES.md (테이블/컬럼), docs/API_AUTH_RULES.md (사용자별 데이터)
--
-- 실행 방법: Supabase 대시보드 -> SQL Editor 에 이 파일 전체를 붙여넣고 Run
-- 재실행 안전: 테이블은 "없을 때만 생성", 정책/트리거는 "있으면 지우고 다시 생성"
--   (단, 이미 만든 테이블의 컬럼은 이 스크립트로 바뀌지 않음 -> 컬럼 변경은 별도 제안)

-- =========================================================
-- 1. 테이블
-- =========================================================

-- 사용자 프로필 (Supabase Auth 의 auth.users 와 1:1 연결)
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  nickname   text,
  created_at timestamptz not null default now()
);

-- 장소 (외부 API 결과 전체가 아니라, 북마크/리뷰/동선에 쓰일 때만 저장)
create table if not exists public.places (
  id                uuid primary key default gen_random_uuid(),
  provider          text not null default 'kakao',
  provider_place_id text not null,
  name              text not null,
  category          text,
  address           text,
  lat               double precision,
  lng               double precision,
  place_url         text,
  created_at        timestamptz not null default now(),
  unique (provider, provider_place_id)
);

-- 북마크 폴더 (사용자별 커스텀 분류)
create table if not exists public.bookmark_folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- 북마크
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  place_id   uuid not null references public.places (id) on delete cascade,
  folder_id  uuid references public.bookmark_folders (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 리뷰 (별점 + 한 줄 평 + 방문 시간대)
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  place_id        uuid not null references public.places (id) on delete cascade,
  rating          numeric not null check (rating >= 0 and rating <= 5),
  content         text,
  visit_time_slot text check (visit_time_slot in ('morning', 'lunch', 'afternoon', 'evening', 'night')),
  created_at      timestamptz not null default now()
);

-- 동선
create table if not exists public.routes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  title       text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 동선에 포함된 장소 (order_index 순서대로 Polyline 연결)
create table if not exists public.route_places (
  id          uuid primary key default gen_random_uuid(),
  route_id    uuid not null references public.routes (id) on delete cascade,
  place_id    uuid not null references public.places (id) on delete cascade,
  order_index integer not null
);

-- =========================================================
-- 2. 회원가입 시 프로필 자동 생성
--    Auth(auth.users)에 가입이 생기면 public.users 행을 함께 만든다.
--    nickname 기본값은 이메일 앞부분(@ 앞)으로 둔다.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, nickname)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 3. 자주 조회하는 컬럼 인덱스
-- =========================================================

create index if not exists idx_bookmarks_user_id        on public.bookmarks (user_id);
create index if not exists idx_bookmark_folders_user_id on public.bookmark_folders (user_id);
create index if not exists idx_reviews_place_id         on public.reviews (place_id);
create index if not exists idx_routes_user_id           on public.routes (user_id);
create index if not exists idx_route_places_route_id    on public.route_places (route_id, order_index);

-- =========================================================
-- 4. RLS (Row Level Security)
--    RLS 를 켜기만 하고 정책이 없으면 아무도 접근하지 못한다.
--    그래서 테이블마다 ON + 정책을 함께 둔다.
--    auth.uid() = 현재 로그인한 사용자 id
-- =========================================================

-- users: 로그인 사용자는 닉네임 확인용으로 읽기 가능, 수정은 본인만
--        (insert 는 위 트리거가 담당하므로 클라이언트 insert 정책 없음)
alter table public.users enable row level security;

drop policy if exists users_select_authenticated on public.users;
create policy users_select_authenticated on public.users
  for select to authenticated
  using (true);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- places: 공용 장소 정보 -> 누구나 읽기, 저장은 로그인 사용자
alter table public.places enable row level security;

drop policy if exists places_select_all on public.places;
create policy places_select_all on public.places
  for select
  using (true);

drop policy if exists places_insert_authenticated on public.places;
create policy places_insert_authenticated on public.places
  for insert to authenticated
  with check (true);

-- bookmark_folders: 본인 것만 읽기/쓰기
alter table public.bookmark_folders enable row level security;

drop policy if exists folders_all_own on public.bookmark_folders;
create policy folders_all_own on public.bookmark_folders
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- bookmarks: 본인 것만 읽기/쓰기
alter table public.bookmarks enable row level security;

drop policy if exists bookmarks_all_own on public.bookmarks;
create policy bookmarks_all_own on public.bookmarks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- reviews: 장소 상세에 공개 표시 -> 누구나 읽기, 작성/수정/삭제는 본인만
alter table public.reviews enable row level security;

drop policy if exists reviews_select_all on public.reviews;
create policy reviews_select_all on public.reviews
  for select
  using (true);

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own on public.reviews
  for delete to authenticated
  using (user_id = auth.uid());

-- routes: 공개 동선이거나 본인 동선이면 읽기, 작성/수정/삭제는 본인만
alter table public.routes enable row level security;

drop policy if exists routes_select_public_or_own on public.routes;
create policy routes_select_public_or_own on public.routes
  for select
  using (is_public = true or user_id = auth.uid());

drop policy if exists routes_insert_own on public.routes;
create policy routes_insert_own on public.routes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists routes_update_own on public.routes;
create policy routes_update_own on public.routes
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists routes_delete_own on public.routes;
create policy routes_delete_own on public.routes
  for delete to authenticated
  using (user_id = auth.uid());

-- route_places: 부모 동선을 볼 수 있으면 읽기, 본인 동선에만 추가/수정/삭제
alter table public.route_places enable row level security;

drop policy if exists route_places_select on public.route_places;
create policy route_places_select on public.route_places
  for select
  using (
    exists (
      select 1 from public.routes r
      where r.id = route_places.route_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

drop policy if exists route_places_insert_own on public.route_places;
create policy route_places_insert_own on public.route_places
  for insert to authenticated
  with check (
    exists (
      select 1 from public.routes r
      where r.id = route_places.route_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists route_places_update_own on public.route_places;
create policy route_places_update_own on public.route_places
  for update to authenticated
  using (
    exists (
      select 1 from public.routes r
      where r.id = route_places.route_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.routes r
      where r.id = route_places.route_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists route_places_delete_own on public.route_places;
create policy route_places_delete_own on public.route_places
  for delete to authenticated
  using (
    exists (
      select 1 from public.routes r
      where r.id = route_places.route_id
        and r.user_id = auth.uid()
    )
  );

-- =========================================================
-- 5. 좋아요 (리뷰 / 동선)
--    리뷰·동선 좋아요는 사용자별 1회. unique 로 중복 방지.
-- =========================================================

-- 리뷰 좋아요
create table if not exists public.review_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  review_id  uuid not null references public.reviews (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, review_id)
);

-- 동선 좋아요
create table if not exists public.route_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  route_id   uuid not null references public.routes (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, route_id)
);

create index if not exists idx_review_likes_review_id on public.review_likes (review_id);
create index if not exists idx_route_likes_route_id   on public.route_likes (route_id);

-- review_likes: 리뷰는 공개 표시 -> 누구나 읽기, 추가/삭제는 본인만
alter table public.review_likes enable row level security;

drop policy if exists review_likes_select_all on public.review_likes;
create policy review_likes_select_all on public.review_likes
  for select
  using (true);

drop policy if exists review_likes_insert_own on public.review_likes;
create policy review_likes_insert_own on public.review_likes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists review_likes_delete_own on public.review_likes;
create policy review_likes_delete_own on public.review_likes
  for delete to authenticated
  using (user_id = auth.uid());

-- route_likes: 볼 수 있는 동선(공개 또는 본인)만 읽기, 추가/삭제는 본인만
alter table public.route_likes enable row level security;

drop policy if exists route_likes_select on public.route_likes;
create policy route_likes_select on public.route_likes
  for select
  using (
    exists (
      select 1 from public.routes r
      where r.id = route_likes.route_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

drop policy if exists route_likes_insert_own on public.route_likes;
create policy route_likes_insert_own on public.route_likes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists route_likes_delete_own on public.route_likes;
create policy route_likes_delete_own on public.route_likes
  for delete to authenticated
  using (user_id = auth.uid());
