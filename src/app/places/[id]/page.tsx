'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PlaceDetail from '@/components/places/PlaceDetail';
import { loadPlaceForDetail } from '@/components/places/placeHandoff';
import type { Place } from '@/types/place';

export default function PlaceDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // sessionStorage는 브라우저에서만 읽을 수 있어 화면이 뜬 뒤(useEffect)에 꺼낸다.
  // ready 로 "아직 못 읽음"과 "읽었는데 없음"을 구분해 깜빡임을 막는다.
  const [state, setState] = useState<{ ready: boolean; place: Place | null }>({
    ready: false,
    place: null,
  });

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ready: true, place: loadPlaceForDetail(id) });
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        {!state.ready ? null : state.place ? (
          <PlaceDetail place={state.place} />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              장소 정보를 불러올 수 없어요. 목록에서 장소를 다시 선택해주세요.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              장소 찾기로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
