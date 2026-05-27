// Naver 검색 API 호출 (서버 전용).
// 이 파일은 서버에서만 import 한다. NAVER_SEARCH_CLIENT_ID/SECRET은 절대 브라우저에 노출하지 않는다.
// 용도: 장소 사진 "후보" 이미지를 보조로 가져온다. (장소 기준 데이터는 Kakao 사용)
//   - 지역검색: Kakao 상호를 Naver 기준 "정식 상호"로 확정해 이미지 검색 정확도를 높인다.
//   - 이미지검색: 확정된 상호로 사진 1장을 찾는다.
const NAVER_IMAGE_SEARCH_URL = 'https://openapi.naver.com/v1/search/image';
const NAVER_LOCAL_SEARCH_URL = 'https://openapi.naver.com/v1/search/local.json';

// 두 검색 API가 공통으로 쓰는 인증 헤더. 키가 없으면 예외를 던진다.
function naverHeaders(): Record<string, string> {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('NAVER_SEARCH_CLIENT_ID/SECRET이 없습니다. .env.local을 확인하세요.');
  }
  return {
    'X-Naver-Client-Id': clientId,
    'X-Naver-Client-Secret': clientSecret,
  };
}

// Naver 이미지 검색 응답 중 이 프로젝트에서 쓰는 필드만 선언
interface NaverImageItem {
  title: string;
  link: string; // 원본 이미지 URL
  thumbnail: string; // 썸네일 이미지 URL
  sizeheight: string;
  sizewidth: string;
}

interface NaverImageResponse {
  items: NaverImageItem[];
}

// 장소 이미지 후보. 원본(고화질)을 우선 쓰고, 원본이 깨지면 썸네일로 대체한다.
export interface PlaceImage {
  imageUrl: string | null; // 원본 이미지 URL (link)
  thumbnailUrl: string | null; // 보조 썸네일 URL
}

// 장소명으로 이미지 후보 1장을 찾아 원본/썸네일 URL을 돌려준다. 결과가 없으면 둘 다 null.
export async function searchPlaceImage(query: string): Promise<PlaceImage> {
  const search = new URLSearchParams();
  search.set('query', query);
  search.set('display', '1'); // 첫 후보 1장만 받는다
  search.set('sort', 'sim'); // 정확도순
  search.set('filter', 'large'); // 작은 클립아트/로고 대신 큰 이미지 우선 (화질·정확도 보강)

  const res = await fetch(`${NAVER_IMAGE_SEARCH_URL}?${search.toString()}`, {
    headers: naverHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Naver 이미지 검색 실패: ${res.status}`);
  }

  const data: NaverImageResponse = await res.json();
  const item = data.items[0];
  return {
    imageUrl: item?.link ?? null,
    thumbnailUrl: item?.thumbnail ?? null,
  };
}

// Naver 지역검색 응답 중 이 프로젝트에서 쓰는 필드만 선언
interface NaverLocalItem {
  title: string; // 검색어와 겹치는 부분이 <b> 태그로 강조되어 옴
}

interface NaverLocalResponse {
  items: NaverLocalItem[];
}

// 제목에 섞여 오는 HTML 태그(<b> 등)를 제거한다
function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

// 지역검색으로 "정식 상호"를 찾아 돌려준다. 결과가 없으면 null.
// Kakao 상호로 바로 이미지 검색하면 표기 차이로 정확도가 떨어져, 먼저 Naver 기준 상호로 맞춘다.
export async function findPlaceName(query: string): Promise<string | null> {
  const search = new URLSearchParams();
  search.set('query', query);
  search.set('display', '1'); // 가장 관련도 높은 1곳만

  const res = await fetch(`${NAVER_LOCAL_SEARCH_URL}?${search.toString()}`, {
    headers: naverHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Naver 지역검색 실패: ${res.status}`);
  }

  const data: NaverLocalResponse = await res.json();
  const title = data.items[0]?.title;
  return title ? stripTags(title) : null;
}
