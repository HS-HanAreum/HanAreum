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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const supabase = getServiceClient();
    const { folderId } = await params;

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

    // 폴더의 북마크 조회 (places와 JOIN)
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        user_id,
        place_id,
        folder_id,
        created_at,
        places(name, category, address, provider_place_id)
      `)
      .eq('folder_id', folderId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // places 정보를 최상위 레벨로 평탄화
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookmarksWithPlaces = (data || []).map((bookmark: any) => ({
      id: bookmark.id,
      user_id: bookmark.user_id,
      place_id: bookmark.place_id,
      folder_id: bookmark.folder_id,
      created_at: bookmark.created_at,
      place_name: bookmark.places?.name,
      place_category: bookmark.places?.category,
      place_address: bookmark.places?.address,
      provider_place_id: bookmark.places?.provider_place_id,
    }));

    return NextResponse.json(bookmarksWithPlaces);
  } catch (error) {
    console.error('GET /api/bookmarks/[folderId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const supabase = getServiceClient();
    const { folderId } = await params;

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

    // placeId 쿼리 파라미터로 받기
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing placeId' },
        { status: 400 }
      );
    }

    // 북마크 삭제 (사용자 확인)
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('folder_id', folderId)
      .eq('place_id', placeId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/bookmarks/[folderId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
