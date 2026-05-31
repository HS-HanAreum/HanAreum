import Link from 'next/link';

// 우측 안내 카드. href 가 있는 카드만 해당 페이지로 이동하고, 나머지는 아직 준비 중(시각용).
interface Promo {
  title: string;
  description: string;
  image: string; // public/ 기준 일러스트 경로
  bgClass: string;
  href?: string; // 연결된 페이지가 있을 때만 이동
}

const PROMOS: Promo[] = [
  {
    title: '전체 카테고리',
    description: '모든 카테고리의 장소를 한눈에 확인해보세요',
    image: '/promos/house.svg',
    bgClass: 'bg-blue-50',
  },
  {
    title: '커스텀 폴더',
    description: '나만의 폴더를 만들고 장소를 저장해보세요',
    image: '/promos/folder.svg',
    bgClass: 'bg-emerald-50',
    href: '/custom-folder',
  },
  {
    title: '동선 리스트',
    description: '나만의 동선을 만들고 효율적인 코스를 계획해보세요',
    image: '/promos/map.svg',
    bgClass: 'bg-violet-50',
    href: '/routes',
  },
];

export default function PromoCards() {
  return (
    <div className="flex h-full flex-col gap-4">
      {PROMOS.map(({ title, description, image, bgClass, href }) => {
        const cardClass = `relative flex flex-1 flex-col items-start overflow-hidden rounded-2xl border border-gray-200 p-5 text-left transition-shadow hover:shadow-md ${bgClass}`;
        const content = (
          <>
            <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
            <span className="mt-auto pt-4 text-slate-400">→</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 right-2 w-24 select-none"
            />
          </>
        );

        // 연결된 페이지가 있으면 카드 전체를 클릭 가능한 링크로, 없으면 준비 중 버튼으로 둔다.
        return href ? (
          <Link key={title} href={href} className={cardClass}>
            {content}
          </Link>
        ) : (
          <button key={title} type="button" title="준비 중" className={cardClass}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
