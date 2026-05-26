"use client";

interface EmptyFolderStateProps {
  onCreateClick: () => void;
  hasSearchQuery: boolean;
}

export default function EmptyFolderState({
  onCreateClick,
  hasSearchQuery,
}: EmptyFolderStateProps): React.ReactElement {
  if (hasSearchQuery) {
    return (
      <section className="rounded-[28px] border border-dashed border-[#CBD5E1] bg-white p-14 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#B6EEFF]/40 text-4xl">
          📁
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">
          검색 결과가 없어요
        </h2>
        <p className="mt-3 text-base font-semibold text-[#64748B]">
          다른 폴더 이름이나 저장한 장소명으로 검색해보세요.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-dashed border-[#CBD5E1] bg-white p-16 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#B6EEFF]/40 text-5xl">
        📁
      </div>
      <h2 className="text-3xl font-black text-[#0F172A]">
        아직 만든 폴더가 없어요
      </h2>
      <p className="mt-4 text-lg font-semibold text-[#64748B]">
        자주 가는 장소를 모아둘 나만의 커스텀 폴더를 만들어보세요.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mx-auto mt-8 flex h-14 items-center gap-2 rounded-2xl bg-[#3B82F6] px-7 text-lg font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
      >
        <span>➕</span>
        <span>첫 폴더 만들기</span>
      </button>
    </section>
  );
}
