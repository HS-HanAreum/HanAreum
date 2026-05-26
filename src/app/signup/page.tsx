import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-blue-600">HanAreum</h1>
        <p className="mb-8 text-center text-sm text-slate-500">회원가입</p>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
