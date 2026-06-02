'use client';

import { useState } from 'react';
import { StarIcon } from '@/components/icons';
import {
  REVIEW_CONGESTION_LEVELS,
  REVIEW_DAYS,
  REVIEW_TIME_SLOTS,
  type ReviewCongestion,
  type ReviewDay,
  type ReviewFormInput,
  type ReviewTimeSlot,
} from '@/types/review';

interface ReviewFormProps {
  onClose: () => void;
  onSubmit: (input: ReviewFormInput) => void;
  initialValue?: ReviewFormInput; // 수정 모드일 때 기존 리뷰 값 (없으면 새 리뷰 작성)
  title?: string; // 모달 제목 (기본: 리뷰 작성)
  submitLabel?: string; // 등록 버튼 문구 (기본: 등록)
}

// 선택 가능한 알약 버튼 (선택되면 파란색)
function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        selected
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-gray-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  );
}

export default function ReviewForm({
  onClose,
  onSubmit,
  initialValue,
  title = '리뷰 작성',
  submitLabel = '등록',
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialValue?.rating ?? 0);
  const [day, setDay] = useState<ReviewDay | null>(initialValue?.day ?? null);
  const [timeSlot, setTimeSlot] = useState<ReviewTimeSlot | null>(initialValue?.timeSlot ?? null);
  const [congestion, setCongestion] = useState<ReviewCongestion | null>(
    initialValue?.congestion ?? null,
  );
  const [content, setContent] = useState(initialValue?.content ?? '');

  // 별점은 필수, 나머지는 선택값으로 둔다.
  const canSubmit = rating > 0 && content.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ rating, day, timeSlot, congestion, content: content.trim() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6 backdrop-blur-sm">
      <section className="w-full max-w-[520px] rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-slate-900/20">
        {/* 제목 + 닫기 */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* 별점 입력 */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-900">별점</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value}점`}
                  className={value <= rating ? 'text-amber-400' : 'text-slate-300'}
                >
                  <StarIcon className="h-7 w-7" filled={value <= rating} />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-slate-600">{rating}</span>
              )}
            </div>
          </div>

          {/* 방문 요일 */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-900">방문 요일</span>
            <div className="flex flex-wrap gap-2">
              {REVIEW_DAYS.map((value) => (
                <Pill
                  key={value}
                  label={value}
                  selected={day === value}
                  onClick={() => setDay(day === value ? null : value)}
                />
              ))}
            </div>
          </div>

          {/* 방문 시간대 */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-900">방문 시간대</span>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TIME_SLOTS.map((value) => (
                <Pill
                  key={value}
                  label={value}
                  selected={timeSlot === value}
                  onClick={() => setTimeSlot(timeSlot === value ? null : value)}
                />
              ))}
            </div>
          </div>

          {/* 체감 혼잡도 */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-900">체감 혼잡도</span>
            <div className="flex flex-wrap gap-2">
              {REVIEW_CONGESTION_LEVELS.map((value) => (
                <Pill
                  key={value}
                  label={value}
                  selected={congestion === value}
                  onClick={() => setCongestion(congestion === value ? null : value)}
                />
              ))}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-900">리뷰 내용</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              placeholder="방문 후기를 자유롭게 남겨주세요..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
            />
          </div>
        </div>

        {/* 등록 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitLabel}
        </button>
      </section>
    </div>
  );
}
