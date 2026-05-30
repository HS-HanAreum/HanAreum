"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import FolderDetailHeader from "@/components/bookmarks/FolderDetailHeader";
import FolderPlacesEmptyState from "@/components/bookmarks/FolderPlacesEmptyState";
import { CustomFolder, Bookmark } from "@/types/bookmark";
import { getBookmarksByFolderId, getFolderById } from "@/lib/bookmarkApi";

export default function FolderDetailPage(): React.ReactElement {
  const params = useParams();
  const folderId = params.folderId as string;

  const [folder, setFolder] = useState<CustomFolder | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFolderAndBookmarks = async () => {
      try {
        setLoading(true);

        // 폴더 정보 API에서 로드
        const folderData = await getFolderById(folderId);

        // 북마크 목록 API에서 로드
        const bookmarksData = await getBookmarksByFolderId(folderId);

        // BookmarkFolder를 CustomFolder로 변환
        const customFolder: CustomFolder = {
          id: folderData.id,
          title: folderData.name,
          count: bookmarksData.length,
          recent: bookmarksData.length > 0 ? bookmarksData[bookmarksData.length - 1].placeName : "",
          colorIndex: 0,
          icon: (folderData.icon as any) || "folder",
        };

        setFolder(customFolder);
        setBookmarks(bookmarksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    loadFolderAndBookmarks();
  }, [folderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="text-center py-12">로딩 중...</div>
        </main>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center shadow-sm">
            <h2 className="text-3xl font-black text-slate-900">
              폴더를 찾을 수 없어요
            </h2>
            <p className="mt-4 text-lg font-semibold text-slate-500">
              다시 폴더 목록으로 돌아가주세요.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <FolderDetailHeader folder={folder} />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {bookmarks.length > 0 ? (
          <section className="grid grid-cols-3 gap-7 pb-16">
            {/* TODO: 북마크 데이터를 PlaceCard로 렌더링
                현재는 북마크 데이터만 표시 */}
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  {bookmark.placeName}
                </h3>
                <p className="mb-2 text-sm text-slate-500">
                  {bookmark.placeCategory}
                </p>
                <p className="text-sm text-slate-500">
                  {bookmark.placeAddress}
                </p>
              </div>
            ))}
          </section>
        ) : (
          <FolderPlacesEmptyState />
        )}
      </main>
    </div>
  );
}
