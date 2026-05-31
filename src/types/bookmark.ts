// 폴더 아이콘 타입
export type FolderIconType = "folder" | "coffee" | "book" | "food" | "star";

// 커스텀 폴더 타입 (id 는 Supabase bookmark_folders 의 uuid)
export interface CustomFolder {
  id: string;
  title: string;
  count: number;
  recent: string;
  colorIndex: number;
  icon: FolderIconType;
}

// 폴더 카드 Props
export interface FolderCardProps {
  folder: CustomFolder;
  index: number;
}

// 폴더 생성 모달 Props
export interface FolderCreateModalProps {
  onClose: () => void;
  onCreate: (folder: CustomFolder) => void;
}

// 아이콘 옵션
export interface IconOption {
  label: string;
  value: FolderIconType;
}
export interface Bookmark {
  id: string;
  user_id: string;
  place_id: string;
  folder_id: string | null;
  created_at: string;
  // places 테이블에서 JOIN된 정보
  place_name?: string;
  place_category?: string;
  place_address?: string;
}

export interface BookmarkFolder {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
}
