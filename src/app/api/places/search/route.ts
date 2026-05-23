// 장소 검색 API. 프론트엔드는 이 엔드포인트만 호출한다 (Kakao 키는 서버에만 둔다).
// 예) GET /api/places/search?query=카페&x=127.0103&y=37.5826&radius=1000&page=1&sort=accuracy
import { NextResponse } from 'next/server';
import { searchPlaces, type SearchPlacesParams } from '@/lib/kakao';

// 문자열 쿼리 파라미터를 숫자로. 비었거나 숫자가 아니면 undefined.
function numberParam(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ error: '검색어(query)가 필요합니다.' }, { status: 400 });
  }

  const params: SearchPlacesParams = { query };

  const x = numberParam(searchParams.get('x'));
  const y = numberParam(searchParams.get('y'));
  const radius = numberParam(searchParams.get('radius'));
  const page = numberParam(searchParams.get('page'));
  const size = numberParam(searchParams.get('size'));
  const sort = searchParams.get('sort');

  if (x !== undefined) params.x = x;
  if (y !== undefined) params.y = y;
  if (radius !== undefined) params.radius = radius;
  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (sort === 'accuracy' || sort === 'distance') params.sort = sort;

  try {
    const result = await searchPlaces(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('장소 검색 실패:', error);
    return NextResponse.json({ error: '장소 검색에 실패했습니다.' }, { status: 502 });
  }
}
