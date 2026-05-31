"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomFolder } from "@/types/bookmark";
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

interface FolderDetailHeaderProps {
  folder: CustomFolder;
  onFolderUpdate?: (updatedFolder: CustomFolder) => void;
}

export default function FolderDetailHeader({
  folder,
  onFolderUpdate,
}: FolderDetailHeaderProps): React.ReactElement {
  const emoji = getFolderEmoji(folder.icon);
  const colorStyle = FOLDER_COLORS[folder.colorIndex % FOLDER_COLORS.length];

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    if (editName.trim() === "" || editName === folder.title) {
      setIsEditing(false);
      setEditName(folder.title);
      return;
    }

    setIsSaving(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("로그인이 필요합니다");
      }

      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) {
        throw new Error("폴더명 수정 실패");
      }

      const updatedFolder: CustomFolder = {
        ...folder,
        title: editName.trim(),
      };

      if (onFolderUpdate) {
        onFolderUpdate(updatedFolder);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("폴더명 수정 실패:", err);
      alert("폴더명 수정에 실패했습니다.");
      setEditName(folder.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(folder.title);
    }
  };

  return (
    <div className="mb-8">
      <Link
        href="/custom-folder"
        className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
      >
        ← 커스텀폴더로 돌아가기
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-50 shadow-inner">
          <div
            className="flex h-14 w-16 items-center justify-center rounded-2xl shadow-md text-4xl"
            style={colorStyle}
          >
            {emoji}
          </div>
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                autoFocus
                className="text-4xl font-black tracking-tight text-slate-900 bg-white border-2 border-blue-500 rounded-lg px-3 py-1 focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isSaving}
                className="px-3 py-1 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-60 text-sm"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(folder.title);
                }}
                disabled={isSaving}
                className="px-3 py-1 bg-gray-300 text-slate-900 font-bold rounded-lg hover:bg-gray-400 disabled:opacity-60 text-sm"
              >
                취소
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-4xl font-black tracking-tight text-slate-900 cursor-pointer hover:text-blue-600 transition"
              title="클릭하여 폴더명 수정"
            >
              {folder.title}
            </h1>
          )}
          <p className="mt-2 text-base font-semibold text-slate-500">
            이 폴더에 저장한 장소들
          </p>
        </div>
      </div>
    </div>
  );
}
