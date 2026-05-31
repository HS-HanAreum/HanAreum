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

// 입력칸 공통 스타일 (흰 배경 + 파란색 포커스 포인트)
const FIELD_CLASS =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const LABEL_CLASS = 'mb-1 block text-sm font-medium text-slate-700';

export default function SignupForm() {
  const router = useRouter();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  // '' = 미선택, 'yes' = 학생, 'no' = 비학생. 'yes' 일 때만 학생 정보 입력란이 노출된다.
  const [isStudent, setIsStudent] = useState<'' | 'yes' | 'no'>('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [grade, setGrade] = useState('');
  const [major, setMajor] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 폼 DOM 의 값을 한 번에 읽는다. 크롬 등 브라우저 자동완성은 input 값을 채우면서도
  // React onChange 를 발생시키지 않을 수 있어, state 만 보면 비어 있는 것으로 잘못
  // 판정된다. 제출 시점에는 DOM 값을 직접 읽어 검증·가입에 사용한다.
  function readForm(form: HTMLFormElement) {
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? '');
    return {
      username: get('username').trim(),
      password: get('password'),
      passwordConfirm: get('password-confirm'),
      name: get('name').trim(),
      isStudent: get('is-student'), // 'yes' | 'no' | ''
      birthDate: get('birth-date'),
      gender: get('gender'),
      studentNo: get('student-no').trim(),
      grade: get('grade'),
      major: get('major').trim(),
      enrollmentStatus: get('enrollment-status'),
    };
  }

  // 제출 전 입력값 검증. 문제가 있으면 안내 문구를 돌려준다.
  function validate(v: ReturnType<typeof readForm>): string | null {
    if (!v.username || !v.password || !v.passwordConfirm || !v.name) {
      return '아이디, 비밀번호, 이름을 모두 입력해 주세요.';
    }
    if (!ID_PATTERN.test(v.username)) {
      return `아이디 형식이 올바르지 않습니다. (${ID_RULE_TEXT})`;
    }
    if (v.password.length < PASSWORD_MIN_LENGTH) {
      return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
    }
    if (v.password !== v.passwordConfirm) {
      return '비밀번호가 서로 일치하지 않습니다.';
    }
    if (v.isStudent !== 'yes' && v.isStudent !== 'no') {
      return '학생 여부를 선택해 주세요.';
    }
    if (v.isStudent === 'yes') {
      if (
        !v.birthDate ||
        !v.gender ||
        !v.studentNo ||
        !v.grade ||
        !v.major ||
        !v.enrollmentStatus
      ) {
        return '학생 정보를 모두 입력해 주세요.';
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const values = readForm(e.currentTarget);
    const validationError = validate(values);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    // 학생일 때만 학생 정보를 user_metadata 에 함께 저장한다.
    const profileData: Record<string, string> = {
      username: values.username,
      name: values.name,
      is_student: values.isStudent === 'yes' ? 'true' : 'false',
    };
    if (values.isStudent === 'yes') {
      profileData.birth_date = values.birthDate;
      profileData.gender = values.gender;
      profileData.student_no = values.studentNo;
      profileData.grade = values.grade;
      profileData.major = values.major;
      profileData.enrollment_status = values.enrollmentStatus;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: idToEmail(values.username),
      password: values.password,
      options: { data: profileData },
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
          name="username"
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
          name="password"
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
          name="password-confirm"
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
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <span className={LABEL_CLASS}>학생 여부</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="is-student"
              value="yes"
              checked={isStudent === 'yes'}
              onChange={() => setIsStudent('yes')}
              className="accent-blue-500"
            />
            학생입니다
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="is-student"
              value="no"
              checked={isStudent === 'no'}
              onChange={() => setIsStudent('no')}
              className="accent-blue-500"
            />
            학생이 아닙니다
          </label>
        </div>
      </div>

      {isStudent === 'yes' && (
        <>
          <div>
            <label htmlFor="signup-birth" className={LABEL_CLASS}>
              생년월일
            </label>
            <input
              id="signup-birth"
              name="birth-date"
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
              name="gender"
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
              name="student-no"
              type="text"
              value={studentNo}
              onChange={(e) => setStudentNo(e.target.value)}
              placeholder="예시: 2292004"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="signup-grade" className={LABEL_CLASS}>
              학년
            </label>
            <select
              id="signup-grade"
              name="grade"
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
              name="major"
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
              name="enrollment-status"
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
        </>
      )}

      {errorMsg && (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}
      {infoMsg && <p className="text-sm text-blue-600">{infoMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
