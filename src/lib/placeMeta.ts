// 상세페이지에서 쓰는 보조 계산: 주변 역까지 거리, 카테고리별 안내 문구(더미), 혼잡도 집계.
// 외부 API 를 런타임에 호출하지 않는다. 역 좌표는 Kakao Local API 로 한 번 조회해 고정한 값이다.

import { REVIEW_TIME_SLOTS, type ReviewCongestion, type ReviewTimeSlot } from '@/types/review';

// 주변 역 좌표 (Kakao Local 키워드 검색으로 조회한 값을 고정).
// 역 위치는 바뀌지 않으므로 매번 API 를 호출하지 않고 상수로 둔다.
export const NEARBY_STATIONS = [
  { name: '한성대입구역', lat: 37.58842, lng: 127.00602 },
  { name: '창신역', lat: 37.57941, lng: 127.0153 },
] as const;

// 두 좌표 사이의 거리(m). DistanceDots/거리 표시에 쓴다. (kakao.ts 의 haversine 과 동일 식, 클라이언트용)
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름(m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// 장소 좌표에서 각 역까지의 거리(m). 좌표가 없으면(lat/lng 0 또는 NaN) null.
export function stationDistances(
  lat: number,
  lng: number,
): { name: string; distance: number | null }[] {
  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  return NEARBY_STATIONS.map((station) => ({
    name: station.name,
    distance: hasCoord ? distanceMeters(lat, lng, station.lat, station.lng) : null,
  }));
}

// 카테고리 키워드로 분류. 더미 안내 문구를 고르는 데 쓴다.
type PlaceKind = 'cafe' | 'bar' | 'book' | 'food' | 'etc';

function placeKind(category: string): PlaceKind {
  if (/카페|커피|디저트|베이커리|제과/.test(category)) return 'cafe';
  if (/술집|주점|호프|펍|bar|와인|이자카야/i.test(category)) return 'bar';
  if (/서점|도서|책/.test(category)) return 'book';
  if (/음식|식당|맛집|한식|중식|일식|양식|분식|치킨|고기|국수|면|밥/.test(category)) return 'food';
  return 'etc';
}

// 카테고리별 더미 보조 정보. DB(places)에 실제 값이 있으면 그 값을 쓰고, 없을 때만 이 문구로 대체한다.
const DUMMY_META: Record<PlaceKind, { menu: string; hours: string; intro: string }> = {
  cafe: {
    menu: '아메리카노 · 카페라떼 · 시즌 음료',
    hours: '매일 10:00 - 22:00',
    intro: '공강 시간에 들르기 좋은 아늑한 카페예요.',
  },
  bar: {
    menu: '생맥주 · 하이볼 · 안주 모둠',
    hours: '매일 17:00 - 01:00',
    intro: '수업 끝나고 가볍게 한잔하기 좋은 곳이에요.',
  },
  book: {
    menu: '신간 도서 · 문구 · 굿즈',
    hours: '매일 11:00 - 21:00',
    intro: '조용히 책 보며 시간 보내기 좋은 공간이에요.',
  },
  food: {
    menu: '대표 메뉴 · 점심 특선 · 단품',
    hours: '매일 11:00 - 21:00',
    intro: '한 끼 든든하게 해결하기 좋은 식당이에요.',
  },
  etc: {
    menu: '대표 상품 · 추천 메뉴',
    hours: '매일 10:00 - 21:00',
    intro: '한성대 주변에서 들러볼 만한 장소예요.',
  },
};

// 표시용 보조 정보. value(실제 DB 값)가 있으면 그대로, 없으면 카테고리 더미로 채운다.
export function placeMeta(
  category: string,
  value: { menuSummary?: string | null; businessHours?: string | null; intro?: string | null },
): { menu: string; hours: string; intro: string } {
  const dummy = DUMMY_META[placeKind(category)];
  return {
    menu: value.menuSummary?.trim() || dummy.menu,
    hours: value.businessHours?.trim() || dummy.hours,
    intro: value.intro?.trim() || dummy.intro,
  };
}

// 혼잡도를 점수로. 평균 내서 막대 높이/색을 정하는 데 쓴다.
const CONGESTION_SCORE: Record<ReviewCongestion, number> = { 여유: 1, 보통: 2, 혼잡: 3 };

// 시간대별 혼잡도 한 칸. count=0 이면 그 시간대 리뷰 없음(빈 막대).
export interface CongestionSlot {
  slot: ReviewTimeSlot; // '08-10시' 등
  count: number; // 그 시간대 리뷰 수
  score: number; // 평균 혼잡도 점수 (1~3). count=0 이면 0
  level: ReviewCongestion | null; // 평균을 다시 라벨로 (색 표시용). count=0 이면 null
}

// 평균 점수(1~3)를 0~100% 로 정규화해 3등분한다. (여유=1→0%, 혼잡=3→100%)
// 33% 이하 여유, 66% 이하 보통, 그 이상 혼잡.
function scoreToLevel(score: number): ReviewCongestion {
  const percent = ((score - 1) / 2) * 100;
  if (percent <= 33) return '여유';
  if (percent <= 66) return '보통';
  return '혼잡';
}

// 리뷰들의 (시간대, 혼잡도)를 시간대별 평균 혼잡도로 집계한다. 그래프에 그대로 넘긴다.
// 시간대가 없는(미선택) 리뷰는 그래프에서 제외한다.
export function congestionByTimeSlot(
  reviews: { timeSlot: ReviewTimeSlot | null; congestion: ReviewCongestion | null }[],
): CongestionSlot[] {
  const sum: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  for (const slot of REVIEW_TIME_SLOTS) {
    sum[slot] = 0;
    cnt[slot] = 0;
  }
  for (const review of reviews) {
    if (!review.timeSlot || !review.congestion) continue;
    sum[review.timeSlot] += CONGESTION_SCORE[review.congestion];
    cnt[review.timeSlot] += 1;
  }
  return REVIEW_TIME_SLOTS.map((slot) => {
    const count = cnt[slot];
    const score = count > 0 ? sum[slot] / count : 0;
    return {
      slot,
      count,
      score,
      level: count > 0 ? scoreToLevel(score) : null,
    };
  });
}
