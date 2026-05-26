import Link from 'next/link';
import { LogoIcon, UserIcon } from '@/components/icons';

// 상단 메뉴. href 가 있으면 해당 페이지로 이동하고, 없으면 아직 페이지가 없어 "준비 중"으로 표시한다.
const NAV_ITEMS: { label: string; href?: string }[] = [
  { label: '홈', href: '/' },
  { label: '북마크', href: '/bookmarks' },
  { label: '동선 리스트', href: '/routes' },
  { label: '마이페이지', href: '/mypage' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold text-blue-500">HanAreum</span>
          <span className="hidden text-xs text-slate-500 sm:inline">한성대 장소 추천 서비스</span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-3">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="hidden rounded px-2 py-1 text-sm text-slate-600 hover:text-blue-500 sm:inline"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                title="준비 중"
                className="hidden cursor-default rounded px-2 py-1 text-sm text-slate-400 sm:inline"
              >
                {item.label}
              </button>
            ),
          )}
          <Link
            href="/login"
            className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            <UserIcon className="h-4 w-4" />
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
