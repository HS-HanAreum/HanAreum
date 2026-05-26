"use client";

import { useState } from "react";
import { FolderCardProps } from "@/types/bookmark";
import { getFolderEmoji } from "@/lib/folderUtils";

const FOLDER_COLORS = [
  {
    background: "linear-gradient(135deg, #3B82F6 0%, #93C5FD 100%)",
  },
  {
    background: "linear-gradient(135deg, #38BDF8 0%, #B6EEFF 100%)",
  },
  {
    background: "linear-gradient(135deg, #34D399 0%, #A7F3D0 100%)",
  },
  {
    background: "linear-gradient(135deg, #A78BFA 0%, #DDD6FE 100%)",
  },
  {
    background: "linear-gradient(135deg, #60A5FA 0%, #BFDBFE 100%)",
  },
  {
    background: "linear-gradient(135deg, #22D3EE 0%, #CFFAFE 100%)",
  },
];

interface FolderCardWithDeleteProps extends FolderCardProps {
  onDelete: (folderId: number) => void;
}

export default function FolderCard({
  folder,
  index,
  onDelete,
}: FolderCardWithDeleteProps): React.ReactElement {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const emoji = getFolderEmoji(folder.icon);
  const colorStyle = FOLDER_COLORS[folder.colorIndex % FOLDER_COLORS.length];
  const animationDelay = index * 0.04;

  const handleDelete = (): void => {
    if (confirm(`"${folder.title}" 폴더를 삭제하시겠어요?`)) {
      onDelete(folder.id);
      setShowMenu(false);
    }
  };

  return (
    <article
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200"
      style={{
        animation: `fadeInUp 0.5s ease-out ${animationDelay}s both`,
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="mb-8 flex items-start justify-between">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-50 shadow-inner text-4xl">
          <div
            className="flex h-14 w-16 items-center justify-center rounded-2xl shadow-md"
            style={colorStyle}
          >
            {emoji}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label={`${folder.title} 더보기`}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 text-lg"
          >
            ⋯
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 rounded-xl border border-gray-200 bg-white shadow-lg z-10">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                🗑️ 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="mb-5 text-2xl font-black tracking-tight text-slate-900">
        {folder.title}
      </h3>
      <div className="mb-5 h-px bg-gray-200" />

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-base font-bold text-slate-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-sm">
            🔖
          </span>
          <span>저장된 장소 {folder.count}개</span>
        </div>

        <div className="flex items-center gap-3 text-base font-bold text-slate-500">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-sm">
            🕐
          </span>
          <span>최근 추가: {folder.recent}</span>
        </div>
      </div>
    </article>
  );
}
