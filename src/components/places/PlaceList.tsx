'use client';

import { useEffect, useState } from 'react';
import type { Place } from '@/types/place';
import { supabase } from '@/lib/supabase';
import PlaceCard from './PlaceCard';

interface PlaceListProps {
  places: Place[];
  loading: boolean;
  error: string | null;
  searched: boolean;
}

export default function PlaceList({ places, loading, error, searched }: PlaceListProps) {
  // 현재 보이는 장소들의 리뷰 수를 한 번에 불러온다 (카드마다 따로 조회하면 N+1).
  // providerPlaceId -> 리뷰 수. 아직 저장된 적 없는 장소는 0.
  const [reviewCounts, setReviewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    const ids = places.map((place) => place.providerPlaceId);
    if (ids.length === 0) {
      setReviewCounts({});
      return;
    }
    (async () => {
      // places 와 reviews 를 조인해 장소별 리뷰 수를 집계한다 (1쿼리).
      const { data } = await supabase
        .from('places')
        .select('provider_place_id, reviews(count)')
        .eq('provider', 'kakao')
        .in('provider_place_id', ids);
      if (!active) return;
      const rows = (data ?? []) as { provider_place_id: string; reviews: { count: number }[] }[];
      // 먼저 전체를 0 으로 둔다. 아직 places 에 저장된 적 없는 장소(=조인 결과에 없음)는 리뷰 0.
      const counts: Record<string, number> = {};
      for (const id of ids) counts[id] = 0;
      for (const row of rows) {
        counts[row.provider_place_id] = row.reviews?.[0]?.count ?? 0;
      }
      setReviewCounts(counts);
    })();
    return () => {
      active = false;
    };
  }, [places]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">검색 중...</p>;
  }
  if (error) {
    return <p className="py-16 text-center text-sm text-red-500">{error}</p>;
  }
  if (!searched) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        검색어를 입력하거나 카테고리를 선택해 한성대 주변 장소를 찾아보세요.
      </p>
    );
  }
  if (places.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">검색 결과가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <PlaceCard
          key={place.providerPlaceId}
          place={place}
          reviewCount={reviewCounts[place.providerPlaceId]}
        />
      ))}
    </div>
  );
}
