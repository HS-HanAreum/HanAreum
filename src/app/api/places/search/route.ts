// 장소 검색 API. 프론트엔드는 이 엔드포인트만 호출한다 (Kakao 키는 서버에만 둔다).
// 키워드 검색:   GET /api/places/search?query=카페&x=..&y=..&radius=..&page=..&sort=..
// 카테고리 검색: GET /api/places/search?category=FD6&x=..&y=..&radius=..&page=..&sort=..
import { NextResponse } from 'next/server';
import {
  searchPlaces,
  searchPlacesByCategory,
  searchPlacesByRegion,
  type PlaceSortOption,
} from '@/lib/kakao';

// 문자열 쿼리 파라미터를 숫자로. 비었거나 숫자가 아니면 undefined.
function numberParam(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  const category = searchParams.get('category')?.trim();

  if (!query && !category) {
    return NextResponse.json(
      { error: '검색어(query) 또는 카테고리(category)가 필요합니다.' },
      { status: 400 },
    );
  }

  const sortParam = searchParams.get('sort');
  const sort: PlaceSortOption | undefined =
    sortParam === 'distance' ? 'distance' : sortParam === 'accuracy' ? 'accuracy' : undefined;

  // 위치/페이지 공통 파라미터
  const common: {
    x?: number;
    y?: number;
    radius?: number;
    page?: number;
    size?: number;
    sort?: PlaceSortOption;
  } = {};
  const x = numberParam(searchParams.get('x'));
  const y = numberParam(searchParams.get('y'));
  const radius = numberParam(searchParams.get('radius'));
  const page = numberParam(searchParams.get('page'));
  const size = numberParam(searchParams.get('size'));
  if (x !== undefined) common.x = x;
  if (y !== undefined) common.y = y;
  if (radius !== undefined) common.radius = radius;
  if (page !== undefined) common.page = page;
  if (size !== undefined) common.size = size;
  if (sort !== undefined) common.sort = sort;

  // deep=1 이면 영역 분할 검색(45개 상한 초과). x, y, radius 가 필요하다.
  const deep = searchParams.get('deep') === '1';
  if (deep && (common.x === undefined || common.y === undefined || common.radius === undefined)) {
    return NextResponse.json(
      { error: '영역 분할 검색에는 x, y, radius 가 필요합니다.' },
      { status: 400 },
    );
  }

  try {
    let result;
    if (deep) {
      // x, y, radius 는 위 가드에서 존재가 보장된다
      result = await searchPlacesByRegion({
        x: common.x as number,
        y: common.y as number,
        radius: common.radius as number,
        ...(query ? { query } : { categoryGroupCode: category as string }),
      });
    } else if (query) {
      result = await searchPlaces({ query, ...common });
    } else {
      // 위 가드로 category 존재가 보장된다
      result = await searchPlacesByCategory({ categoryGroupCode: category as string, ...common });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('장소 검색 실패:', error);
    return NextResponse.json({ error: '장소 검색에 실패했습니다.' }, { status: 502 });
  }
}
