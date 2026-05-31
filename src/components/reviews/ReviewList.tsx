'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HeartIcon, StarIcon } from '@/components/icons';
import ReviewForm from './ReviewForm';
import type { Place } from '@/types/place';
import {
  REVIEW_CONGESTION_LEVELS,
  REVIEW_DAYS,
  REVIEW_RATINGS,
  REVIEW_TIME_SLOTS,
  type Review,
  type ReviewCongestion,
  type ReviewDay,
  type ReviewFormInput,
  type ReviewTimeSlot,
} from '@/types/review';

interface ReviewListProps {
  place: Place; // 어떤 장소의 리뷰인지 (place_id 보장/조회에 사용)
}

// 혼잡도 태그 색상 (여유=초록, 보통=노랑, 혼잡=빨강). 글자는 가독성 위해 짙은 회색.
const CONGESTION_TAG_CLASS: Record<ReviewCongestion, string> = {
  여유: 'bg-[#86EFAC] text-slate-800',
  보통: 'bg-[#FDE68A] text-slate-800',
  혼잡: 'bg-[#FCA5A5] text-slate-800',
};

// created_at(ISO 문자열)을 "HH:MM" 형태로 만든다.
function formatTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// DB 에서 읽은 문자열이 허용된 라벨일 때만 그대로 쓰고, 아니면 null 로 둔다(태그 숨김).
function asMember<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

// --- Supabase 데이터 접근 (브라우저 anon 클라이언트, 접근 제어는 RLS 가 담당) ---

// reviews 조회 결과 행 타입 (users 는 to-one, review_likes 는 to-many)
interface DbReviewRow {
  id: string;
  rating: number;
  content: string | null;
  visit_day: string | null;
  visit_time_slot: string | null;
  congestion: string | null;
  created_at: string;
  user_id: string;
  users: { nickname: string | null } | null;
  review_likes: { user_id: string }[];
}

// 장소의 place_id(uuid)를 조회한다. 아직 저장된 적 없으면 null (= 리뷰도 없음).
// 단순 조회만 한다(저장 X). 장소 저장은 리뷰 작성 시에만 한다.
async function findPlaceId(place: Place): Promise<string | null> {
  const { data } = await supabase
    .from('places')
    .select('id')
    .eq('provider', place.provider)
    .eq('provider_place_id', place.providerPlaceId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

// 장소를 places 에 보장(없으면 저장)하고 place_id 를 돌려준다. (동선 저장과 같은 방식)
async function ensurePlaceId(place: Place): Promise<string> {
  const { error: upsertError } = await supabase.from('places').upsert(
    {
      provider: place.provider,
      provider_place_id: place.providerPlaceId,
      name: place.name,
      category: place.category,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      place_url: place.placeUrl,
    },
    { onConflict: 'provider,provider_place_id', ignoreDuplicates: true },
  );
  if (upsertError) throw upsertError;

  const id = await findPlaceId(place);
  if (!id) throw new Error('장소 조회 실패');
  return id;
}

// 장소의 리뷰를 최신순으로 불러온다. 좋아요 수/내가 눌렀는지도 함께 계산한다.
async function loadReviews(placeId: string, currentUserId: string | null): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, rating, content, visit_day, visit_time_slot, congestion, created_at, user_id, users ( nickname ), review_likes ( user_id )',
    )
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });
  if (error || !data) throw error ?? new Error('리뷰 조회 실패');

  const rows = data as unknown as DbReviewRow[];
  return rows.map((row) => ({
    id: row.id,
    author: row.users?.nickname ?? '사용자',
    rating: Number(row.rating),
    day: asMember(row.visit_day, REVIEW_DAYS),
    timeSlot: asMember(row.visit_time_slot, REVIEW_TIME_SLOTS),
    congestion: asMember(row.congestion, REVIEW_CONGESTION_LEVELS),
    content: row.content ?? '',
    time: formatTime(row.created_at),
    likeCount: row.review_likes.length,
    liked: currentUserId ? row.review_likes.some((like) => like.user_id === currentUserId) : false,
  }));
}

// 선택 가능한 알약 버튼 (필터 사이드바)
function FilterPill({
  label,
  selected,
  onClick,
  children,
}: {
  label?: string;
  selected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        selected
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-gray-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
      }`}
    >
      {children}
      {label}
    </button>
  );
}

// Set 토글 도우미 (선택되어 있으면 빼고, 없으면 넣는다)
function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export default function ReviewList({ place }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);

  // 필터 상태 (여러 개 동시 선택 가능)
  const [dayFilter, setDayFilter] = useState<Set<ReviewDay>>(new Set());
  const [timeFilter, setTimeFilter] = useState<Set<ReviewTimeSlot>>(new Set());
  const [congestionFilter, setCongestionFilter] = useState<Set<ReviewCongestion>>(new Set());
  const [ratingFilter, setRatingFilter] = useState<Set<number>>(new Set());

  // 마운트 시: 로그인 사용자(닉네임)와 이 장소의 리뷰를 불러온다.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      if (!active) return;
      setUserId(uid);

      try {
        const id = await findPlaceId(place);
        if (!active) return;
        setPlaceId(id);
        const list = id ? await loadReviews(id, uid) : [];
        if (!active) return;
        setReviews(list);
      } catch {
        if (active) setReviews([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // place 는 상세 페이지 진입 시 고정이라 최초 1회만 불러온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 작성 모달에서 등록하면 Supabase 에 저장하고 목록을 새로고침한다.
  async function handleSubmit(input: ReviewFormInput) {
    if (!userId) {
      alert('로그인 후 리뷰를 작성할 수 있습니다.');
      return;
    }
    try {
      const id = placeId ?? (await ensurePlaceId(place));
      if (!placeId) setPlaceId(id);

      const { error } = await supabase.from('reviews').insert({
        user_id: userId,
        place_id: id,
        rating: input.rating,
        content: input.content,
        visit_day: input.day,
        visit_time_slot: input.timeSlot,
        congestion: input.congestion,
      });
      if (error) throw error;

      setReviews(await loadReviews(id, userId));
    } catch {
      alert('리뷰 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 좋아요 토글: 로그인 사용자만. 화면을 먼저 바꾸고(낙관적) DB 에 반영, 실패하면 새로고침으로 되돌린다.
  async function handleToggleLike(id: string) {
    if (!userId) {
      alert('로그인 후 좋아요를 누를 수 있습니다.');
      return;
    }
    const target = reviews.find((review) => review.id === id);
    if (!target) return;
    const nextLiked = !target.liked;

    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              liked: nextLiked,
              likeCount: nextLiked ? review.likeCount + 1 : review.likeCount - 1,
            }
          : review,
      ),
    );

    try {
      if (nextLiked) {
        const { error } = await supabase
          .from('review_likes')
          .insert({ user_id: userId, review_id: id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_likes')
          .delete()
          .eq('user_id', userId)
          .eq('review_id', id);
        if (error) throw error;
      }
    } catch {
      if (placeId) setReviews(await loadReviews(placeId, userId));
    }
  }

  function resetFilters() {
    setDayFilter(new Set());
    setTimeFilter(new Set());
    setCongestionFilter(new Set());
    setRatingFilter(new Set());
  }

  // 선택된 필터를 모두 만족하는 리뷰만 보여준다 (빈 필터는 전체 통과, 값이 없는 리뷰는 해당 필터에서 제외).
  const visibleReviews = reviews.filter((review) => {
    if (dayFilter.size > 0 && (review.day === null || !dayFilter.has(review.day))) return false;
    if (timeFilter.size > 0 && (review.timeSlot === null || !timeFilter.has(review.timeSlot)))
      return false;
    if (
      congestionFilter.size > 0 &&
      (review.congestion === null || !congestionFilter.has(review.congestion))
    )
      return false;
    if (ratingFilter.size > 0 && !ratingFilter.has(Math.floor(review.rating))) return false;
    return true;
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      {/* 섹션 제목 + 리뷰 작성 버튼 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          리뷰 <span className="text-slate-400">{reviews.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
        >
          리뷰 작성
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        {/* 좌: 필터 사이드바 */}
        <aside className="rounded-xl border border-gray-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">필터</h3>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">요일</p>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_DAYS.map((value) => (
                  <FilterPill
                    key={value}
                    label={value}
                    selected={dayFilter.has(value)}
                    onClick={() => setDayFilter((prev) => toggleInSet(prev, value))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">시간대</p>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_TIME_SLOTS.map((value) => (
                  <FilterPill
                    key={value}
                    label={value}
                    selected={timeFilter.has(value)}
                    onClick={() => setTimeFilter((prev) => toggleInSet(prev, value))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">혼잡도</p>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_CONGESTION_LEVELS.map((value) => (
                  <FilterPill
                    key={value}
                    label={value}
                    selected={congestionFilter.has(value)}
                    onClick={() => setCongestionFilter((prev) => toggleInSet(prev, value))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">별점</p>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_RATINGS.map((value) => (
                  <FilterPill
                    key={value}
                    label={String(value)}
                    selected={ratingFilter.has(value)}
                    onClick={() => setRatingFilter((prev) => toggleInSet(prev, value))}
                  >
                    <StarIcon
                      className="h-3.5 w-3.5 text-amber-400"
                      filled={ratingFilter.has(value)}
                    />
                  </FilterPill>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              필터 초기화
            </button>
          </div>
        </aside>

        {/* 우: 리뷰 목록 */}
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-400">리뷰를 불러오는 중...</p>
            </div>
          ) : visibleReviews.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-400">
                {reviews.length === 0 ? '아직 리뷰가 없어요. 첫 리뷰를 남겨보세요.' : '조건에 맞는 리뷰가 없어요.'}
              </p>
            </div>
          ) : (
            visibleReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                {/* 상단: 아바타 + 닉네임 + 태그 + 별점 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {review.author.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{review.author}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {review.day && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            {review.day}
                          </span>
                        )}
                        {review.timeSlot && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            {review.timeSlot}
                          </span>
                        )}
                        {review.congestion && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONGESTION_TAG_CLASS[review.congestion]}`}
                          >
                            {review.congestion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-amber-400">
                    <StarIcon className="h-4 w-4" filled />
                    <span className="text-sm font-semibold text-slate-700">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* 중하단: 작성 시간 + 내용 */}
                <p className="mt-3 text-xs text-slate-400">{review.time}</p>
                <p className="mt-1 text-sm text-slate-700">{review.content}</p>

                {/* 좋아요 */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(review.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      review.liked
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    <HeartIcon className="h-4 w-4" filled={review.liked} />
                    {review.likeCount}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {isModalOpen && (
        <ReviewForm onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </section>
  );
}
