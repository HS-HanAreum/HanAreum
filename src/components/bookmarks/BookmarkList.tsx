'use client';

import Link from 'next/link';
import { Bookmark } from '@/types/bookmark';
import type { Place } from '@/types/place';
import { savePlaceForDetail } from '@/components/places/placeHandoff';

interface BookmarkListProps {
  bookmarks: Bookmark[];
}

// 북마크가 가진 정보(이름·주소·id)만으로 상세 페이지에 넘길 최소 Place를 만든다.
// 나머지 항목은 상세 페이지에서 "준비중"으로 표시된다.
function toPlace(bookmark: Bookmark): Place {
  return {
    provider: 'kakao',
    providerPlaceId: bookmark.place_id,
    name: bookmark.place_name ?? '',
    category: bookmark.place_category ?? '',
    categoryGroupCode: '',
    address: bookmark.place_address ?? '',
    roadAddress: bookmark.place_address ?? '',
    phone: '',
    lat: 0,
    lng: 0,
    placeUrl: '',
    distance: null,
  };
}

export default function BookmarkList({ bookmarks }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg">저장된 장소가 없어요</p>
        <p className="text-sm mt-2">마음에 드는 장소를 북마크해보세요!</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4 p-4">
      {bookmarks.map((bookmark) => (
        <li key={bookmark.id}>
          <Link
            href={`/places/${bookmark.place_id}`}
            onClick={() => savePlaceForDetail(toPlace(bookmark))}
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <div>
              <p className="font-medium text-gray-900">{bookmark.place_name}</p>
              <p className="text-sm text-gray-400 mt-1">{bookmark.place_address}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}