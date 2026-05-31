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
  userId: string;
  placeId: string;
  placeName: string;
  placeCategory?: string;
  placeAddress: string;
  folderId: string | null;
  createdAt: string;
}

export interface BookmarkFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}
