import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
      >
        홈으로
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-blue-600">HanAreum</h1>
        <p className="mb-8 text-center text-sm text-slate-500">로그인</p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
