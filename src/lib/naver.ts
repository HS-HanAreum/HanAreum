// Naver 검색 API 호출 (서버 전용).
// 이 파일은 서버에서만 import 한다. NAVER_SEARCH_CLIENT_ID/SECRET은 절대 브라우저에 노출하지 않는다.
// 용도: 장소 사진 "후보" 이미지를 보조로 가져온다. (장소 기준 데이터는 Kakao 사용)
const NAVER_IMAGE_SEARCH_URL = 'https://openapi.naver.com/v1/search/image';

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

// 장소명으로 이미지 후보 1장을 찾아 썸네일 URL을 돌려준다. 결과가 없으면 null.
export async function searchPlaceImage(query: string): Promise<string | null> {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('NAVER_SEARCH_CLIENT_ID/SECRET이 없습니다. .env.local을 확인하세요.');
  }

  const search = new URLSearchParams();
  search.set('query', query);
  search.set('display', '1'); // 첫 후보 1장만 받는다
  search.set('sort', 'sim'); // 정확도순

  const res = await fetch(`${NAVER_IMAGE_SEARCH_URL}?${search.toString()}`, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Naver 이미지 검색 실패: ${res.status}`);
  }

  const data: NaverImageResponse = await res.json();
  return data.items[0]?.thumbnail ?? null;
}
