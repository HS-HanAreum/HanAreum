'use client';

import { useEffect, useState } from 'react';
import { MapPinIcon } from '@/components/icons';
import { runWithImageLimit } from './imageQueue';

interface PlaceImageProps {
  name: string;
  address: string;
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

// 상세 페이지 대표 사진. Kakao 결과엔 사진이 없어 Naver 이미지로 보조로 채운다.
// 카드와 같은 검색어("장소명 + 지역")로 1장 요청해, 카드에서 보던 사진과 같게 뜬다.
// 원본(imageUrl) 우선 -> 깨지면 썸네일 -> 둘 다 없으면 자리표시자 아이콘 순으로 떨어진다.
export default function PlaceImage({ name, address }: PlaceImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const region = regionHint(address);
    const query = region ? `${name} ${region}` : name;
    // 동시 요청을 제한해 Naver 429를 막는다 (카드 목록과 큐를 공유한다). 자세한 내용은 imageQueue.ts.
    runWithImageLimit(() =>
      fetch(`/api/places/image?query=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      }),
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { imageUrl?: string | null; thumbnailUrl?: string | null } | null) => {
        if (!active) return;
        if (data?.imageUrl) setImageUrl(data.imageUrl);
        if (data?.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
      })
      .catch(() => {
        // 이미지는 보조 정보라 실패하면 자리표시자를 그대로 둔다
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [name, address]);

  return (
    <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
      {imageUrl && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : thumbnailUrl && !thumbError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setThumbError(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <MapPinIcon className="h-10 w-10" />
          <span className="text-xs text-slate-400">사진 준비중</span>
        </div>
      )}
    </div>
  );
}
