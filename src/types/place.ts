// 장소 검색 결과를 화면에 보여줄 때 쓰는 타입.
// DB에 저장하는 컬럼은 supabase/schema.sql의 places 테이블을 기준으로 한다.
// (검색 결과를 전부 저장하지 않고, 북마크/리뷰/동선 저장 시에만 필요한 필드를 저장한다)

export interface Place {
  provider: string; // 검색 제공자. 현재는 항상 'kakao'
  providerPlaceId: string; // Kakao Local API의 place id
  name: string;
  category: string; // Kakao category_name (예: "음식점 > 카페")
  categoryGroupCode: string; // Kakao category_group_code (예: "CE7")
  address: string; // 도로명 주소 우선, 없으면 지번 주소
  roadAddress: string; // 도로명 주소
  phone: string;
  lat: number; // 위도
  lng: number; // 경도
  placeUrl: string; // Kakao 장소 상세 URL
  distance: number | null; // 검색 중심에서의 거리(m). 중심 좌표를 줬을 때만 채워진다
}

export interface PlaceSearchMeta {
  totalCount: number; // 검색된 전체 장소 수
  pageableCount: number; // 노출 가능한 장소 수
  isEnd: boolean; // 현재 페이지가 마지막인지 여부
  page: number; // 현재 페이지 번호
}

export interface PlaceSearchResult {
  places: Place[];
  meta: PlaceSearchMeta;
}
