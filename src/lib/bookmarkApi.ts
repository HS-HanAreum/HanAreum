import { Bookmark, BookmarkFolder } from '@/types/bookmark';

const API_BASE = '/api/bookmarks';

export async function addBookmark(folderId: string, place: {
  placeId: string;
  placeName: string;
  placeAddress: string;
  placeCategory?: string;
}): Promise<Bookmark> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderId, ...place }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add bookmark: ${response.statusText}`);
  }

  return response.json();
}

export async function getBookmarksByFolderId(folderId: string): Promise<Bookmark[]> {
  const response = await fetch(`${API_BASE}/${folderId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }

  return response.json();
}

export async function removeBookmark(folderId: string, placeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${folderId}?placeId=${encodeURIComponent(placeId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to remove bookmark: ${response.statusText}`);
  }
}

export async function getAllUserBookmarks(): Promise<Bookmark[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }

  return response.json();
}
