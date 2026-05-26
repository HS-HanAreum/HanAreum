"use client";

import { useEffect, useMemo, useState } from "react";
import CustomFolderHeader from "@/components/bookmarks/CustomFolderHeader";
import FolderList from "@/components/bookmarks/FolderList";
import FolderCreateModal from "@/components/bookmarks/FolderModal";
import EmptyFolderState from "@/components/bookmarks/EmptyFolderState";
import { CustomFolder } from "@/types/bookmark";
import { filterFolderList, FOLDER_COLORS_EXPORT } from "@/lib/folderUtils";

const SCROLL_SMOOTHNESS = 0.12;
const SCROLL_ANIMATION_THRESHOLD = 0.001;
const SCROLL_BAR_TRAVEL_DISTANCE = 320;

export default function CustomFolderPage(): React.ReactElement {
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [smoothScrollProgress, setSmoothScrollProgress] = useState<number>(0);

  const visibleFolders = useMemo(() => {
    return filterFolderList(folders, query);
  }, [folders, query]);

  const handleCreateFolder = (newFolder: CustomFolder): void => {
    setFolders((currentFolders) => {
      const colorIndex = currentFolders.length % FOLDER_COLORS_EXPORT.length;
      return [
        {
          ...newFolder,
          colorIndex: colorIndex,
        },
        ...currentFolders,
      ];
    });
  };

  const handleDeleteFolder = (folderId: number): void => {
    setFolders((currentFolders) =>
      currentFolders.filter((folder) => folder.id !== folderId)
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <CustomFolderHeader />

      <main className="mx-auto max-w-[1440px] px-8 py-12">
        <section className="mb-10 flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#B6EEFF]/45 px-4 py-2 text-sm font-black text-[#3B82F6]">
              <span className="text-base">📁</span>
              <span>내 한아름</span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-[#0F172A]">
              커스텀폴더
            </h1>
            <p className="mt-5 text-xl font-semibold text-[#64748B]">
              내가 저장한 장소들을 폴더별로 모아보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="mt-9 flex h-14 items-center gap-2 rounded-2xl border-2 border-[#3B82F6] bg-white px-6 text-lg font-black text-[#3B82F6] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3B82F6] hover:text-white"
          >
            <span>➕</span>
            <span>새 폴더 만들기</span>
          </button>
        </section>

        <section className="mb-8 flex items-center justify-between rounded-[28px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl bg-[#F8FAFC] px-5 text-[#64748B] text-lg">
            <span>🔍</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              className="h-12 w-full bg-transparent text-base font-semibold outline-none placeholder:text-[#94A3B8]"
              placeholder="폴더 이름 또는 저장한 장소를 검색해보세요"
            />
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-2xl bg-[#3B82F6] px-5 py-3 text-sm font-black text-white"
            >
              전체
            </button>

            <button
              type="button"
              className="rounded-2xl px-5 py-3 text-sm font-black text-[#64748B] hover:bg-[#F8FAFC]"
            >
              최근 추가순
            </button>
          </div>
        </section>

        {visibleFolders.length > 0 ? (
          <FolderList folders={visibleFolders} onDeleteFolder={handleDeleteFolder} />
        ) : (
          <EmptyFolderState
            onCreateClick={handleOpenModal}
            hasSearchQuery={query.trim().length > 0}
          />
        )}
      </main>

      <div className="fixed right-8 top-[132px] h-[70vh] w-2 rounded-full bg-[#E2E8F0]">
        <div
          className="h-44 w-2 rounded-full bg-[#94A3B8] shadow-sm will-change-transform"
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
