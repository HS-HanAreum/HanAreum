export interface Bookmark {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
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