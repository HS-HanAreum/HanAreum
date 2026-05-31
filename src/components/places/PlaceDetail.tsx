import Link from 'next/link';
import type { Place } from '@/types/place';
import { ChevronRightIcon, StarIcon } from '@/components/icons';
import KakaoMap from '@/components/map/KakaoMap';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import PlaceImage from './PlaceImage';
import DistanceDots, { distanceLevel, distanceLabel } from './DistanceDots';
import ReviewList from '@/components/reviews/ReviewList';

interface PlaceDetailProps {
  place: Place;
}

// "음식점 > 카페 > 디저트카페" 처럼 긴 분류에서 마지막 항목만 보여준다
function shortCategory(category: string): string {
  const parts = category
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? category;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  const category = shortCategory(place.category);
  const level = distanceLevel(place.distance);
  const distanceText = distanceLabel(place.distance);

  return (
    <div>
      {/* 위치 경로 (장소 찾기 > 카테고리 > 장소명) */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-500">
          장소 찾기
        </Link>
        <ChevronRightIcon className="h-4 w-4 text-slate-300" />
        <span>{category}</span>
        <ChevronRightIcon className="h-4 w-4 text-slate-300" />
        <span className="font-medium text-slate-900">{place.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* 좌: 상세 정보 */}
        <div className="space-y-6">
          {/* 사진 + 이름 + 분류 */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            {/* 사진은 Kakao 결과에 없어 Naver 이미지로 보조로 채운다 (카드와 같은 방식) */}
            <PlaceImage name={place.name} address={place.address} />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                {category}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
                영업 상태 준비중
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">{place.name}</h1>

            {/* 별점은 리뷰 기능 연동 후 표시 (자리표시자) */}
            <div className="mt-2 flex items-center gap-1 text-sm text-slate-400">
              <StarIcon className="h-4 w-4" />
              <span>리뷰 준비중</span>
            </div>

            <p className="mt-3 text-sm text-slate-400">소개 준비중</p>
          </section>

          {/* 주소 / 운영시간 / 전화번호 */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">주소</h2>
              <p className="mt-2 text-sm text-slate-600">
                {place.roadAddress || place.address || '주소 정보 없음'}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">운영시간</h2>
              <p className="mt-2 text-sm text-slate-400">준비중</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">전화번호</h2>
              <p className="mt-2 text-sm text-slate-600">{place.phone || '준비중'}</p>
            </div>
          </section>

          {/* 거리 정보 (한성대 기준 거리만 실제 값, 나머지 지점은 준비중) */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">거리 정보</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  한성대 <DistanceDots level={level} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{distanceText || '거리 정보 없음'}</p>
              </div>
              <div>
                <div className="text-sm text-slate-400">한성대입구역</div>
                <p className="mt-1 text-xs text-slate-400">준비중</p>
              </div>
              <div>
                <div className="text-sm text-slate-400">창신역</div>
                <p className="mt-1 text-xs text-slate-400">준비중</p>
              </div>
            </div>
          </section>

          {/* 대표 메뉴 (Kakao 검색 결과에 없는 정보 → 준비중) */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">대표 메뉴</h2>
            <p className="text-sm text-slate-400">메뉴 정보 준비중</p>
          </section>

          {/* 시간대별 혼잡도 (혼잡도 기능 연동 후 표시 → 준비중) */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">시간대별 혼잡도</h2>
            <p className="text-sm text-slate-400">혼잡도 준비중</p>
          </section>
        </div>

        {/* 우: 요약 + 액션 + 지도 */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">{place.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{category}</p>

            <div className="mt-2 flex items-center gap-1 text-sm text-slate-400">
              <StarIcon className="h-4 w-4" />
              <span>리뷰 준비중</span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">영업 상태</span>
                <span className="text-slate-400">준비중</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">학교 기준</span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  {distanceText || '정보 없음'}
                  <DistanceDots level={level} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">혼잡도</span>
                <span className="text-slate-400">준비중</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {/* 북마크는 로그인 사용자 기준으로 Supabase 에 저장된다. 동선은 별도 담당 영역이라 자리표시자로 둔다. */}
              <BookmarkButton place={place} variant="full" />
              <button
                type="button"
                title="준비 중"
                className="w-full cursor-default rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400"
              >
                동선에 추가
              </button>
              <a
                href={place.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-blue-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-600"
              >
                카카오맵에서 보기
              </a>
            </div>
          </section>
        </aside>
      </div>

      {/* 리뷰 섹션 (필터 사이드바 + 리뷰 목록) */}
      <div className="mt-6">
        <ReviewList place={place} />
      </div>
    </div>
  );
}
