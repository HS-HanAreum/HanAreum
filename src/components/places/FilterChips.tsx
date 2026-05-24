import { StarIcon } from '@/components/icons';

export type SortId = 'accuracy' | 'distance' | 'rating' | 'latest';

interface SortOption {
  id: SortId;
  label: string;
  enabled: boolean; // false 이면 아직 동작하지 않는 정렬 (리뷰 기능 연동 후 제공)
}

export const SORTS: SortOption[] = [
  { id: 'accuracy', label: '추천순', enabled: true },
  { id: 'distance', label: '거리순', enabled: true },
  { id: 'rating', label: '별점순', enabled: false },
  { id: 'latest', label: '최신순', enabled: false },
];

interface FilterChipsProps {
  selected: SortId;
  onSelect: (id: SortId) => void;
  countLabel: string | null;
}

export default function FilterChips({ selected, onSelect, countLabel }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {SORTS.map(({ id, label, enabled }) => {
        const active = id === selected;
        return (
          <button
            key={id}
            type="button"
            disabled={!enabled}
            onClick={() => onSelect(id)}
            title={enabled ? undefined : '리뷰 기능 연동 후 제공'}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'border-blue-500 bg-blue-500 text-white'
                : enabled
                  ? 'border-gray-200 bg-white text-slate-600 hover:bg-slate-50'
                  : 'cursor-not-allowed border-gray-200 bg-white text-slate-300'
            }`}
          >
            {id === 'accuracy' && <StarIcon className="h-3.5 w-3.5" />}
            {label}
          </button>
        );
      })}
      {countLabel && <span className="ml-auto text-xs text-slate-500">{countLabel}</span>}
    </div>
  );
}
