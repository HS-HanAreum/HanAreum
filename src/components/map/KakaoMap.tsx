'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import type { Place } from '@/types/place';

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
// autoload=false: 스크립트만 받고, 실제 로딩은 kakao.maps.load 로 직접 호출한다
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY ?? ''}&autoload=false`;

interface KakaoMapProps {
  center: { lat: number; lng: number };
  places: Place[];
  selectedPlaceId: string | null;
  level?: number;
}

export default function KakaoMap({ center, places, selectedPlaceId, level = 4 }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // SDK 로드가 끝나면 지도를 1회 생성한다
  useEffect(() => {
    if (!sdkLoaded) return;
    window.kakao.maps.load(() => {
      if (!containerRef.current || mapRef.current) return;
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
    });
    // center/level 은 최초 생성 시에만 사용한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkLoaded]);

  // 장소 목록이 바뀌면 마커를 다시 그리고 화면을 마커에 맞춘다
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sdkLoaded) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (places.length === 0) {
      map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
      return;
    }

    const bounds = new window.kakao.maps.LatLngBounds();
    places.forEach((place) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      const marker = new window.kakao.maps.Marker({ position, map, title: place.name });
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    map.setBounds(bounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, sdkLoaded]);

  // 리스트에서 선택한 장소로 지도를 이동한다
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sdkLoaded || !selectedPlaceId) return;
    const selected = places.find((place) => place.providerPlaceId === selectedPlaceId);
    if (!selected) return;
    map.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceId]);

  if (!KAKAO_APP_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 p-4 text-center text-sm text-zinc-500">
        지도 키가 없습니다. .env.local의 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY를 확인하세요.
      </div>
    );
  }

  return (
    <>
      <Script src={KAKAO_SDK_URL} strategy="afterInteractive" onLoad={() => setSdkLoaded(true)} />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
