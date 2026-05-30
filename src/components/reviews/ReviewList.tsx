'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HeartIcon, StarIcon } from '@/components/icons';
import ReviewForm from './ReviewForm';
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

// 처음 화면을 채우기 위한 예시 리뷰 (프론트 표시용 샘플)
const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'sample-1',
    author: '한성이',
    rating: 5,
    day: '수',
    timeSlot: '12-14시',
    congestion: '보통',
    content: '점심시간에 갔는데 자리도 적당히 있고 조용해서 공부하기 좋았어요.',
    time: '12:44',
    likeCount: 3,
    liked: false,
  },
  {
    id: 'sample-2',
    author: '상상부기',
    rating: 4,
    day: '금',
    timeSlot: '18-20시',
    congestion: '혼잡',
    content: '저녁엔 사람이 많아서 조금 시끄러웠지만 분위기는 좋았습니다.',
    time: '19:10',
    likeCount: 1,
    liked: false,
  },
];

// 혼잡도 태그 색상 (여유=초록, 보통=노랑, 혼잡=빨강). 글자는 가독성 위해 짙은 회색.
const CONGESTION_TAG_CLASS: Record<ReviewCongestion, string> = {
  여유: 'bg-[#86EFAC] text-slate-800',
  보통: 'bg-[#FDE68A] text-slate-800',
  혼잡: 'bg-[#FCA5A5] text-slate-800',
};

// 현재 시각을 "HH:MM" 형태로 만든다.
function formatNowTime(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// 필터 사이드바에서 쓰는 알약 버튼
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

export default function ReviewList() {
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState('사용자');

  // 필터 상태 (여러 개 동시 선택 가능)
  const [dayFilter, setDayFilter] = useState<Set<ReviewDay>>(new Set());
  const [timeFilter, setTimeFilter] = useState<Set<ReviewTimeSlot>>(new Set());
  const [congestionFilter, setCongestionFilter] = useState<Set<ReviewCongestion>>(new Set());
  const [ratingFilter, setRatingFilter] = useState<Set<number>>(new Set());

  // 로그인한 사용자의 닉네임을 가져온다 (AuthNav와 같은 방식).
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const user = data.user;
      if (!user) return;
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      const name = meta.username ?? (user.email ? user.email.split('@')[0] : '');
      if (name) setNickname(name);
    });
    return () => {
      active = false;
    };
  }, []);

  // 작성 모달에서 등록하면 목록 맨 앞에 추가한다.
  function handleSubmit(input: ReviewFormInput) {
    const newReview: Review = {
      id: crypto.randomUUID(),
      author: nickname,
      rating: input.rating,
      day: input.day ?? '월',
      timeSlot: input.timeSlot ?? '12-14시',
      congestion: input.congestion ?? '보통',
      content: input.content,
      time: formatNowTime(),
      likeCount: 0,
      liked: false,
    };
    setReviews((prev) => [newReview, ...prev]);
  }

  // 좋아요 토글 (프론트 상태로만 처리)
  function handleToggleLike(id: string) {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              liked: !review.liked,
              likeCount: review.liked ? review.likeCount - 1 : review.likeCount + 1,
            }
          : review,
      ),
    );
  }

  function resetFilters() {
    setDayFilter(new Set());
    setTimeFilter(new Set());
    setCongestionFilter(new Set());
    setRatingFilter(new Set());
  }

  // 선택된 필터를 모두 만족하는 리뷰만 보여준다 (빈 필터는 전체 통과).
  const visibleReviews = reviews.filter((review) => {
    if (dayFilter.size > 0 && !dayFilter.has(review.day)) return false;
    if (timeFilter.size > 0 && !timeFilter.has(review.timeSlot)) return false;
    if (congestionFilter.size > 0 && !congestionFilter.has(review.congestion)) return false;
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
          {visibleReviews.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-400">조건에 맞는 리뷰가 없어요.</p>
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
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {review.day}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {review.timeSlot}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONGESTION_TAG_CLASS[review.congestion]}`}
                        >
                          {review.congestion}
                        </span>
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
