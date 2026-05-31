'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BookmarkList from '@/components/bookmarks/BookmarkList';
import { supabase } from '@/lib/supabase';
import type { Bookmark } from '@/types/bookmark';

// bookmarks 조인 결과 행 타입 (places 는 place_id 로 연결된 단일 장소)
interface BookmarkRow {
  id: string;
  folder_id: string | null;
  created_at: string;
  places: { provider_place_id: string; name: string; address: string | null } | null;
}

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = 확인 중

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      if (!active) return;
      if (!uid) {
        setLoggedIn(false);
        return;
      }
      setLoggedIn(true);

      const { data: rows } = await supabase
        .from('bookmarks')
        .select('id, folder_id, created_at, places ( provider_place_id, name, address )')
        .eq('user_id', uid)
        .is('folder_id', null)
        .order('created_at', { ascending: false });
      if (!active) return;

      const list = (rows ?? []) as unknown as BookmarkRow[];
      setBookmarks(
        list.map((row) => ({
          id: row.id,
          user_id: uid,
          place_id: row.places?.provider_place_id ?? '',
          place_name: row.places?.name ?? '(이름 없음)',
          place_address: row.places?.address ?? '',
          folder_id: row.folder_id,
          created_at: row.created_at,
        })),
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">북마크</h1>
        <p className="mb-6 text-sm text-slate-500">내가 저장한 장소들을 확인해보세요</p>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          {loggedIn === false ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg">로그인 후 이용할 수 있어요</p>
              <Link href="/login" className="mt-3 text-sm font-medium text-blue-500 hover:underline">
                로그인하러 가기
              </Link>
            </div>
          ) : (
            <BookmarkList bookmarks={bookmarks} />
          )}
        </section>
      </main>
    </div>
  );
}
