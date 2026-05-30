import { Bookmark, BookmarkFolder } from '@/types/bookmark';
import { createClient } from '@supabase/supabase-js';

const API_BASE = '/api/bookmarks';

// 토큰 가져오기
async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// API 요청 헬퍼
async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

export async function addBookmark(folderId: string, place: {
  placeId: string;
  placeName: string;
  placeAddress: string;
  placeCategory?: string;
}): Promise<Bookmark> {
  const token = await getAuthToken();
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ folderId, ...place }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add bookmark: ${response.statusText}`);
  }

  return response.json();
}

export async function getBookmarksByFolderId(folderId: string): Promise<Bookmark[]> {
  const response = await fetchWithAuth(`${API_BASE}/${folderId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }

  return response.json();
}

export async function removeBookmark(folderId: string, placeId: string): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE}/${folderId}?placeId=${encodeURIComponent(placeId)}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Failed to remove bookmark: ${response.statusText}`);
  }
}

export async function getAllUserBookmarks(): Promise<Bookmark[]> {
  const response = await fetchWithAuth(API_BASE);

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
  }

  return response.json();
}

export async function getFolderById(folderId: string): Promise<BookmarkFolder> {
  const response = await fetchWithAuth(`/api/folders/${folderId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch folder: ${response.statusText}`);
  }

  return response.json();
}
