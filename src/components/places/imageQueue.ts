// 장소 카드 이미지 요청 동시 실행 제한 큐 (클라이언트 전용).
// 검색 결과 카드(최대 15개)가 마운트되며 한꺼번에 이미지 요청을 보내면
// Naver API rate limit(429)에 걸린다. 동시에 실행되는 요청 수를 제한해 천천히 내보낸다.

// 동시에 실행할 수 있는 이미지 요청 최대 개수. 너무 크면 429, 너무 작으면 이미지가 느리게 뜬다.
const MAX_CONCURRENT_IMAGE_REQUESTS = 3;

let active = 0;
const waiting: Array<() => void> = [];

// 자리가 비어 있으면 대기 중인 작업을 하나 꺼내 실행한다.
function pump() {
  if (active >= MAX_CONCURRENT_IMAGE_REQUESTS) return;
  const run = waiting.shift();
  if (!run) return;
  active += 1;
  run();
}

// task 실행을 큐에 넣는다. 자리가 나면 실행되고, 끝나면(성공/실패 무관) 다음 작업을 깨운다.
// 이미 abort된 요청은 fetch가 곧바로 실패하며 자리를 비워, 화면에서 사라진 카드가 줄을 막지 않는다.
export function runWithImageLimit<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    waiting.push(() => {
      task()
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          pump();
        });
    });
    pump();
  });
}
