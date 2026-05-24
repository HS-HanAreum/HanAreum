import type { ComponentType } from 'react';
import {
  GridIcon,
  UtensilsIcon,
  CoffeeIcon,
  BeerIcon,
  BookIcon,
  PencilIcon,
  MapPinIcon,
} from '@/components/icons';

export type CategoryId = 'all' | 'food' | 'cafe' | 'bar' | 'bookstore' | 'study' | 'spot';

interface Category {
  id: CategoryId;
  label: string;
  keyword: string; // 검색에 사용할 키워드 ('' 이면 키워드 없음 = 검색 안 함)
  Icon: ComponentType<{ className?: string }>;
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: '전체', keyword: '', Icon: GridIcon },
  { id: 'food', label: '맛집', keyword: '맛집', Icon: UtensilsIcon },
  { id: 'cafe', label: '카페', keyword: '카페', Icon: CoffeeIcon },
  { id: 'bar', label: '술집', keyword: '술집', Icon: BeerIcon },
  { id: 'bookstore', label: '서점', keyword: '서점', Icon: BookIcon },
  { id: 'study', label: '스터디', keyword: '스터디카페', Icon: PencilIcon },
  { id: 'spot', label: '가볼만한 곳', keyword: '명소', Icon: MapPinIcon },
];

interface CategoryTabsProps {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {CATEGORIES.map(({ id, label, Icon }) => {
        const active = id === selected;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
              active
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
