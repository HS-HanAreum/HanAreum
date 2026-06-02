import type { ReviewCongestion } from '@/types/review';
import type { CongestionSlot } from '@/lib/placeMeta';

// 시간대별 혼잡도 가로 막대그래프. 차트 라이브러리 없이 Tailwind 만으로 그린다 (AGENTS §5).
// 데이터는 이 장소 리뷰들의 (방문 시간대 × 체감 혼잡도) 평균.
// 리뷰가 있는 시간대만 한 행씩 보여준다 (막대 길이=평균 혼잡도, 우측에 레벨·건수).

interface CongestionChartProps {
  data: CongestionSlot[];
}

// 혼잡도별 막대 색 (혼잡도 태그 색과 통일: 여유=초록, 보통=노랑, 혼잡=빨강).
const BAR_CLASS: Record<ReviewCongestion, string> = {
  여유: 'bg-emerald-400',
  보통: 'bg-amber-400',
  혼잡: 'bg-red-400',
};

// 레벨 글자 색 (우측 라벨용).
const TEXT_CLASS: Record<ReviewCongestion, string> = {
  여유: 'text-emerald-600',
  보통: 'text-amber-600',
  혼잡: 'text-red-600',
};

export default function CongestionChart({ data }: CongestionChartProps) {
  // 리뷰에 시간대+혼잡도 정보가 있는 시간대만 추린다.
  const slots = data.filter((item) => item.count > 0);

  if (slots.length === 0) {
    return <p className="text-sm text-slate-400">아직 시간대별 혼잡도 정보가 없어요.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {slots.map((item) => {
          // 점수 1~3 을 막대 길이 비율로 (혼잡=100%, 여유=33%). 최소 길이 보장.
          const widthPercent = item.level ? Math.max(20, (item.score / 3) * 100) : 0;
          return (
            <div key={item.slot} className="flex items-center gap-2">
              {/* 시간대 라벨 */}
              <span className="w-16 shrink-0 text-xs text-slate-500">{item.slot}</span>

              {/* 막대 트랙 + 막대 */}
              <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                <div
                  className={`h-full rounded ${item.level ? BAR_CLASS[item.level] : 'bg-slate-200'}`}
                  style={{ width: `${widthPercent}%` }}
                  title={`${item.slot} · ${item.level} · ${item.count}건`}
                />
              </div>

              {/* 우측: 레벨 + 건수 */}
              <span className="w-20 shrink-0 text-right text-xs">
                {item.level && (
                  <span className={`font-medium ${TEXT_CLASS[item.level]}`}>{item.level}</span>
                )}
                <span className="ml-1 text-slate-400">{item.count}건</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> 여유
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> 보통
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" /> 혼잡
        </span>
      </div>
    </div>
  );
}
