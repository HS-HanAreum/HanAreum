"use client";

import { useState } from "react";
import { FolderCreateModalProps, FolderIconType } from "@/types/bookmark";
import { createFolderData } from "@/lib/folderUtils";

const ICON_OPTIONS = [
  { label: "폴더", value: "folder" as FolderIconType, emoji: "📁" },
  { label: "카페", value: "coffee" as FolderIconType, emoji: "☕" },
  { label: "서점", value: "book" as FolderIconType, emoji: "📚" },
  { label: "맛집", value: "food" as FolderIconType, emoji: "🍽️" },
  { label: "추천", value: "star" as FolderIconType, emoji: "⭐" },
];

export default function FolderCreateModal({
  onClose,
  onCreate,
}: FolderCreateModalProps): React.ReactElement {
  const [folderName, setFolderName] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<FolderIconType>("folder");

  const handleCreate = (): void => {
    const newFolder = createFolderData(folderName, selectedIcon, 0);

    if (newFolder === null) {
      return;
    }

    onCreate(newFolder);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6 backdrop-blur-sm">
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .modal-content {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
      <section className="modal-content w-full max-w-[640px] rounded-[32px] border border-gray-200 bg-white p-8 shadow-2xl shadow-slate-900/20"
      >
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              새 폴더 만들기
            </h2>
            <p className="mt-2 text-base font-semibold text-slate-500">
              저장할 장소를 목적에 맞게 분류해보세요.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-7">
          <label className="block">
            <span className="mb-3 block text-base font-black text-slate-900">
              폴더 이름
            </span>
            <input
              value={folderName}
              onChange={(event) => {
                setFolderName(event.target.value);
              }}
              onKeyDown={handleKeyDown}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-5 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              placeholder="예: 혼밥 맛집, 카공 장소, 술약 장소"
              autoFocus
            />
          </label>

          <div>
            <div className="mb-3 text-base font-black text-slate-900">
              아이콘 선택
            </div>
            <div className="grid grid-cols-5 gap-3">
              {ICON_OPTIONS.map((option) => {
                const isSelected = selectedIcon === option.value;
                const selectedClass =
                  "border-2 border-blue-600 text-blue-600 shadow-md shadow-blue-100";
                const defaultClass =
                  "border-gray-200 text-slate-500 hover:border-blue-200";

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedIcon(option.value);
                    }}
                    className={`flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border bg-white text-sm font-bold transition hover:-translate-y-0.5 ${
                      isSelected ? selectedClass : defaultClass
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-14 rounded-2xl border border-gray-200 bg-white text-lg font-black text-slate-500 transition hover:bg-slate-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={folderName.trim().length === 0}
            className="h-14 rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:translate-y-0"
          >
            만들기
          </button>
        </div>
      </section>
    </div>
  );
}
