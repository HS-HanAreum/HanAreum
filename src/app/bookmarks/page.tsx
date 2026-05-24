import BookmarkList from '@/components/bookmarks/BookmarkList';

export default function BookmarkPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        <header className="px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900">북마크</h1>
          <p className="text-sm text-gray-400 mt-1">내가 저장한 장소들을 확인해보세요</p>
        </header>
        <BookmarkList bookmarks={[]} />
      </div>
    </main>
  );
}