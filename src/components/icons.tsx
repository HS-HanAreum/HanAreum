// 외부 아이콘 라이브러리 없이 사용하는 인라인 SVG 아이콘 모음.
// 색상은 currentColor 를 따르므로 Tailwind text-* 클래스로 제어한다.
interface IconProps {
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': 'true' as const,
};

export function LogoIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z" />
    </svg>
  );
}

export function BookmarkIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function StarIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 3.5l2.6 5.3 5.8.9-4.2 4.1 1 5.8L12 16.9 6 19.6l1-5.8-4.2-4.1 5.8-.9L12 3.5Z" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} {...base} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.5-9.2-9C1.4 8 2.8 4.5 6 4.5c2 0 3.2 1.3 4 2.6.8-1.3 2-2.6 4-2.6 3.2 0 4.6 3.5 3.2 6.5C19 15.5 12 20 12 20Z" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function UtensilsIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 3v6a2 2 0 0 0 4 0V3M7 9v12" />
      <path d="M17 3c-1.5 1-2 3-2 5s.5 3 2 3v10" />
    </svg>
  );
}

export function CoffeeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 8h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
      <path d="M16 9h2a2 2 0 0 1 0 4h-2" />
      <path d="M6 3v2M10 3v2" />
    </svg>
  );
}

export function BeerIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 8h8v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8Z" />
      <path d="M14 10h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-3" />
      <path d="M6 8a2 2 0 0 1 .5-4 2.5 2.5 0 0 1 4.5-1 2 2 0 0 1 3 2" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 6c-2-1.3-5-1.3-7 0v12c2-1.3 5-1.3 7 0 2-1.3 5-1.3 7 0V6c-2-1.3-5-1.3-7 0Z" />
      <path d="M12 6v12" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 20l4-1L18 9l-3-3L5 16l-1 4Z" />
      <path d="m14 6 3 3" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
