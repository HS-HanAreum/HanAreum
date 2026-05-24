'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ENROLLMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  GRADE_OPTIONS,
} from '@/components/auth/authHelpers';

// { value, label } 목록에서 저장된 코드 값을 한국어 라벨로 바꾼다. 값이 없으면 '-'.
type LabelOption = { readonly value: string; readonly label: string };
function toLabel(options: readonly LabelOption[], value: string): string {
  if (!value) return '-';
  return options.find((option) => option.value === value)?.label ?? value;
}

// 회원가입 때 user_metadata 에 저장한 프로필 정보
interface ProfileView {
  username: string;
  name: string;
  birthDate: string;
  gender: string;
  studentNo: string;
  grade: string;
  major: string;
  enrollmentStatus: string;
}

export default function MyPageProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      // 로그인하지 않은 상태면 로그인 화면으로 보낸다.
      if (error || !data.user) {
        router.replace('/login');
        return;
      }

      const meta = (data.user.user_metadata ?? {}) as Record<string, string | undefined>;
      setProfile({
        username: meta.username ?? '',
        name: meta.name ?? '',
        birthDate: meta.birth_date ?? '',
        gender: meta.gender ?? '',
        studentNo: meta.student_no ?? '',
        grade: meta.grade ?? '',
        major: meta.major ?? '',
        enrollmentStatus: meta.enrollment_status ?? '',
      });
      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return <p className="text-center text-sm text-slate-500">불러오는 중...</p>;
  }

  if (!profile) {
    return null;
  }

  const rows = [
    { label: '아이디', value: profile.username || '-' },
    { label: '이름', value: profile.name || '-' },
    { label: '생년월일', value: profile.birthDate || '-' },
    { label: '성별', value: toLabel(GENDER_OPTIONS, profile.gender) },
    { label: '학번', value: profile.studentNo || '-' },
    { label: '학년', value: toLabel(GRADE_OPTIONS, profile.grade) },
    { label: '전공', value: profile.major || '-' },
    { label: '재학 상태', value: toLabel(ENROLLMENT_STATUS_OPTIONS, profile.enrollmentStatus) },
  ];

  return (
    <div className="space-y-6">
      <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm font-medium text-slate-500">{row.label}</dt>
            <dd className="text-sm font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-blue-300"
      >
        {loggingOut ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
}
