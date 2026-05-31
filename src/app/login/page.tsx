import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            HanAreum
          </Link>
        </h1>
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
