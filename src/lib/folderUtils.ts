import { FolderIconType, CustomFolder } from "@/types/bookmark";

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

export function getFolderEmoji(iconName: FolderIconType): string {
  const emojiMap: Record<FolderIconType, string> = {
    coffee: "☕",
    book: "📚",
    food: "🍽️",
    star: "⭐",
    folder: "📁",
  };

  return emojiMap[iconName] || "📁";
}

export function normalizeText(value: unknown): string {
  return String(value).trim().toLowerCase();
}

export function createFolderData(
  title: string,
  icon: FolderIconType,
  colorIndex: number
): CustomFolder | null {
  const safeTitle = String(title).trim();

  if (safeTitle.length === 0) {
    return null;
  }

  return {
    // 임시 id (모달 표시용). 실제 저장 시에는 Supabase 가 발급한 uuid 로 교체된다.
    id: String(Date.now()),
    title: safeTitle,
    count: 0,
    recent: "아직 없음",
    colorIndex: colorIndex,
    icon: icon,
  };
}

export function filterFolderList(folders: CustomFolder[], query: string): CustomFolder[] {
  const keyword = normalizeText(query);

  if (keyword.length === 0) {
    return folders;
  }

  return folders.filter((folder) => {
    const title = normalizeText(folder.title);
    const recent = normalizeText(folder.recent);
    return title.includes(keyword) || recent.includes(keyword);
  });
}

export const FOLDER_COLORS_EXPORT = FOLDER_COLORS;
