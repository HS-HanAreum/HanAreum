export default function CustomFolderHeader(): React.ReactElement {
  return (
    <header className="sticky top-0 z-30 h-[92px] border-b border-[#E2E8F0] bg-[#B6EEFF]/55 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm text-lg">
            📍
          </div>

          <div>
            <div className="text-2xl font-black tracking-tight text-[#3B82F6]">
              HanAreum
            </div>
            <div className="text-xs font-medium text-[#64748B]">
              한 곳에서, 더 가까이.
            </div>
          </div>
        </div>

        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button
            type="button"
            className="flex h-14 items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white/80 px-9 text-lg font-bold text-[#64748B] shadow-sm transition hover:bg-white"
          >
            <span className="text-xl">🗺️</span>
            <span>전체 카테고리</span>
          </button>

          <button
            type="button"
            className="flex h-14 items-center gap-2 rounded-2xl border-2 border-[#3B82F6] bg-white px-9 text-lg font-black text-[#0F172A] shadow-sm"
          >
            <span className="text-xl text-[#3B82F6]">📁</span>
            <span>커스텀폴더</span>
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="알림"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0F172A] shadow-sm ring-1 ring-[#E2E8F0] transition hover:-translate-y-0.5 text-xl"
          >
            🔔
          </button>

          <button
            type="button"
            aria-label="기본 정보"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0F172A] shadow-sm ring-1 ring-[#E2E8F0] transition hover:-translate-y-0.5 text-xl"
          >
            👤
          </button>
        </div>
      </div>
    </header>
  );
}
