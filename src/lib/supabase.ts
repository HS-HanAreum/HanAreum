// 브라우저에서 사용하는 Supabase 클라이언트.
// 공개 키(anon key)만 사용하며, 데이터 보호는 DB의 RLS 정책이 담당한다.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 없습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
