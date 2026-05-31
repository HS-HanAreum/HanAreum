'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Place } from '@/types/place';
import { supabase } from '@/lib/supabase';
import { ChevronRightIcon, StarIcon } from '@/components/icons';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import AddToFolderModal from '@/components/bookmarks/AddToFolderModal';
import PlaceImage from './PlaceImage';
import DistanceDots, { distanceLevel, distanceLabel } from './DistanceDots';
import CongestionChart from './CongestionChart';
import ReviewList from '@/components/reviews/ReviewList';
import {
  REVIEW_CONGESTION_LEVELS,
  REVIEW_TIME_SLOTS,
  type ReviewCongestion,
  type ReviewTimeSlot,
} from '@/types/review';
import {
  placeMeta,
  stationDistances,
  congestionByTimeSlot,
  type CongestionSlot,
} from '@/lib/placeMeta';

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

// 카카오맵 링크. placeUrl 이 있으면 그대로, 없으면(북마크 진입 등) id 로 재구성한다.
function kakaoMapUrl(place: Place): string {
  return place.placeUrl || `https://place.map.kakao.com/${place.providerPlaceId}`;
}

// DB 의 혼잡도 문자열이 허용 라벨일 때만 쓰고 아니면 null.
function asCongestion(value: string | null): ReviewCongestion | null {
  return value && (REVIEW_CONGESTION_LEVELS as readonly string[]).includes(value)
    ? (value as ReviewCongestion)
    : null;
}

// DB 의 시간대 문자열이 허용 라벨일 때만 쓰고 아니면 null.
function asTimeSlot(value: string | null): ReviewTimeSlot | null {
  return value && (REVIEW_TIME_SLOTS as readonly string[]).includes(value)
    ? (value as ReviewTimeSlot)
    : null;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  const category = shortCategory(place.category);
  const level = distanceLevel(place.distance);
  const distanceText = distanceLabel(place.distance);
  const meta = placeMeta(place.category, place);
  const stations = stationDistances(place.lat, place.lng);
  const mapUrl = kakaoMapUrl(place);

  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [congestion, setCongestion] = useState<CongestionSlot[]>([]);
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  // 마운트 시: 이 장소의 리뷰 수와 혼잡도 분포를 불러온다(요약 표시용).
  // 상세한 목록은 아래 ReviewList 가 따로 불러온다.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: placeRow } = await supabase
        .from('places')
        .select('id')
        .eq('provider', place.provider)
        .eq('provider_place_id', place.providerPlaceId)
        .maybeSingle();
      if (!active) return;
      const placeId = (placeRow?.id as string | undefined) ?? null;
      if (!placeId) {
        // 아직 저장된 적 없는 장소 = 리뷰 0
        setReviewCount(0);
        setCongestion(congestionByTimeSlot([]));
        return;
      }
      const { data: rows } = await supabase
        .from('reviews')
        .select('congestion, visit_time_slot')
        .eq('place_id', placeId);
      if (!active) return;
      const list = (rows ?? []) as { congestion: string | null; visit_time_slot: string | null }[];
      setReviewCount(list.length);
      setCongestion(
        congestionByTimeSlot(
          list.map((row) => ({
            timeSlot: asTimeSlot(row.visit_time_slot),
            congestion: asCongestion(row.congestion),
          })),
        ),
      );
    })();
    return () => {
      active = false;
    };
  }, [place.provider, place.providerPlaceId]);

  // 리뷰 수 표시 문구. 로딩 전에는 빈 별점 자리만.
  const reviewLabel = reviewCount === null ? '리뷰 불러오는 중' : `리뷰 ${reviewCount}개`;

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
            </div>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">{place.name}</h1>

            <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
              <StarIcon className="h-4 w-4 text-amber-400" filled />
              <span>{reviewLabel}</span>
            </div>

            <p className="mt-3 text-sm text-slate-600">{meta.intro}</p>
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
              <p className="mt-2 text-sm text-slate-600">{meta.hours}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">전화번호</h2>
              <p className="mt-2 text-sm text-slate-600">{place.phone || '준비중'}</p>
            </div>
          </section>

          {/* 대표 메뉴 */}
          <section className="min-h-[160px] rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">대표 메뉴</h2>
            <p className="text-sm text-slate-600">{meta.menu}</p>
          </section>
        </div>

        {/* 우: 요약 + 액션 + 지도 */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">{place.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{category}</p>

            <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
              <StarIcon className="h-4 w-4 text-amber-400" filled />
              <span>{reviewLabel}</span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">운영시간</span>
                <span className="text-slate-700">{meta.hours}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">학교 기준</span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  {distanceText || '정보 없음'}
                  <DistanceDots level={level} />
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {/* 북마크는 로그인 사용자 기준으로 Supabase 에 저장된다. */}
              <BookmarkButton place={place} variant="full" />
              <button
                type="button"
                onClick={() => setFolderModalOpen(true)}
                className="w-full rounded-lg border border-blue-500 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                폴더에 추가
              </button>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-blue-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-600"
              >
                카카오맵에서 보기
              </a>
            </div>
          </section>

          {/* 거리 정보 (한성대 기준 + 주변 역) */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">거리 정보</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  한성대 <DistanceDots level={level} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{distanceText || '거리 정보 없음'}</p>
              </div>
              {stations.map((station) => (
                <div key={station.name}>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    {station.name}
                    {station.distance !== null && (
                      <DistanceDots level={distanceLevel(station.distance)} />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {station.distance !== null ? distanceLabel(station.distance) : '거리 정보 없음'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 시간대별 혼잡도 (리뷰의 방문 시간대 × 체감 혼잡도 평균) */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">시간대별 혼잡도</h2>
            <CongestionChart data={congestion} />
          </section>
        </aside>
      </div>

      {/* 리뷰 섹션 (필터 사이드바 + 리뷰 목록) */}
      <div className="mt-6">
        <ReviewList place={place} />
      </div>

      {/* 폴더에 추가 모달 */}
      {folderModalOpen && (
        <AddToFolderModal place={place} onClose={() => setFolderModalOpen(false)} />
      )}
    </div>
  );
}
