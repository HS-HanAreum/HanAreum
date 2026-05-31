"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import FolderDetailHeader from "@/components/bookmarks/FolderDetailHeader";
import FolderPlacesEmptyState from "@/components/bookmarks/FolderPlacesEmptyState";
import { CustomFolder, Bookmark } from "@/types/bookmark";
import { getBookmarksByFolderId, getFolderById, addBookmark } from "@/lib/bookmarkApi";
import { savePlaceForDetail } from "@/components/places/placeHandoff";

export default function FolderDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as string;
  const savedPlacesRef = useRef<HTMLDivElement>(null);

  const [folder, setFolder] = useState<CustomFolder | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBookmarkForDelete, setSelectedBookmarkForDelete] = useState<Bookmark | null>(null);
  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null);

  // 장소 검색 함수 (메인 페이지와 동일한 조건으로 Kakao API 검색)
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // 메인 페이지와 동일: 한성대 중심 좌표 기준, 반경 2000m
      const params = new URLSearchParams({
        query: query.trim(),
        x: '127.0103', // 한성대 경도(lng)
        y: '37.5826',  // 한성대 위도(lat)
        radius: '2000', // 반경 2000m
      });

      const response = await fetch(`/api/places/search?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        // API 응답이 { places: [...] } 형식
        const places = result.places || [];
        setSearchResults(places.slice(0, 5)); // 최대 5개만 표시
      }
    } catch (err) {
      console.error('장소 검색 실패:', err);
    } finally {
      setSearching(false);
    }
  };

  // 저장된 장소 클릭 시 상세 페이지로 이동
  const handlePlaceClick = (bookmark: Bookmark) => {
    if (bookmark.provider_place_id) {
      const place = {
        provider: 'kakao',
        providerPlaceId: bookmark.provider_place_id,
        name: bookmark.place_name || '',
        category: bookmark.place_category || '',
        address: bookmark.place_address || '',
        categoryGroupCode: '',
        roadAddress: '',
        phone: '',
        lat: 0,
        lng: 0,
        placeUrl: '',
        distance: null,
      };
      savePlaceForDetail(place);
      router.push(`/places/${bookmark.provider_place_id}`);
    }
  };

  // 북마크에 추가 함수
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddBookmark = async (place: any) => {
    if (!folder) return;

    // DB의 places 테이블에서 온 데이터는 이미 Kakao ID (providerPlaceId)를 가짐
    const placeId = place.providerPlaceId;
    setAddingPlaceId(placeId);
    try {
      await addBookmark(folder.id, {
        placeId,
        placeName: place.name,
        placeAddress: place.address || '',
        placeCategory: place.category || '',
      });

      // 북마크 목록 새로고침
      const bookmarksData = await getBookmarksByFolderId(folder.id);
      setBookmarks(bookmarksData);

      // 검색 초기화
      setSearchQuery("");
      setSearchResults([]);

      // 저장된 장소 섹션으로 스크롤
      setTimeout(() => {
        savedPlacesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      console.error('북마크 추가 실패:', err);
      alert('장소 추가에 실패했습니다.');
    } finally {
      setAddingPlaceId(null);
    }
  };

  // 삭제 모달 열기
  const handleOpenDeleteModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    bookmark: Bookmark
  ) => {
    e.stopPropagation();
    setSelectedBookmarkForDelete(bookmark);
    setShowDeleteModal(true);
  };

  // 삭제 모달 닫기
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedBookmarkForDelete(null);
  };

  // 저장된 장소 삭제 함수 (확인 후 실행)
  const handleConfirmDelete = async () => {
    if (!folder || !selectedBookmarkForDelete) return;

    const bookmark = selectedBookmarkForDelete;
    setDeletingPlaceId(bookmark.place_id);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error('로그인이 필요합니다');
      }

      const response = await fetch(
        `/api/bookmarks/${folder.id}?placeId=${bookmark.place_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('삭제 요청 실패');
      }

      // 북마크 목록 새로고침
      const bookmarksData = await getBookmarksByFolderId(folder.id);
      setBookmarks(bookmarksData);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('북마크 삭제 실패:', err);
      alert('장소 삭제에 실패했습니다.');
    } finally {
      setDeletingPlaceId(null);
    }
  };

  useEffect(() => {
    const loadFolderAndBookmarks = async () => {
      try {
        setLoading(true);

        // 폴더 정보 API에서 로드
        const folderData = await getFolderById(folderId);

        // 북마크 목록 API에서 로드
        const bookmarksData = await getBookmarksByFolderId(folderId);

        // BookmarkFolder를 CustomFolder로 변환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customFolder: CustomFolder = {
          id: folderData.id,
          title: folderData.name,
          count: bookmarksData.length,
          recent: bookmarksData.length > 0 ? bookmarksData[bookmarksData.length - 1].place_name || "" : "",
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

        {/* 새 장소 추가 섹션 (인라인) */}
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">새 장소 추가</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="장소 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 검색 결과 */}
          {searchQuery && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searching ? (
                <div className="text-center py-4 text-sm text-slate-500">
                  검색 중...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((place) => {
                  const placeId = place.providerPlaceId || place.id;
                  return (
                    <div
                      key={placeId}
                      className="flex items-start justify-between rounded-lg border border-gray-200 p-3 hover:bg-slate-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {place.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {place.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          {place.address}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddBookmark(place)}
                        disabled={addingPlaceId === placeId}
                        className="ml-3 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        {addingPlaceId === placeId ? "추가 중..." : "추가"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-sm text-slate-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          )}
        </section>

        {/* 저장된 장소 목록 */}
        <div ref={savedPlacesRef}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">저장된 장소</h2>
        </div>
        {bookmarks.length > 0 ? (
          <section className="grid grid-cols-3 gap-7 pb-16">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                onClick={() => handlePlaceClick(bookmark)}
                className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200"
              >
                <button
                  type="button"
                  onClick={(e) => handleOpenDeleteModal(e, bookmark)}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:text-red-500"
                  aria-label="삭제"
                >
                  <span className="text-lg">✕</span>
                </button>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  {bookmark.place_name}
                </h3>
                <p className="mb-2 text-sm text-slate-500">
                  {bookmark.place_category}
                </p>
                <p className="text-sm text-slate-500">
                  {bookmark.place_address}
                </p>
              </div>
            ))}
          </section>
        ) : (
          <FolderPlacesEmptyState />
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && selectedBookmarkForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              정말 삭제하시겠어요?
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              "{selectedBookmarkForDelete.place_name}"가 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deletingPlaceId !== null}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingPlaceId !== null}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deletingPlaceId === selectedBookmarkForDelete.place_id
                  ? "삭제 중..."
                  : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
