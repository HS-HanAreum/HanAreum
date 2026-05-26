import type { Place } from '@/types/place';
import PlaceCard from './PlaceCard';

interface PlaceListProps {
  places: Place[];
  loading: boolean;
  error: string | null;
  searched: boolean;
}

export default function PlaceList({ places, loading, error, searched }: PlaceListProps) {
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
        <PlaceCard key={place.providerPlaceId} place={place} />
      ))}
    </div>
  );
}
