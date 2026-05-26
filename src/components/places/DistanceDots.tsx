export type DistanceLevel = 1 | 2 | 3;

// 거리(m)를 3단계로 변환: 3 = 가까움, 2 = 보통, 1 = 멀음
export function distanceLevel(distance: number | null): DistanceLevel {
  if (distance === null) return 1;
  if (distance <= 400) return 3;
  if (distance <= 900) return 2;
  return 1;
}

// 거리(m)를 보기 좋은 문자열로 변환
export function distanceLabel(distance: number | null): string {
  if (distance === null) return '';
  if (distance >= 1000) return `${(distance / 1000).toFixed(1)}km`;
  return `${distance}m`;
}

interface DistanceDotsProps {
  level: DistanceLevel;
}

export default function DistanceDots({ level }: DistanceDotsProps) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={`h-1.5 w-1.5 rounded-full ${dot <= level ? 'bg-blue-500' : 'bg-slate-200'}`}
        />
      ))}
    </span>
  );
}
