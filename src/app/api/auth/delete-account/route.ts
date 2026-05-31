import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// service role 키는 서버에서만 써야 안전하므로 요청 처리 시점에만 클라이언트를 만든다.
// (모듈 최상단에서 만들면 빌드 시 환경변수 미설정으로 실패할 수 있음)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// 본인 계정 영구 삭제.
// auth.users → public.users → bookmarks / folders / reviews / routes / route_places / *_likes
// 가 모두 ON DELETE CASCADE 로 연결되어 있으므로 관련 데이터도 함께 삭제된다.
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServiceClient();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/auth/delete-account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
