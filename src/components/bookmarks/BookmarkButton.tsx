'use client';

import { useState } from 'react';

interface BookmarkButtonProps {
  placeId: string;
}

export default function BookmarkButton({ placeId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Supabase 저장 연결 예정
  };

  return (
    <button
      onClick={handleBookmark}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
        isBookmarked
          ? 'bg-yellow-400 border-yellow-400 text-white'
          : 'bg-white border-gray-300 text-gray-600'
      }`}
    >
      {isBookmarked ? '★ 저장됨' : '☆ 북마크'}
    </button>
  );
}