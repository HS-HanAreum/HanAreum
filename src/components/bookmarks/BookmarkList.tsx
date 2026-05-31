'use client';

import { Bookmark } from '@/types/bookmark';

interface BookmarkListProps {
  bookmarks: Bookmark[];
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
        <li
          key={bookmark.id}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div>
            <p className="font-medium text-gray-900">{bookmark.place_name}</p>
            <p className="text-sm text-gray-400 mt-1">{bookmark.place_address}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}