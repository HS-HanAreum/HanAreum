"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import FolderList from "@/components/bookmarks/FolderList";
import FolderCreateModal from "@/components/bookmarks/FolderModal";
import EmptyFolderState from "@/components/bookmarks/EmptyFolderState";
import { CustomFolder, FolderIconType } from "@/types/bookmark";
import { filterFolderList, FOLDER_COLORS_EXPORT } from "@/lib/folderUtils";
import { supabase } from "@/lib/supabase";

// Supabase bookmark_folders 조회 행 타입
interface FolderRow {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

// 폴더 목록의 색을 화면 순서대로 다시 매긴다 (생성/삭제 후 색이 밀리지 않도록).
function withOrderedColors(folders: CustomFolder[]): CustomFolder[] {
  return folders.map((folder, index) => ({
    ...folder,
    colorIndex: index % FOLDER_COLORS_EXPORT.length,
  }));
}

const SCROLL_SMOOTHNESS = 0.12;
const SCROLL_ANIMATION_THRESHOLD = 0.001;
const SCROLL_BAR_TRAVEL_DISTANCE = 320;

export default function CustomFolderPage(): React.ReactElement {
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = 확인 중
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [smoothScrollProgress, setSmoothScrollProgress] = useState<number>(0);

  const visibleFolders = useMemo(() => {
    return filterFolderList(folders, query);
  }, [folders, query]);

  // 마운트 시: 로그인 사용자의 폴더 목록을 Supabase 에서 불러온다.
  // 폴더별 저장 장소 수(count)는 내 북마크의 folder_id 를 세어 계산한다.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) {
        setLoggedIn(false);
        return;
      }
      setLoggedIn(true);

      const [folderResult, bookmarkResult] = await Promise.all([
        supabase
          .from("bookmark_folders")
          .select("id, name, icon, created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false }),
        supabase.from("bookmarks").select("folder_id").eq("user_id", uid),
      ]);
      if (!active) return;

      const countByFolder = new Map<string, number>();
      const bookmarkRows = (bookmarkResult.data ?? []) as { folder_id: string | null }[];
      for (const row of bookmarkRows) {
        if (row.folder_id) {
          countByFolder.set(row.folder_id, (countByFolder.get(row.folder_id) ?? 0) + 1);
        }
      }

      const folderRows = (folderResult.data ?? []) as FolderRow[];
      setFolders(
        withOrderedColors(
          folderRows.map((row) => ({
            id: row.id,
            title: row.name,
            icon: (row.icon as FolderIconType) ?? "folder",
            colorIndex: 0,
            count: countByFolder.get(row.id) ?? 0,
            recent: "아직 없음",
          }))
        )
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleCreateFolder = async (newFolder: CustomFolder): Promise<void> => {
    if (!userId) {
      alert("로그인 후 폴더를 만들 수 있어요.");
      return;
    }
    const { data, error } = await supabase
      .from("bookmark_folders")
      .insert({ user_id: userId, name: newFolder.title, icon: newFolder.icon })
      .select("id, name, icon")
      .single();
    if (error || !data) {
      alert("폴더 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    const created = data as { id: string; name: string; icon: string };
    setFolders((currentFolders) =>
      withOrderedColors([
        {
          id: created.id,
          title: created.name,
          icon: (created.icon as FolderIconType) ?? "folder",
          colorIndex: 0,
          count: 0,
          recent: "아직 없음",
        },
        ...currentFolders,
      ])
    );
  };

  const handleDeleteFolder = async (folderId: string): Promise<void> => {
    const { error } = await supabase
      .from("bookmark_folders")
      .delete()
      .eq("id", folderId);
    if (error) {
      alert("폴더 삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setFolders((currentFolders) =>
      withOrderedColors(currentFolders.filter((folder) => folder.id !== folderId))
    );
  };

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number = 0;

    const animateScrollBar = (): void => {
      setSmoothScrollProgress((current) => {
        const distance = scrollProgress - current;

        if (Math.abs(distance) < SCROLL_ANIMATION_THRESHOLD) {
          return scrollProgress;
        }

        return current + distance * SCROLL_SMOOTHNESS;
      });

      animationFrameId = requestAnimationFrame(animateScrollBar);
    };

    animationFrameId = requestAnimationFrame(animateScrollBar);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollProgress]);

  const scrollBarTransformValue = `translateY(${smoothScrollProgress * SCROLL_BAR_TRAVEL_DISTANCE}px)`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="mb-10 flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-600">
              <span className="text-base">📁</span>
              <span>내 한아름</span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              커스텀폴더
            </h1>
            <p className="mt-5 text-xl font-semibold text-slate-500">
              내가 저장한 장소들을 폴더별로 모아보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="mt-9 flex h-14 items-center gap-2 rounded-2xl border-2 border-blue-500 bg-white px-6 text-lg font-black text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white"
          >
            <span>➕</span>
            <span>새 폴더 만들기</span>
          </button>
        </section>

        <section className="mb-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-5 text-slate-500 text-lg">
            <span>🔍</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              className="h-12 w-full bg-transparent text-base font-semibold outline-none placeholder:text-slate-400"
              placeholder="폴더 이름 또는 저장한 장소를 검색해보세요"
            />
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"
            >
              전체
            </button>

            <button
              type="button"
              className="rounded-2xl px-5 py-3 text-sm font-black text-slate-500 hover:bg-slate-50"
            >
              최근 추가순
            </button>
          </div>
        </section>

        {loggedIn === false ? (
          <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-100 text-5xl">
              🔒
            </div>
            <h2 className="text-3xl font-black text-slate-900">로그인 후 이용할 수 있어요</h2>
            <p className="mt-4 text-lg font-semibold text-slate-500">
              나만의 커스텀 폴더는 로그인한 뒤에 만들고 저장할 수 있어요.
            </p>
            <Link
              href="/login"
              className="mx-auto mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-blue-600 px-7 text-lg font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
            >
              로그인하러 가기
            </Link>
          </section>
        ) : visibleFolders.length > 0 ? (
          <FolderList folders={visibleFolders} onDeleteFolder={handleDeleteFolder} />
        ) : (
          <EmptyFolderState
            onCreateClick={handleOpenModal}
            hasSearchQuery={query.trim().length > 0}
          />
        )}
      </main>

      <div className="fixed right-8 top-[132px] h-[70vh] w-2 rounded-full bg-gray-200">
        <div
          className="h-44 w-2 rounded-full bg-slate-400 shadow-sm will-change-transform"
          style={{ transform: scrollBarTransformValue }}
        />
      </div>

      {isModalOpen ? (
        <FolderCreateModal
          onClose={handleCloseModal}
          onCreate={handleCreateFolder}
        />
      ) : null}
    </div>
  );
}
