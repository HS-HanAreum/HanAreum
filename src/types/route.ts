// 동선(나만의 코스) 저장에 쓰는 타입.
// 장소 검색 결과(@/types/place 의 Place)에서 동선 저장에 꼭 필요한 필드만 추린다.
// 나중에 Supabase routes / route_places / places 테이블로 옮기기 쉽도록
// 중첩 없이 평평한 구조로 둔다. (이번 작업에서는 localStorage 에만 저장한다)

export interface RoutePlace {
  provider: 'kakao'; // 검색 제공자. 현재는 항상 'kakao'
  providerPlaceId: string; // Kakao Local API 의 place id
  name: string;
  address: string; // 도로명 주소 우선
  category: string; // Kakao category_name (예: "음식점 > 카페")
  lat: number; // 위도
  lng: number; // 경도
  placeUrl: string; // Kakao 장소 상세 URL
}

// 저장된 동선 하나. places 는 들르는 순서대로 정렬된 배열이다.
export interface SavedRoute {
  id: string;
  name: string;
  places: RoutePlace[];
}
