// Kakao Maps JavaScript SDK 중 이 프로젝트에서 사용하는 API만 최소로 선언한다.
// (공식 타입 패키지를 설치하지 않고 필요한 부분만 직접 정의해 any 사용을 피한다)
export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    // autoload=false 로 SDK 스크립트를 불러온 뒤 실제 로딩을 끝내는 함수
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      setBounds(bounds: LatLngBounds): void;
      panTo(latlng: LatLng): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }
  }
}
