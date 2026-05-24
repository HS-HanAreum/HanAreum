// 로그인 / 회원가입에서 함께 쓰는 상수와 작은 도우미 함수.
// Supabase Auth는 이메일 기반이므로, 사용자가 입력한 "아이디"를
// 내부적으로 "아이디@도메인" 형태의 이메일로 바꿔서 사용한다.

// 아이디를 이메일로 바꿀 때 붙이는 도메인.
// 실제 메일 주소가 아니라 아이디 로그인을 위한 내부 값이다. 필요하면 이 값만 바꾸면 된다.
export const HANAREUM_EMAIL_DOMAIN = 'hanareum.local';

// 아이디 규칙: 영문 / 숫자 / . _ - 조합, 4~20자
export const ID_PATTERN = /^[A-Za-z0-9._-]{4,20}$/;
export const ID_RULE_TEXT = '영문, 숫자, . _ - 조합 4~20자';

// 비밀번호 최소 길이 (Supabase 기본 최소값과 동일)
export const PASSWORD_MIN_LENGTH = 6;

// 성별 선택지
export const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '응답 안 함' },
] as const;

// 학년 선택지
export const GRADE_OPTIONS = [
  { value: '1', label: '1학년' },
  { value: '2', label: '2학년' },
  { value: '3', label: '3학년' },
  { value: '4', label: '4학년' },
] as const;

// 재학 상태 선택지
export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'enrolled', label: '재학' },
  { value: 'leave', label: '휴학' },
  { value: 'graduated', label: '졸업' },
  { value: 'completed', label: '수료' },
] as const;

// 회원가입 시 Supabase Auth user_metadata 에 저장할 프로필 정보
export interface SignupProfile {
  username: string; // 사용자가 입력한 아이디
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: string;
  studentNo: string;
  grade: string;
  major: string;
  enrollmentStatus: string;
}

// 아이디를 Supabase Auth 로그인용 이메일로 변환한다.
export function idToEmail(id: string): string {
  return `${id.trim()}@${HANAREUM_EMAIL_DOMAIN}`;
}
