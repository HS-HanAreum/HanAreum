// Kakao Local REST API 호출 (서버 전용).
// 이 파일은 서버에서만 import 한다. KAKAO_REST_API_KEY는 절대 브라우저에 노출하지 않는다.
import type { Place, PlaceSearchResult } from '@/types/place';

const KAKAO_KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

// Kakao 키워드 검색이 돌려주는 원본 응답 형태 (필요한 필드만 정의)
interface KakaoKeywordDocument {
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

interface KakaoKeywordMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
}

interface KakaoKeywordResponse {
  documents: KakaoKeywordDocument[];
  meta: KakaoKeywordMeta;
}

export interface SearchPlacesParams {
  query: string; // 검색어 (필수)
  x?: number; // 중심 경도(lng)
  y?: number; // 중심 위도(lat)
  radius?: number; // 중심에서 반경(m). 0~20000
  page?: number; // 결과 페이지. 1~45
  size?: number; // 페이지당 개수. 1~15
  sort?: 'accuracy' | 'distance'; // 정확도순/거리순
}

// Kakao 원본 응답을 화면에서 쓰는 Place 형태로 변환
function toPlace(doc: KakaoKeywordDocument): Place {
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

export async function searchPlaces(params: SearchPlacesParams): Promise<PlaceSearchResult> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY가 없습니다. .env.local을 확인하세요.');
  }

  const page = params.page ?? 1;
  const search = new URLSearchParams();
  search.set('query', params.query);
  search.set('page', String(page));
  search.set('size', String(params.size ?? 15));
  search.set('sort', params.sort ?? 'accuracy');
  if (params.x !== undefined) search.set('x', String(params.x));
  if (params.y !== undefined) search.set('y', String(params.y));
  if (params.radius !== undefined) search.set('radius', String(params.radius));

  const res = await fetch(`${KAKAO_KEYWORD_SEARCH_URL}?${search.toString()}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Kakao 장소 검색 실패: ${res.status}`);
  }

  const data: KakaoKeywordResponse = await res.json();
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
