import Link from "next/link";

export default function FolderPlacesEmptyState(): React.ReactElement {
  return (
    <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-100 text-5xl">
        📁
      </div>
      <h2 className="text-3xl font-black text-slate-900">
        이 폴더에 장소가 없어요
      </h2>
      <p className="mt-4 text-lg font-semibold text-slate-500">
        자주 가는 장소를 추가해보세요.
      </p>
      <Link
        href="/places"
        className="mx-auto mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-blue-600 px-7 text-lg font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
      >
        <span>🔍</span>
        <span>장소 찾아보기</span>
      </Link>
    </section>
  );
}
