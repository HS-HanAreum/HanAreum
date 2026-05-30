// 상세페이지 리뷰 섹션에서 화면 표시에 쓰는 타입과 선택지 상수.
// 주의: DB(supabase/schema.sql의 reviews 테이블)는 변경하지 않는다.
//       요일/시간대/혼잡도는 현재 프론트엔드 상태로만 다루는 표시용 값이다.

// 방문 요일 (알약 버튼 / 카드 태그)
export const REVIEW_DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
export type ReviewDay = (typeof REVIEW_DAYS)[number];

// 방문 시간대 (2시간 단위)
export const REVIEW_TIME_SLOTS = [
  '08-10시',
  '10-12시',
  '12-14시',
  '14-16시',
  '16-18시',
  '18-20시',
  '20-22시',
  '22-24시',
] as const;
export type ReviewTimeSlot = (typeof REVIEW_TIME_SLOTS)[number];

// 체감 혼잡도
export const REVIEW_CONGESTION_LEVELS = ['여유', '보통', '혼잡'] as const;
export type ReviewCongestion = (typeof REVIEW_CONGESTION_LEVELS)[number];

// 별점 필터 선택지 (5점 -> 1점)
export const REVIEW_RATINGS = [5, 4, 3, 2, 1] as const;

// 목록에 표시하는 리뷰 한 건
export interface Review {
  id: string;
  author: string; // 작성자 닉네임
  rating: number; // 1~5
  day: ReviewDay;
  timeSlot: ReviewTimeSlot;
  congestion: ReviewCongestion;
  content: string;
  time: string; // 작성 시간 표시 (예: "12:44")
  likeCount: number;
  liked: boolean; // 현재 사용자가 좋아요를 눌렀는지 (프론트 상태)
}

// 작성 모달에서 목록으로 넘기는 입력값.
// 작성자/시간/좋아요 정보는 목록 쪽에서 채운다.
export interface ReviewFormInput {
  rating: number;
  day: ReviewDay | null;
  timeSlot: ReviewTimeSlot | null;
  congestion: ReviewCongestion | null;
  content: string;
}
