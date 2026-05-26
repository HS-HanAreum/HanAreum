import Header from '@/components/layout/Header';
import MyPageProfile from '@/components/mypage/MyPageProfile';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">마이페이지</h1>
        <p className="mb-6 text-sm text-slate-500">내 프로필 정보</p>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <MyPageProfile />
        </section>
      </main>
    </div>
  );
}
