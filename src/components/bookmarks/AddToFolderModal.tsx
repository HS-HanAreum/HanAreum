'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { addBookmark } from '@/lib/bookmarkApi';
import type { Place } from '@/types/place';

interface AddToFolderModalProps {
  place: Place;
  onClose: () => void;
}

// 폴더 선택 목록에 쓰는 최소 정보 (Supabase bookmark_folders).
interface FolderOption {
  id: string;
  name: string;
  icon: string;
}

// 폴더 아이콘 키 -> 표시 이모지. (DB 의 icon 컬럼: folder/coffee/book/food/star)
const FOLDER_ICON_EMOJI: Record<string, string> = {
  folder: '📁',
  coffee: '☕',
  book: '📚',
  food: '🍽️',
  star: '⭐',
};

function folderEmoji(icon: string): string {
  return FOLDER_ICON_EMOJI[icon] ?? '📁';
}

export default function AddToFolderModal({
  place,
  onClose,
}: AddToFolderModalProps): React.ReactElement {
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [ready, setReady] = useState(false); // 폴더 목록 로딩 끝났는지
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 마운트 시: 로그인 사용자의 폴더 목록을 Supabase 에서 불러온다.
  // (커스텀폴더 페이지와 같은 bookmark_folders 테이블을 본다)
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id ?? null;
      if (!active) return;
      if (!uid) {
        setReady(true);
        return;
      }
      const { data, error: loadError } = await supabase
        .from('bookmark_folders')
        .select('id, name, icon')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (loadError) {
        setError('폴더 목록을 불러올 수 없어요');
      } else {
        const rows = (data ?? []) as FolderOption[];
        setFolders(rows);
        if (rows.length > 0) setSelectedFolderId(rows[0].id);
      }
      setReady(true);
    })();
    return () => {
      active = false;
    };
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
      setError(err instanceof Error ? err.message : '폴더에 추가할 수 없어요');
    } finally {
      setLoading(false);
    }
  }

  // 로딩 중에는 깜빡임을 막기 위해 빈 모달 틀만 잠깐 보여준다.
  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm text-slate-400">폴더를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">생성된 폴더가 없어요</h2>
          <p className="mt-2 text-sm text-slate-500">
            먼저 커스텀 폴더를 만들어주세요. (내 한아름 &gt; 커스텀폴더)
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-slate-900">
          {success ? '폴더에 추가되었어요' : '폴더 선택'}
        </h2>

        {!success ? (
          <>
            <p className="mt-2 text-sm text-slate-500">
              {place.name}을(를) 어느 폴더에 추가할까요?
            </p>

            {/* 폴더 목록 */}
            <div className="mt-4 space-y-2">
              {folders.map((folder) => (
                <label
                  key={folder.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="folder"
                    value={folder.id}
                    checked={selectedFolderId === folder.id}
                    onChange={(event) => setSelectedFolderId(event.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-2xl">{folderEmoji(folder.icon)}</span>
                  <span className="flex-1 font-semibold text-slate-900">{folder.name}</span>
                </label>
              ))}
            </div>

            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddBookmark}
                disabled={loading || !selectedFolderId}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '추가 중...' : '추가'}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              {folders.find((folder) => folder.id === selectedFolderId)?.name}에 추가되었습니다.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
