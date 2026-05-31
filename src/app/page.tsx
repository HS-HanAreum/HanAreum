'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/places/SearchBar';
import CategoryTabs, { CATEGORIES, type CategoryId } from '@/components/places/CategoryTabs';
import FilterChips, { type SortId } from '@/components/places/FilterChips';
import PlaceList from '@/components/places/PlaceList';
import Pagination from '@/components/places/Pagination';
import type { Place, PlaceSearchResult } from '@/types/place';

// 한성대학교 중심 좌표 (검색 기준점이자 거리 계산 기준)
const HANSUNG_UNIV = { lat: 37.5826, lng: 127.0103 };
const SEARCH_RADIUS = 2000; // 검색 반경(m)
const UI_PAGE_SIZE = 6; // 한 화면에 보여줄 카드 수 (3 x 2 그리드)
const ALL_CATEGORY_CODE = 'FD6'; // '전체'일 때 사용할 Kakao 카테고리(음식점)

// 키워드 검색 또는 카테고리 검색 중 하나
type SearchSpec = { keyword: string } | { category: string };

function categoryKeyword(categoryId: CategoryId): string {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  return category && category.id !== 'all' ? category.keyword : '';
}

// 검색창/카테고리 상태로 실제 검색 방식을 정한다.
// '전체' + 검색어 없음 = 카테고리 검색(음식점), 그 외 = 키워드 검색.
function buildSpec(query: string, categoryId: CategoryId): SearchSpec {
  if (categoryId !== 'all') {
    return { keyword: categoryKeyword(categoryId) };
  }
  const keyword = query.trim();
  return keyword ? { keyword } : { category: ALL_CATEGORY_CODE };
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('all');
  const [sort, setSort] = useState<SortId>('distance');
  const [allPlaces, setAllPlaces] = useState<Place[]>([]); // 한 검색의 전체 결과 풀(거리순)
  const [uiPage, setUiPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // 영역 분할(deep) 검색: 한 번 호출로 거리순 정렬된 결과 풀을 모두 받아온다 (45개 초과 가능)
  async function runSearch(spec: SearchSpec) {
    setLoading(true);
    setError(null);
    setUiPage(1);
    try {
      const params = new URLSearchParams({
        deep: '1',
        x: String(HANSUNG_UNIV.lng),
        y: String(HANSUNG_UNIV.lat),
        radius: String(SEARCH_RADIUS),
      });
      if ('keyword' in spec) {
        params.set('query', spec.keyword);
      } else {
        params.set('category', spec.category);
      }

      const res = await fetch(`/api/places/search?${params.toString()}`);
      if (!res.ok) throw new Error('검색 실패');
      const data: PlaceSearchResult = await res.json();
      setAllPlaces(data.places);
    } catch {
      setError('장소를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      setAllPlaces([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  // 첫 진입 시 '전체'(주변 음식점)를 자동으로 보여준다
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSearch(buildSpec('', 'all'));
  }, []);

  // 검색창 검색은 카테고리를 '전체'로 되돌리고 입력한 키워드로만 검색한다
  function handleSearchSubmit() {
    setCategoryId('all');
    runSearch(buildSpec(query, 'all'));
  }

  // 카테고리 선택은 검색창을 비우고 카테고리 기준으로만 검색한다 (둘을 합치지 않는다)
  function handleCategorySelect(id: CategoryId) {
    setCategoryId(id);
    setQuery('');
    runSearch(buildSpec('', id));
  }

  // 영역 분할 검색은 거리순으로 받아오므로 정렬 칩 변경은 화면 강조만 바꾼다
  function handleSortSelect(id: SortId) {
    setSort(id);
  }

  // 페이지 이동은 이미 받아온 결과를 잘라 보여주기만 한다 (추가 요청 없음)
  function handlePageChange(nextPage: number) {
    setUiPage(nextPage);
  }

  const visiblePlaces = allPlaces.slice((uiPage - 1) * UI_PAGE_SIZE, uiPage * UI_PAGE_SIZE);
  const totalPages = Math.ceil(allPlaces.length / UI_PAGE_SIZE);
  const countLabel =
    searched && !loading && !error && allPlaces.length > 0
      ? `총 ${allPlaces.length}개의 장소`
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* 검색 + 카테고리 + 필터 + 장소 리스트 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleSearchSubmit} />

          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">카테고리</h2>
            <CategoryTabs selected={categoryId} onSelect={handleCategorySelect} />
          </div>

          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">필터</h2>
            <FilterChips selected={sort} onSelect={handleSortSelect} countLabel={countLabel} />
          </div>

          <div className="mt-5">
            <PlaceList places={visiblePlaces} loading={loading} error={error} searched={searched} />
          </div>

          {searched && !loading && !error && totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={uiPage} totalPages={totalPages} onChange={handlePageChange} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
