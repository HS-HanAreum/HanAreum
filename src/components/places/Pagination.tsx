import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

const BLOCK_SIZE = 5; // 페이지 버튼을 5개씩 묶고, 화살표로 5페이지 단위로 이동한다

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const blockStart = Math.floor((page - 1) / BLOCK_SIZE) * BLOCK_SIZE + 1;
  const blockEnd = Math.min(totalPages, blockStart + BLOCK_SIZE - 1);
  const pages: number[] = [];
  for (let p = blockStart; p <= blockEnd; p += 1) pages.push(p);

  const hasPrevBlock = blockStart > 1;
  const hasNextBlock = blockEnd < totalPages;

  return (
    <nav className="flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={!hasPrevBlock}
        onClick={() => onChange(blockStart - BLOCK_SIZE)}
        aria-label="이전 5페이지"
        className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`h-8 w-8 rounded-full text-sm font-medium ${
            p === page ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={!hasNextBlock}
        onClick={() => onChange(blockStart + BLOCK_SIZE)}
        aria-label="다음 5페이지"
        className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
