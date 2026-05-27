'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import type { RoutePlace } from '@/types/route';

// 동선 전용 지도. 기존 KakaoMap.tsx 와 같은 로딩 방식을 따르되,
// 동선에만 필요한 "순서 번호 마커 + Polyline" 을 그린다.
// (KakaoMap.tsx 는 장소 상세에서 쓰고 있어 그대로 두고, 별도 컴포넌트로 분리)

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
// autoload=false: 스크립트만 받고 kakao.maps.load 로 직접 초기화한다
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY ?? ''}&autoload=false`;

interface RouteMapProps {
  center: { lat: number; lng: number }; // 기본 중심 (한성대 근처)
  places: RoutePlace[]; // 선택한 순서대로 정렬된 동선 장소
  level?: number;
}

// 순서 번호 배지(파란 원 안에 숫자) HTML
function numberBadge(order: number): string {
  return (
    '<div style="display:flex;align-items:center;justify-content:center;' +
    'width:28px;height:28px;border-radius:9999px;border:2px solid #ffffff;' +
    'background:#3B82F6;color:#ffffff;font-size:12px;font-weight:700;' +
    `box-shadow:0 1px 3px rgba(0,0,0,0.3)">${order}</div>`
  );
}

// 좌표가 실제 숫자인 장소만 (잘못된 저장 데이터로 지도가 깨지지 않게 방어)
function hasValidCoords(place: RoutePlace): boolean {
  return Number.isFinite(place.lat) && Number.isFinite(place.lng);
}

export default function RouteMap({ center, places, level = 5 }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

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

  // 선택한 장소가 바뀌면 번호 마커와 연결선을 다시 그린다
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sdkLoaded) return;

    // 이전 오버레이 / 연결선 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const validPlaces = places.filter(hasValidCoords);

    if (validPlaces.length === 0) {
      map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
      return;
    }

    const positions = validPlaces.map(
      (place) => new window.kakao.maps.LatLng(place.lat, place.lng),
    );
    const bounds = new window.kakao.maps.LatLngBounds();

    // 선택 순서 번호 배지
    positions.forEach((position, index) => {
      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: numberBadge(index + 1),
        map,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 2,
      });
      overlaysRef.current.push(overlay);
      bounds.extend(position);
    });

    // 장소가 2개 이상이면 좌표를 순서대로 잇는 연결선 (실제 길찾기 경로 아님)
    if (positions.length >= 2) {
      const polyline = new window.kakao.maps.Polyline({
        path: positions,
        strokeWeight: 4,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
      map.setBounds(bounds);
    } else {
      map.setCenter(positions[0]);
    }
    // center 는 비었을 때만 사용하므로 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, sdkLoaded]);

  if (!KAKAO_APP_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 p-4 text-center text-sm text-zinc-500">
        지도 키가 없습니다. .env.local의 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY를 확인하세요.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 p-4 text-center text-sm text-zinc-500">
        지도를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <>
      <Script
        src={KAKAO_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
        onError={() => setLoadError(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
