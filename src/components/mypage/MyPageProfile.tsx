'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ENROLLMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  GRADE_OPTIONS,
} from '@/components/auth/authHelpers';

// 입력칸 공통 스타일 (회원가입 폼과 동일)
const FIELD_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const LABEL_CLASS = 'mb-1 block text-sm font-medium text-slate-700';

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

// 마이페이지에서 수정 가능한 6개 필드
interface EditableProfile {
  name: string;
  birthDate: string;
  gender: string;
  studentNo: string;
  grade: string;
  major: string;
}

export default function MyPageProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // 수정 모드 상태
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditableProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // 계정 삭제 상태
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  function handleStartEdit() {
    if (!profile) return;
    setForm({
      name: profile.name,
      birthDate: profile.birthDate,
      gender: profile.gender,
      studentNo: profile.studentNo,
      grade: profile.grade,
      major: profile.major,
    });
    setSaveError('');
    setSaveMsg('');
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setForm(null);
    setSaveError('');
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form || !profile) return;

    const trimmedName = form.name.trim();
    const trimmedStudentNo = form.studentNo.trim();
    const trimmedMajor = form.major.trim();

    if (!trimmedName || !trimmedStudentNo || !trimmedMajor) {
      setSaveError('이름, 학번, 전공을 모두 입력해 주세요.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveMsg('');

    // updateUser 의 data 는 기존 user_metadata 와 병합되므로
    // username / is_student / enrollment_status 등은 보존된다.
    const { error } = await supabase.auth.updateUser({
      data: {
        name: trimmedName,
        birth_date: form.birthDate,
        gender: form.gender,
        student_no: trimmedStudentNo,
        grade: form.grade,
        major: trimmedMajor,
      },
    });
    setSaving(false);

    if (error) {
      setSaveError(`저장에 실패했습니다. (${error.message})`);
      return;
    }

    // 화면 표시용 프로필도 즉시 갱신
    setProfile({
      ...profile,
      name: trimmedName,
      birthDate: form.birthDate,
      gender: form.gender,
      studentNo: trimmedStudentNo,
      grade: form.grade,
      major: trimmedMajor,
    });
    setEditing(false);
    setForm(null);
    setSaveMsg('저장되었습니다.');
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      '정말로 계정을 삭제하시겠습니까?\n저장한 폴더, 북마크, 리뷰, 동선이 모두 영구 삭제되며 복구할 수 없습니다.',
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError('');

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }

    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setDeleteError(`계정 삭제에 실패했습니다. (${body.error ?? res.statusText})`);
      setDeleting(false);
      return;
    }

    // 삭제 성공 -> 로컬 세션도 정리하고 로그인 화면으로
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return <p className="text-center text-sm text-slate-500">불러오는 중...</p>;
  }

  if (!profile) {
    return null;
  }

  // 수정 모드
  if (editing && form) {
    const updateField = <K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) =>
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

    return (
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="edit-name" className={LABEL_CLASS}>
            이름
          </label>
          <input
            id="edit-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="edit-birth" className={LABEL_CLASS}>
            생년월일
          </label>
          <input
            id="edit-birth"
            type="date"
            value={form.birthDate}
            onChange={(e) => updateField('birthDate', e.target.value)}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="edit-gender" className={LABEL_CLASS}>
            성별
          </label>
          <select
            id="edit-gender"
            value={form.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">선택</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-student-no" className={LABEL_CLASS}>
            학번
          </label>
          <input
            id="edit-student-no"
            type="text"
            value={form.studentNo}
            onChange={(e) => updateField('studentNo', e.target.value)}
            placeholder="예시: 2292004"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="edit-grade" className={LABEL_CLASS}>
            학년
          </label>
          <select
            id="edit-grade"
            value={form.grade}
            onChange={(e) => updateField('grade', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">선택</option>
            {GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-major" className={LABEL_CLASS}>
            전공
          </label>
          <input
            id="edit-major"
            type="text"
            value={form.major}
            onChange={(e) => updateField('major', e.target.value)}
            className={FIELD_CLASS}
          />
        </div>

        {saveError && (
          <p className="text-sm text-red-600" role="alert">
            {saveError}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={saving}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  // 읽기 모드
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

      {saveMsg && <p className="text-sm text-blue-600">{saveMsg}</p>}

      <button
        type="button"
        onClick={handleStartEdit}
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
      >
        프로필 수정
      </button>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-blue-300"
      >
        {loggingOut ? '로그아웃 중...' : '로그아웃'}
      </button>

      {deleteError && (
        <p className="text-sm text-red-600" role="alert">
          {deleteError}
        </p>
      )}

      <button
        type="button"
        onClick={handleDeleteAccount}
        disabled={deleting}
        className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
      >
        {deleting ? '삭제 중...' : '계정 삭제하기'}
      </button>
    </div>
  );
}
