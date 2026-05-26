'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Place } from '@/types/place';
import { BookmarkIcon, StarIcon, MapPinIcon } from '@/components/icons';
import DistanceDots, { distanceLevel, distanceLabel } from './DistanceDots';
import { savePlaceForDetail } from './placeHandoff';

interface PlaceCardProps {
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

export default function PlaceCard({ place }: PlaceCardProps) {
  // 북마크 저장은 별도 기능(담당자/DB) 영역. 지금은 시각용 토글만으로 저장되지 않는다.
  const [bookmarked, setBookmarked] = useState(false);
  const level = distanceLevel(place.distance);
  const distanceText = distanceLabel(place.distance);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* 사진은 Kakao 검색 결과에 없어 자리표시자로 둔다 (이미지 보강은 이후 단계) */}
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <MapPinIcon className="pointer-events-none h-8 w-8 text-slate-300" />
        {/* 사진(자리표시자)을 클릭하면 장소 상세 페이지로 이동한다 */}
        <Link
          href={`/places/${place.providerPlaceId}`}
          onClick={() => savePlaceForDetail(place)}
          aria-label={`${place.name} 상세 보기`}
          className="absolute inset-0 z-10"
        />
        <button
          type="button"
          onClick={() => setBookmarked((prev) => !prev)}
          title="북마크 (로그인 후 저장 예정)"
          className="absolute right-2 top-2 z-20 rounded-full bg-white/80 p-1.5 text-slate-500 hover:text-blue-500"
        >
          <BookmarkIcon className="h-4 w-4" filled={bookmarked} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="truncate font-semibold text-slate-900">{place.name}</h3>

        {/* 별점은 리뷰 기능 연동 후 표시 (자리표시자) */}
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <StarIcon className="h-3.5 w-3.5" />
          <span>리뷰 준비중</span>
        </div>

        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{shortCategory(place.category)}</p>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{place.address}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            한성대{distanceText && ` · ${distanceText}`}
            <DistanceDots level={level} />
          </span>
          <a
            href={place.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-500 hover:underline"
          >
            상세
          </a>
        </div>
      </div>
    </div>
  );
}
