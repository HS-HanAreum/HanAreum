import type { ReviewCongestion } from '@/types/review';
import type { CongestionSlot } from '@/lib/placeMeta';

// 시간대별 혼잡도 막대그래프. 차트 라이브러리 없이 Tailwind 만으로 그린다 (AGENTS §5).
// 데이터는 이 장소 리뷰들의 (방문 시간대 × 체감 혼잡도) 평균.

interface CongestionChartProps {
  data: CongestionSlot[];
}

// 혼잡도별 막대 색 (혼잡도 태그 색과 통일: 여유=초록, 보통=노랑, 혼잡=빨강).
const BAR_CLASS: Record<ReviewCongestion, string> = {
  여유: 'bg-[#86EFAC]',
  보통: 'bg-[#FDE68A]',
  혼잡: 'bg-[#FCA5A5]',
};

// 시간대 라벨에서 시작 시각만 보여준다 ('08-10시' -> '08').
function slotStart(slot: string): string {
  return slot.split('-')[0] ?? slot;
}

export default function CongestionChart({ data }: CongestionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // 리뷰에 시간대+혼잡도 정보가 하나도 없으면 안내 문구만 보여준다.
  if (total === 0) {
    return <p className="text-sm text-slate-400">아직 시간대별 혼잡도 정보가 없어요.</p>;
  }

  return (
    <div>
      {/* 세로 막대: 높이는 평균 혼잡도(1~3) 비율, 색은 평균 단계 */}
      <div className="flex items-end justify-between gap-1" style={{ height: 96 }}>
        {data.map((item) => {
          // 점수 1~3 을 높이 비율로 (최소 점수도 보이게 8% 부터).
          const heightPercent = item.count > 0 ? 8 + ((item.score - 1) / 2) * 92 : 0;
          return (
            <div key={item.slot} className="flex flex-1 flex-col items-center justify-end gap-1">
              {item.count > 0 ? (
                <div
                  className={`w-full rounded-t ${item.level ? BAR_CLASS[item.level] : 'bg-slate-200'}`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${item.slot} · ${item.level} · ${item.count}건`}
                />
              ) : (
                // 데이터 없는 시간대는 바닥에 옅은 점선 막대만
                <div className="w-full rounded-t border border-dashed border-slate-200" style={{ height: 4 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 시간축 라벨 (시작 시각만) */}
      <div className="mt-1 flex justify-between gap-1">
        {data.map((item) => (
          <span key={item.slot} className="flex-1 text-center text-[10px] text-slate-400">
            {slotStart(item.slot)}
          </span>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#86EFAC]" /> 여유
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#FDE68A]" /> 보통
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#FCA5A5]" /> 혼잡
        </span>
      </div>
    </div>
  );
}
