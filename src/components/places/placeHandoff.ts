// 장소 카드를 클릭해 상세 페이지로 이동할 때, 클릭한 장소 정보를 잠깐 넘겨주는 임시 저장소.
// Kakao Local API는 검색 전용이라 장소 id 하나로 단건 조회를 하기 어렵다.
// 그래서 검색 결과로 이미 받아둔 Place 객체를 sessionStorage에 잠깐 담아 상세 페이지에서 꺼내 쓴다.
// (검색 결과를 DB에 저장하지 않는다는 규칙을 지키기 위한 방식이라, 새로고침하면 정보가 없을 수 있다)
import type { Place } from '@/types/place';

const STORAGE_KEY_PREFIX = 'hanareum:place:';

// 카드 클릭 시 호출: 장소 정보를 저장한다.
export function savePlaceForDetail(place: Place): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_PREFIX + place.providerPlaceId, JSON.stringify(place));
  } catch {
    // sessionStorage를 쓸 수 없는 환경이면 조용히 무시한다 (상세 페이지에서 안내 처리)
  }
}

// 상세 페이지에서 호출: 저장해 둔 장소 정보를 꺼낸다. 없으면 null.
export function loadPlaceForDetail(id: string): Place | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + id);
    return raw ? (JSON.parse(raw) as Place) : null;
  } catch {
    return null;
  }
}
