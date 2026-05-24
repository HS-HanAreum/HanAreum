'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ENROLLMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  GRADE_OPTIONS,
  ID_PATTERN,
  ID_RULE_TEXT,
  PASSWORD_MIN_LENGTH,
  idToEmail,
} from './authHelpers';

// 입력칸 공통 스타일 (흰 배경 + 하늘색 포커스 포인트)
const FIELD_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200';
const LABEL_CLASS = 'mb-1 block text-sm font-medium text-gray-700';

export default function SignupForm() {
  const router = useRouter();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [grade, setGrade] = useState('');
  const [major, setMajor] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 제출 전 입력값 검증. 문제가 있으면 안내 문구를 돌려준다.
  function validate(): string | null {
    if (
      !id.trim() ||
      !password ||
      !passwordConfirm ||
      !name.trim() ||
      !birthDate ||
      !gender ||
      !studentNo.trim() ||
      !grade ||
      !major.trim() ||
      !enrollmentStatus
    ) {
      return '모든 항목을 입력해 주세요.';
    }
    if (!ID_PATTERN.test(id.trim())) {
      return `아이디 형식이 올바르지 않습니다. (${ID_RULE_TEXT})`;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
    }
    if (password !== passwordConfirm) {
      return '비밀번호가 서로 일치하지 않습니다.';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: idToEmail(id),
      password,
      options: {
        data: {
          username: id.trim(),
          name: name.trim(),
          birth_date: birthDate,
          gender,
          student_no: studentNo.trim(),
          grade,
          major: major.trim(),
          enrollment_status: enrollmentStatus,
        },
      },
    });
    setLoading(false);

    if (error) {
      // 이미 가입된 아이디인 경우
      if (error.message.toLowerCase().includes('already registered')) {
        setErrorMsg('이미 사용 중인 아이디입니다.');
      } else {
        setErrorMsg(`회원가입에 실패했습니다. (${error.message})`);
      }
      return;
    }

    // 이메일 인증이 켜져 있으면 중복 가입 시 에러 대신 빈 identities 가 돌아온다.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrorMsg('이미 사용 중인 아이디입니다.');
      return;
    }

    // 세션이 바로 생기면 가입과 동시에 로그인된 상태 → 메인으로 이동
    if (data.session) {
      router.push('/');
      return;
    }

    // 세션이 없으면 (이메일 인증 설정이 켜진 경우) 로그인 화면으로 안내
    setInfoMsg('가입이 완료되었습니다. 로그인 화면에서 로그인해 주세요.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="signup-id" className={LABEL_CLASS}>
          아이디
        </label>
        <input
          id="signup-id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder={ID_RULE_TEXT}
          autoComplete="username"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-password" className={LABEL_CLASS}>
          비밀번호
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`${PASSWORD_MIN_LENGTH}자 이상`}
          autoComplete="new-password"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-password-confirm" className={LABEL_CLASS}>
          비밀번호 확인
        </label>
        <input
          id="signup-password-confirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="비밀번호를 한 번 더 입력"
          autoComplete="new-password"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-name" className={LABEL_CLASS}>
          이름
        </label>
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-birth" className={LABEL_CLASS}>
          생년월일
        </label>
        <input
          id="signup-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-gender" className={LABEL_CLASS}>
          성별
        </label>
        <select
          id="signup-gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
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
        <label htmlFor="signup-student-no" className={LABEL_CLASS}>
          학번
        </label>
        <input
          id="signup-student-no"
          type="text"
          value={studentNo}
          onChange={(e) => setStudentNo(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-grade" className={LABEL_CLASS}>
          학년
        </label>
        <select
          id="signup-grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
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
        <label htmlFor="signup-major" className={LABEL_CLASS}>
          전공
        </label>
        <input
          id="signup-major"
          type="text"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="signup-enrollment" className={LABEL_CLASS}>
          재학 상태
        </label>
        <select
          id="signup-enrollment"
          value={enrollmentStatus}
          onChange={(e) => setEnrollmentStatus(e.target.value)}
          className={FIELD_CLASS}
        >
          <option value="">선택</option>
          {ENROLLMENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}
      {infoMsg && <p className="text-sm text-sky-600">{infoMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
      >
        {loading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
