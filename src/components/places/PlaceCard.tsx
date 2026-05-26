'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Place } from '@/types/place';
import {
  BookmarkIcon,
  StarIcon,
  MapPinIcon,
  CoffeeIcon,
  UtensilsIcon,
  BeerIcon,
  BookIcon,
} from '@/components/icons';
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

// 주소에서 "구/동"만 뽑아 검색어에 더한다 (동명이인 장소 정확도 보강).
// 예: "서울 성북구 삼선동2가 389" -> "성북구"
function regionHint(address: string): string {
  return address
    .split(/\s+/)
    .filter((token) => /[가-힣]+(구|동)$/.test(token))
    .slice(0, 2)
    .join(' ');
}

// 이미지가 없을 때 보여줄 카테고리 대체 아이콘. Kakao category_name 키워드로 고른다.
function categoryFallbackIcon(category: string) {
  const className = 'h-8 w-8 text-slate-300';
  if (/카페|커피/.test(category)) return <CoffeeIcon className={className} />;
  if (/술집|주점|호프|펍|bar/i.test(category)) return <BeerIcon className={className} />;
  if (/서점|도서|책/.test(category)) return <BookIcon className={className} />;
  if (/음식|식당|맛집|한식|중식|일식|양식|분식|치킨|고기/.test(category))
    return <UtensilsIcon className={className} />;
  return <MapPinIcon className={className} />;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  // 북마크 저장은 별도 기능(담당자/DB) 영역. 지금은 시각용 토글만으로 저장되지 않는다.
  const [bookmarked, setBookmarked] = useState(false);
  // 장소 이미지는 Naver 검색으로 보조로 가져온다 (Kakao 결과엔 사진이 없음).
  // 카드가 마운트될 때(= 화면에 보이는 카드만) "장소명 + 지역"으로 1장 요청한다.
  // 원본(imageUrl) 우선 -> 깨지면 썸네일 -> 둘 다 없으면 카테고리 대체 아이콘 순으로 떨어진다.
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const level = distanceLevel(place.distance);
  const distanceText = distanceLabel(place.distance);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const region = regionHint(place.address);
    const query = region ? `${place.name} ${region}` : place.name;
    fetch(`/api/places/image?query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { imageUrl?: string | null; thumbnailUrl?: string | null } | null) => {
        if (!active) return;
        if (data?.imageUrl) setImageUrl(data.imageUrl);
        if (data?.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
      })
      .catch(() => {
        // 이미지는 보조 정보라 실패하면 대체 아이콘을 그대로 둔다
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [place.name, place.address]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* 사진은 Kakao 결과에 없어 Naver 이미지로 보조로 채운다.
          원본 -> 썸네일 -> 카테고리 대체 아이콘 순으로 떨어진다. */}
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        {imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={place.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : thumbnailUrl && !thumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={place.name}
            className="h-full w-full object-cover"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            {categoryFallbackIcon(place.category)}
            <span className="text-xs font-medium">{shortCategory(place.category)}</span>
          </div>
        )}
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
