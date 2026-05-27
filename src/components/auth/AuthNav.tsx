'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserIcon } from '@/components/icons';

// 헤더 우측을 로그인 여부에 따라 다르게 보여준다.
// - 비로그인: "로그인" 버튼
// - 로그인: 아이디(마이페이지 링크) + 로그아웃 버튼
export default function AuthNav() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    // 세션의 사용자에서 표시할 아이디를 뽑는다. user_metadata.username 우선,
    // 없으면 로그인 이메일(아이디@도메인)의 앞부분을 쓴다.
    function applyUser(user: User | null) {
      if (!user) {
        setUsername(null);
        return;
      }
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      const name = meta.username ?? (user.email ? user.email.split('@')[0] : '');
      setUsername(name || '사용자');
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      applyUser(data.user);
      setReady(true);
    });

    // 로그인/로그아웃이 일어나면 헤더 표시를 즉시 갱신한다.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push('/');
    router.refresh();
  }

  // 세션 확인 전에는 자리만 잡아 깜빡임을 줄인다.
  if (!ready) {
    return <span className="h-8 w-20" aria-hidden />;
  }

  if (!username) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
      >
        <UserIcon className="h-4 w-4" />
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/mypage"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-500"
      >
        <UserIcon className="h-4 w-4" />
        {username}님
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-blue-300"
      >
        {loggingOut ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
}
