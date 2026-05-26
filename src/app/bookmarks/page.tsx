import Header from '@/components/layout/Header';
import BookmarkList from '@/components/bookmarks/BookmarkList';

export default function BookmarkPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">북마크</h1>
        <p className="mb-6 text-sm text-slate-500">내가 저장한 장소들을 확인해보세요</p>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <BookmarkList bookmarks={[]} />
        </section>
      </main>
    </div>
  );
}
