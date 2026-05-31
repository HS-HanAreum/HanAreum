'use client';

import { useEffect, useState } from 'react';
import type { Place } from '@/types/place';
import { supabase } from '@/lib/supabase';
import { BookmarkIcon } from '@/components/icons';

// 장소를 북마크에 저장/해제하는 버튼.
// - variant 'icon': 장소 카드 우상단의 작은 아이콘 버튼
// - variant 'full': 상세 페이지의 가로로 꽉 찬 버튼
//
// 북마크를 저장하려면 먼저 places 테이블에 장소가 있어야 한다.
// 검색 결과는 전부 저장하지 않으므로(AGENTS.md), 저장 시점에 없으면 그때 넣고 id 를 가져온다.
interface BookmarkButtonProps {
  place: Place;
  variant?: 'icon' | 'full';
}

export default function BookmarkButton({ place, variant = 'icon' }: BookmarkButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [pending, setPending] = useState(false);

  // 마운트 시: 로그인 사용자와, 이 장소가 이미 내 북마크에 있는지 확인한다.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) return;
      // bookmarks 와 places 를 조인해 provider_place_id 기준으로 내 북마크 존재 여부를 확인한다.
      // folder_id 가 null 인 것만 조회 (커스텀 폴더 장소는 제외)
      const { data: rows } = await supabase
        .from('bookmarks')
        .select('id, places!inner(provider_place_id)')
        .eq('user_id', uid)
        .eq('places.provider_place_id', place.providerPlaceId)
        .is('folder_id', null)
        .limit(1);
      if (active && rows && rows.length > 0) setBookmarked(true);
    })();
    return () => {
      active = false;
    };
  }, [place.providerPlaceId]);

  // 장소를 places 에 보장(없으면 저장)하고 id 를 돌려준다.
  // places 에는 UPDATE 정책이 없으므로 upsert 는 "중복이면 무시"로만 쓰고, id 는 따로 조회한다.
  async function ensurePlaceId(): Promise<string> {
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

    const { data, error } = await supabase
      .from('places')
      .select('id')
      .eq('provider', place.provider)
      .eq('provider_place_id', place.providerPlaceId)
      .single();
    if (error || !data) throw error ?? new Error('장소 조회 실패');
    return data.id as string;
  }

  async function handleToggle() {
    if (pending) return;
    if (!userId) {
      alert('로그인 후 북마크를 저장할 수 있어요.');
      return;
    }
    setPending(true);
    try {
      const placeId = await ensurePlaceId();
      if (bookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('place_id', placeId)
          .is('folder_id', null);
        if (error) throw error;
        setBookmarked(false);
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: userId, place_id: placeId, folder_id: null });
        if (error) throw error;
        setBookmarked(true);
      }
    } catch {
      alert('북마크 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPending(false);
    }
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60 ${
          bookmarked ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {bookmarked ? '★ 북마크 저장됨' : '☆ 북마크'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      title="북마크"
      className="absolute right-2 top-2 z-20 rounded-full bg-white/80 p-1.5 text-slate-500 transition hover:text-blue-500 disabled:opacity-60"
    >
      <BookmarkIcon className="h-4 w-4" filled={bookmarked} />
    </button>
  );
}
