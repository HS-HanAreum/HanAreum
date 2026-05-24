import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-sky-600">HanAreum</h1>
        <p className="mb-8 text-center text-sm text-gray-500">로그인</p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
