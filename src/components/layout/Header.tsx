import { LogoIcon, UserIcon } from '@/components/icons';

// 상단 메뉴는 다른 단계/팀원 담당 페이지라 아직 이동하지 않는다 (시각용).
const NAV_ITEMS = ['홈', '북마크', '동선 리스트', '마이페이지'];

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
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              title="준비 중"
              className="hidden rounded px-2 py-1 text-sm text-slate-600 hover:text-blue-500 sm:inline"
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            title="로그인 (준비 중)"
            className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            <UserIcon className="h-4 w-4" />
            로그인
          </button>
        </nav>
      </div>
    </header>
  );
}
