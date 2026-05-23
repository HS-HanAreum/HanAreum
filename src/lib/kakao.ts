// Kakao Local REST API 호출 (서버 전용).
// 이 파일은 서버에서만 import 한다. KAKAO_REST_API_KEY는 절대 브라우저에 노출하지 않는다.
import type { Place, PlaceSearchResult } from '@/types/place';

const KAKAO_KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const KAKAO_CATEGORY_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/category.json';

// Kakao 검색이 돌려주는 원본 응답 형태 (키워드/카테고리 검색이 동일한 구조)
interface KakaoDocument {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string; // 지번 주소
  road_address_name: string; // 도로명 주소
  x: string; // 경도(lng)
  y: string; // 위도(lat)
  place_url: string;
  distance: string; // 중심 좌표를 줬을 때만 채워짐 (m)
}

interface KakaoMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
}

interface KakaoResponse {
  documents: KakaoDocument[];
  meta: KakaoMeta;
}

export type PlaceSortOption = 'accuracy' | 'distance';

interface CommonSearchParams {
  x?: number; // 중심 경도(lng)
  y?: number; // 중심 위도(lat)
  radius?: number; // 중심에서 반경(m). 0~20000
  page?: number; // 결과 페이지. 1~45
  size?: number; // 페이지당 개수. 1~15
  sort?: PlaceSortOption; // 정확도순/거리순
}

export interface SearchPlacesParams extends CommonSearchParams {
  query: string; // 검색어 (필수)
}

export interface SearchByCategoryParams extends CommonSearchParams {
  categoryGroupCode: string; // Kakao 카테고리 그룹 코드 (예: FD6 음식점, CE7 카페)
}

// Kakao 원본 응답을 화면에서 쓰는 Place 형태로 변환
function toPlace(doc: KakaoDocument): Place {
  return {
    provider: 'kakao',
    providerPlaceId: doc.id,
    name: doc.place_name,
    category: doc.category_name,
    categoryGroupCode: doc.category_group_code,
    address: doc.road_address_name || doc.address_name,
    roadAddress: doc.road_address_name,
    phone: doc.phone,
    lat: Number(doc.y),
    lng: Number(doc.x),
    placeUrl: doc.place_url,
    distance: doc.distance ? Number(doc.distance) : null,
  };
}

// 위치/페이지 공통 파라미터를 URLSearchParams 에 채운다
function appendCommon(search: URLSearchParams, params: CommonSearchParams, page: number) {
  search.set('page', String(page));
  search.set('size', String(params.size ?? 15));
  search.set('sort', params.sort ?? 'accuracy');
  if (params.x !== undefined) search.set('x', String(params.x));
  if (params.y !== undefined) search.set('y', String(params.y));
  if (params.radius !== undefined) search.set('radius', String(params.radius));
}

// Kakao 호출 후 정규화된 결과로 변환 (키워드/카테고리 검색 공통)
async function requestKakao(url: string, label: string, page: number): Promise<PlaceSearchResult> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY가 없습니다. .env.local을 확인하세요.');
  }

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Kakao ${label} 실패: ${res.status}`);
  }

  const data: KakaoResponse = await res.json();
  return {
    places: data.documents.map(toPlace),
    meta: {
      totalCount: data.meta.total_count,
      pageableCount: data.meta.pageable_count,
      isEnd: data.meta.is_end,
      page,
    },
  };
}

// 키워드로 장소를 검색한다
export async function searchPlaces(params: SearchPlacesParams): Promise<PlaceSearchResult> {
  const page = params.page ?? 1;
  const search = new URLSearchParams();
  search.set('query', params.query);
  appendCommon(search, params, page);
  return requestKakao(`${KAKAO_KEYWORD_SEARCH_URL}?${search.toString()}`, '장소 검색', page);
}

// 카테고리 그룹 코드로 주변 장소를 검색한다 (키워드 없이)
export async function searchPlacesByCategory(
  params: SearchByCategoryParams,
): Promise<PlaceSearchResult> {
  const page = params.page ?? 1;
  const search = new URLSearchParams();
  search.set('category_group_code', params.categoryGroupCode);
  appendCommon(search, params, page);
  return requestKakao(`${KAKAO_CATEGORY_SEARCH_URL}?${search.toString()}`, '카테고리 검색', page);
}

// 두 좌표 사이의 거리(m). rect 검색은 distance 를 주지 않아 직접 계산한다.
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름(m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export interface RegionSearchParams {
  x: number; // 중심 경도(lng)
  y: number; // 중심 위도(lat)
  radius: number; // 반경(m)
  query?: string; // 키워드 (또는 categoryGroupCode 중 하나)
  categoryGroupCode?: string;
  gridSize?: number; // 영역을 가로·세로 몇 칸으로 나눌지 (기본 3 = 3x3 = 9칸)
}

// Kakao 한 번 검색의 45개 상한을 넘기기 위한 영역 분할 검색.
// 반경 영역을 격자 사각형(rect)으로 나눠 각 칸을 따로 검색하고(칸마다 최대 45개),
// 결과를 중복 제거 + 중심 기준 거리 계산 + 반경 필터 + 거리순 정렬해서 합친다.
export async function searchPlacesByRegion(
  params: RegionSearchParams,
): Promise<PlaceSearchResult> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY가 없습니다. .env.local을 확인하세요.');
  }

  const { x, y, radius } = params;
  const gridSize = params.gridSize ?? 3;
  const baseUrl = params.query ? KAKAO_KEYWORD_SEARCH_URL : KAKAO_CATEGORY_SEARCH_URL;

  // 반경(m)을 위도/경도 차이로 환산해 격자 한 칸 크기를 구한다
  const dLat = radius / 111320;
  const dLng = radius / (111320 * Math.cos((y * Math.PI) / 180));
  const cellWidth = (2 * dLng) / gridSize;
  const cellHeight = (2 * dLat) / gridSize;

  const requests: Promise<KakaoResponse>[] = [];
  for (let col = 0; col < gridSize; col += 1) {
    for (let row = 0; row < gridSize; row += 1) {
      const minLng = x - dLng + col * cellWidth;
      const minLat = y - dLat + row * cellHeight;
      const search = new URLSearchParams();
      if (params.query) {
        search.set('query', params.query);
      } else {
        search.set('category_group_code', params.categoryGroupCode ?? '');
      }
      search.set('rect', `${minLng},${minLat},${minLng + cellWidth},${minLat + cellHeight}`);
      search.set('size', '15');
      search.set('page', '1');
      requests.push(
        fetch(`${baseUrl}?${search.toString()}`, {
          headers: { Authorization: `KakaoAK ${apiKey}` },
          cache: 'no-store',
        }).then((res) => {
          if (!res.ok) throw new Error(`Kakao 영역 검색 실패: ${res.status}`);
          return res.json() as Promise<KakaoResponse>;
        }),
      );
    }
  }

  const responses = await Promise.all(requests);

  // 중복 제거(id 기준) + 거리 계산 + 반경 밖(사각형 모서리) 제외
  const byId = new Map<string, Place>();
  for (const response of responses) {
    for (const doc of response.documents) {
      if (byId.has(doc.id)) continue;
      const place = toPlace(doc);
      const distance = haversineMeters(y, x, place.lat, place.lng);
      if (distance > radius) continue;
      byId.set(doc.id, { ...place, distance });
    }
  }

  const places = [...byId.values()].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  return {
    places,
    meta: {
      totalCount: places.length,
      pageableCount: places.length,
      isEnd: true,
      page: 1,
    },
  };
}
