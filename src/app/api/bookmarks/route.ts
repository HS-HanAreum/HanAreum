import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// createClient를 함수 안에서 호출(lazy init)한다.
// 모듈 최상단에서 실행하면 빌드 시점에 환경변수가 없을 때
// 'supabaseKey is required'로 빌드가 실패하므로, 요청 처리 시에만 생성한다.
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const { folderId, placeId, placeName, placeAddress, placeCategory } = await request.json();

    if (!folderId || !placeId) {
      return NextResponse.json(
        { error: 'Missing required fields: folderId, placeId' },
        { status: 400 }
      );
    }

    // 사용자 확인 (Authorization 헤더)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 장소가 places 테이블에 이미 있는지 확인
    let placeDbId: string | null = null;

    const { data: existingPlace, error: selectError } = await supabase
      .from('places')
      .select('id')
      .eq('provider', 'kakao')
      .eq('provider_place_id', placeId)
      .maybeSingle();

    if (existingPlace) {
      placeDbId = existingPlace.id;
    } else if (placeName) {
      // 장소가 없으면 새로 생성
      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({
          provider: 'kakao',
          provider_place_id: placeId,
          name: placeName,
          category: placeCategory || null,
          address: placeAddress || null,
        })
        .select('id')
        .single();

      if (placeError) {
        return NextResponse.json(
          { error: `Failed to create place: ${placeError.message}` },
          { status: 400 }
        );
      }

      placeDbId = newPlace.id;
    } else {
      return NextResponse.json(
        { error: 'Place not found and placeName is required' },
        { status: 400 }
      );
    }

    // 북마크 추가
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        folder_id: folderId,
        place_id: placeDbId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('POST /api/bookmarks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 사용자의 모든 북마크 조회
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /api/bookmarks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
