'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { idToEmail } from './authHelpers';

// 입력칸 공통 스타일 (흰 배경 + 파란색 포커스 포인트)
const FIELD_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const LABEL_CLASS = 'mb-1 block text-sm font-medium text-slate-700';

export default function LoginForm() {
  const router = useRouter();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    // 크롬 등 브라우저 자동완성은 input 값을 채우면서도 React onChange 를 발생시키지
    // 않을 수 있어, state 만 보면 비어 있는 것으로 잘못 판정된다.
    // 제출 시점에는 폼 DOM 값을 직접 읽어 검증·로그인에 사용한다.
    const formData = new FormData(e.currentTarget);
    const idValue = String(formData.get('username') ?? '').trim();
    const passwordValue = String(formData.get('password') ?? '');

    if (!idValue || !passwordValue) {
      setErrorMsg('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: idToEmail(idValue),
      password: passwordValue,
    });
    setLoading(false);

    if (error) {
      setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    router.push('/');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-id" className={LABEL_CLASS}>
          아이디
        </label>
        <input
          id="login-id"
          name="username"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoComplete="username"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="login-password" className={LABEL_CLASS}>
          비밀번호
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className={FIELD_CLASS}
        />
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
