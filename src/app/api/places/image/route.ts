// 장소 이미지(보조) 검색 API. 프론트엔드는 이 엔드포인트만 호출한다 (Naver 키는 서버에만 둔다).
// GET /api/places/image?query=장소명  ->  { imageUrl, thumbnailUrl } (둘 다 string | null)
// 이미지는 Kakao 장소 정보의 "보조" 자료다. 실패하거나 없으면 null 을 돌려준다 (화면이 깨지지 않게).
import { NextResponse } from 'next/server';
import { findPlaceName, searchPlaceImage } from '@/lib/naver';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ error: '장소명(query)이 필요합니다.' }, { status: 400 });
  }

  try {
    // 1) 지역검색으로 Naver 기준 정식 상호를 확정한다 (정확도 보강).
    //    이 단계는 best-effort 라 실패하면 원래 검색어로 이미지 검색을 계속한다.
    let imageQuery = query;
    try {
      const canonical = await findPlaceName(query);
      if (canonical) imageQuery = canonical;
    } catch (localError) {
      console.error('Naver 지역검색 실패(이미지 검색은 계속):', localError);
    }

    // 2) 확정된 상호로 사진 1장을 찾는다.
    const image = await searchPlaceImage(imageQuery);
    return NextResponse.json(image);
  } catch (error) {
    // 이미지는 보조 정보라 실패(키 없음·외부 오류 등)해도 카드가 깨지지 않게 null 로 응답한다
    console.error('장소 이미지 검색 실패:', error);
    return NextResponse.json({ imageUrl: null, thumbnailUrl: null });
  }
}
