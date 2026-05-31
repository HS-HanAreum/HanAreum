'use client';

import { useEffect, useState } from 'react';
import { addBookmark } from '@/lib/bookmarkApi';
import type { CustomFolder } from '@/types/bookmark';
import type { Place } from '@/types/place';

interface AddToFolderModalProps {
  place: Place;
  onClose: () => void;
}

export default function AddToFolderModal({
  place,
  onClose,
}: AddToFolderModalProps): React.ReactElement {
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedFolders = localStorage.getItem('customFolders');
    if (storedFolders) {
      try {
        const parsed = JSON.parse(storedFolders) as CustomFolder[];
        setFolders(parsed);
        if (parsed.length > 0) {
          setSelectedFolderId(String(parsed[0].id));
        }
      } catch {
        setError('폴더 목록을 불러올 수 없어요');
      }
    }
  }, []);

  async function handleAddBookmark() {
    if (!selectedFolderId) {
      setError('폴더를 선택해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addBookmark(selectedFolderId, {
        placeId: place.providerPlaceId,
        placeName: place.name,
        placeAddress: place.address,
        placeCategory: place.category,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '폴더에 추가할 수 없어요'
      );
    } finally {
      setLoading(false);
    }
  }

  if (folders.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-2xl bg-white p-6 shadow-lg max-w-sm mx-4">
          <h2 className="text-lg font-black text-slate-900">
            생성된 폴더가 없어요
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            먼저 커스텀 폴더를 만들어주세요.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-2xl bg-white p-6 shadow-lg max-w-sm mx-4">
        <h2 className="text-lg font-black text-slate-900">
          {success ? '폴더에 추가되었어요' : '폴더 선택'}
        </h2>

        {!success && (
          <>
            <p className="mt-2 text-sm text-slate-500">
              {place.name}을(를) 어느 폴더에 추가할까요?
            </p>

            {/* 폴더 목록 */}
            <div className="mt-4 space-y-2">
              {folders.map((folder) => (
                <label
                  key={folder.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-slate-50 transition"
                >
                  <input
                    type="radio"
                    name="folder"
                    value={String(folder.id)}
                    checked={selectedFolderId === String(folder.id)}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-2xl">{folder.icon}</span>
                  <span className="flex-1 font-semibold text-slate-900">
                    {folder.title}
                  </span>
                </label>
              ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}

            {/* 버튼 */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 transition disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleAddBookmark}
                disabled={loading || !selectedFolderId}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '추가 중...' : '추가'}
              </button>
            </div>
          </>
        )}

        {success && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              {folders.find((f) => String(f.id) === selectedFolderId)?.title}
              에 추가되었습니다.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
