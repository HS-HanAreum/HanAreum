'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import RouteMap from '@/components/routes/RouteMap';
import type { Place, PlaceSearchResult } from '@/types/place';
import type { RoutePlace, SavedRoute } from '@/types/route';

// 나만의 동선 만들기 페이지.
// 장소 검색은 프론트 → /api/places/search → Kakao Local API 흐름만 사용한다(키는 서버에만 둔다).
// 지도는 실제 Kakao 지도이며, 연결선(Polyline)은 길찾기 경로가 아니라 좌표를 순서대로 잇는 MVP 표시용이다.
// 저장은 아직 localStorage 만 사용한다(Supabase 저장은 이번 작업 범위 아님).

// 한성대학교 중심 좌표 (검색 기준점이자 지도 기본 중심)
const HANSUNG_UNIV = { lat: 37.5826, lng: 127.0103 };
const SEARCH_RADIUS = 2000; // 검색 반경(m)
const SEARCH_SIZE = 15; // 검색 결과 개수(가까운 순)

// localStorage 저장 키. 다른 기능과 겹치지 않도록 접두어를 붙인다.
const STORAGE_KEY = 'hanareum.routes';

// 동선 이름 기본값
const DEFAULT_ROUTE_NAME = '공강 시간 카페 코스';

// 카테고리 필터 버튼. '전체'는 검색창 키워드를 그대로 쓰고, 나머지는 고정 키워드로 검색한다.
const CATEGORIES = ['전체', '맛집', '카페', '서점', '스터디'] as const;
type CategoryLabel = (typeof CATEGORIES)[number];
const CATEGORY_KEYWORDS: Record<CategoryLabel, string> = {
  전체: '',
  맛집: '맛집',
  카페: '카페',
  서점: '서점',
  스터디: '스터디카페',
};

// Kakao 검색 결과(Place)에서 동선 저장에 필요한 필드만 추린다.
function toRoutePlace(place: Place): RoutePlace {
  return {
    provider: 'kakao',
    providerPlaceId: place.providerPlaceId,
    name: place.name,
    address: place.address,
    category: place.category,
    lat: place.lat,
    lng: place.lng,
    placeUrl: place.placeUrl,
  };
}

// 공유 링크/localStorage 로 들어온 장소가 동선 장소 형태인지 검증한다(좌표는 실제 숫자여야 함).
function isValidRoutePlace(value: unknown): value is RoutePlace {
  if (typeof value !== 'object' || value === null) return false;
  const place = value as Record<string, unknown>;
  return (
    typeof place.providerPlaceId === 'string' &&
    typeof place.name === 'string' &&
    typeof place.lat === 'number' &&
    typeof place.lng === 'number' &&
    Number.isFinite(place.lat) &&
    Number.isFinite(place.lng)
  );
}

// 검증을 통과한 장소를 RoutePlace 로 정규화한다(누락 필드는 기본값으로 채운다).
function normalizeRoutePlace(place: RoutePlace): RoutePlace {
  return {
    provider: 'kakao',
    providerPlaceId: place.providerPlaceId,
    name: place.name,
    address: place.address ?? '',
    category: place.category ?? '',
    lat: place.lat,
    lng: place.lng,
    placeUrl: place.placeUrl ?? '',
  };
}

export default function RoutesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryLabel>('전체');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null); // 빈 검색어 안내 / 검색 실패 안내
  const [searched, setSearched] = useState(false); // 한 번이라도 검색을 실행했는지
  const [selectedPlaces, setSelectedPlaces] = useState<RoutePlace[]>([]);
  const [routeName, setRouteName] = useState(DEFAULT_ROUTE_NAME);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharedNotice, setSharedNotice] = useState(false);
  const [loaded, setLoaded] = useState(false); // localStorage 로딩 완료 여부
  const [editingId, setEditingId] = useState<string | null>(null); // 수정 중인 저장 동선 id (null 이면 일반 모드)

  // 첫 진입 시: 저장된 동선을 불러오고, 공유 링크로 들어온 경우 동선을 자동으로 반영/저장한다.
  // 마운트 시 localStorage/URL(브라우저 전용 외부 상태)을 한 번 읽어 초기화하는 용도라
  // effect 안에서 setState 가 필요하다. (SSR 에서는 접근 불가라 lazy 초기화로 대체할 수 없음)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let initialSaved: SavedRoute[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) initialSaved = JSON.parse(raw) as SavedRoute[];
    } catch {
      initialSaved = [];
    }

    // 공유 링크 query string 읽기 (?route=<URL 인코딩된 JSON>)
    // 실제 Kakao 장소는 id 만으로 복원할 수 없어 장소 정보를 통째로 직렬화해 담는다.
    const params = new URLSearchParams(window.location.search);
    const routeParam = params.get('route');
    if (routeParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(routeParam)) as {
          name?: string;
          places?: unknown[];
        };
        const places = (decoded.places ?? [])
          .filter(isValidRoutePlace)
          .map(normalizeRoutePlace);

        if (places.length > 0) {
          const sharedName = decoded.name?.trim() || '공유받은 동선';
          setSelectedPlaces(places);
          setRouteName(sharedName);
          setSharedNotice(true);

          // 같은 공유 동선이 아직 없으면 저장된 동선에 자동 추가 (중복 추가 방지)
          const sharedId = `shared-${places.map((place) => place.providerPlaceId).join('-')}`;
          if (!initialSaved.some((route) => route.id === sharedId)) {
            initialSaved = [{ id: sharedId, name: sharedName, places }, ...initialSaved];
          }
        }
      } catch {
        // 잘못된 공유 링크는 무시한다
      }
    }

    setSavedRoutes(initialSaved);
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 저장된 동선이 바뀔 때마다 localStorage 에 저장한다 (첫 로딩 전에는 덮어쓰지 않는다).
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoutes));
  }, [savedRoutes, loaded]);

  // 키워드로 한성대 주변 장소를 검색한다 (프론트 → /api/places/search → Kakao Local API).
  async function runSearch(keyword: string) {
    if (!keyword) {
      setSearchError('검색어를 입력해주세요.');
      setSearchResults([]);
      setSearched(false);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams({
        query: keyword,
        x: String(HANSUNG_UNIV.lng),
        y: String(HANSUNG_UNIV.lat),
        radius: String(SEARCH_RADIUS),
        size: String(SEARCH_SIZE),
        sort: 'distance',
      });
      const res = await fetch(`/api/places/search?${params.toString()}`);
      if (!res.ok) throw new Error('검색 실패');
      const data: PlaceSearchResult = await res.json();
      setSearchResults(data.places);
      setSearched(true);
    } catch {
      setSearchError('장소 검색에 실패했습니다.');
      setSearchResults([]);
      setSearched(false);
    } finally {
      setSearchLoading(false);
    }
  }

  // 검색창에서 검색(엔터/버튼): 카테고리를 '전체'로 되돌리고 입력한 키워드로 검색한다.
  function handleSearchSubmit() {
    setCategory('전체');
    runSearch(query.trim());
  }

  // 카테고리 클릭: '전체'면 검색창 키워드로, 나머지는 고정 키워드로 검색한다.
  function handleCategorySelect(label: CategoryLabel) {
    setCategory(label);
    if (label === '전체') {
      const keyword = query.trim();
      if (keyword) {
        runSearch(keyword);
      } else {
        setSearchResults([]);
        setSearched(false);
        setSearchError(null);
      }
      return;
    }
    setQuery('');
    runSearch(CATEGORY_KEYWORDS[label]);
  }

  // 장소를 동선에 추가한다 (이미 담긴 장소는 중복 추가하지 않는다).
  function handleAddPlace(place: Place) {
    setSelectedPlaces((prev) =>
      prev.some((item) => item.providerPlaceId === place.providerPlaceId)
        ? prev
        : [...prev, toRoutePlace(place)],
    );
    setShareUrl(''); // 동선이 바뀌면 이전 공유 링크는 무효화
  }

  function handleRemovePlace(providerPlaceId: string) {
    setSelectedPlaces((prev) => prev.filter((place) => place.providerPlaceId !== providerPlaceId));
    setShareUrl('');
  }

  // 현재 동선 이름(공백이면 기본값)
  function currentRouteName() {
    return routeName.trim() || '이름 없는 동선';
  }

  // [동선 추가하기] 현재 선택한 동선을 새 동선으로 저장한다. 기존 동선은 그대로 둔다.
  // 수정 모드 여부와 관계없이 항상 새 id 로 추가하므로 중복 저장되지 않는다.
  function handleAddRoute() {
    if (selectedPlaces.length < 2) {
      alert('동선을 저장하려면 장소를 2개 이상 선택해야 합니다.');
      return;
    }
    const route: SavedRoute = {
      id: `route-${Date.now()}`,
      name: currentRouteName(),
      places: selectedPlaces,
    };
    setSavedRoutes((prev) => [route, ...prev]);
  }

  // [수정 완료] 수정 모드에서 기존 동선(editingId)을 현재 선택 내용으로 덮어쓴다.
  // 같은 id 를 유지하며 내용만 교체하므로 동선이 중복으로 늘어나지 않는다.
  function handleUpdate() {
    if (editingId === null) return;
    if (selectedPlaces.length < 2) {
      alert('동선을 저장하려면 장소를 2개 이상 선택해야 합니다.');
      return;
    }
    const updatedName = currentRouteName();
    setSavedRoutes((prev) =>
      prev.map((route) =>
        route.id === editingId ? { ...route, name: updatedName, places: selectedPlaces } : route,
      ),
    );
    setEditingId(null);
  }

  // 저장된 동선 카드를 클릭하면 그 동선을 선택 영역으로 불러오고 수정 모드로 전환한다.
  function handleLoadRoute(route: SavedRoute) {
    setSelectedPlaces(route.places ?? []);
    setRouteName(route.name);
    setEditingId(route.id);
    setShareUrl('');
    setSharedNotice(false);
  }

  // [삭제] confirm 후 해당 동선을 목록에서 제거한다. 수정 중이던 동선이면 수정 모드도 해제.
  function handleDelete(id: string) {
    if (!window.confirm('이 동선을 삭제하시겠습니까?')) return;
    setSavedRoutes((prev) => prev.filter((route) => route.id !== id));
    if (editingId === id) setEditingId(null);
  }

  // [수정 취소] 저장된 데이터는 건드리지 않고 수정 모드만 해제한다 (현재 선택 상태는 유지).
  function handleCancelEdit() {
    setEditingId(null);
  }

  // 공유 링크(query string)를 만든다. 장소 2개 미만이면 안내 후 중단.
  // 실제 Kakao 장소는 id 만으로 복원할 수 없어 장소 정보를 통째로 직렬화해 담는다.
  function handleShare() {
    if (selectedPlaces.length < 2) {
      alert('동선을 공유하려면 장소를 2개 이상 선택해야 합니다.');
      return;
    }
    const payload = {
      name: routeName.trim() || '이름 없는 동선',
      places: selectedPlaces,
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    setShareUrl(`${window.location.origin}/routes?route=${encoded}`);
    setCopied(false);
  }

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  // "음식점 > 카페 > 디저트카페" 처럼 긴 분류에서 마지막 항목만 짧게 보여준다
  function shortCategory(value: string): string {
    const parts = value
      .split('>')
      .map((part) => part.trim())
      .filter(Boolean);
    return parts[parts.length - 1] ?? value;
  }

  const summary = selectedPlaces.map((place) => place.name).join(' → ');
  const isEditing = editingId !== null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <Link href="/" className="text-sm text-[#64748B] hover:text-[#3B82F6]">
          ← 홈으로
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-[#0F172A]">
          HanAreum <span className="text-[#94A3B8]">/</span> 나만의 동선
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          한성대 주변 장소를 검색해 순서대로 담고, 나만의 동선을 저장하거나 공유 링크를 만들어보세요.
        </p>

        {/* 공유 링크로 접속했을 때 안내 */}
        {sharedNotice && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#3B82F6] bg-[#B6EEFF]/40 px-4 py-3 text-sm text-[#0F172A]">
            <span>공유받은 동선이 저장된 동선에 추가되었습니다.</span>
            <button
              type="button"
              onClick={() => setSharedNotice(false)}
              className="shrink-0 text-[#64748B] hover:text-[#0F172A]"
              aria-label="안내 닫기"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* 1. 왼쪽: 장소 검색 */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-base font-bold text-[#0F172A]">장소 검색</h2>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSearchSubmit();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="장소 · 카테고리 검색 (예: 카페, 맛집, 한성대)"
                className="min-w-0 flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f6fd6]"
              >
                검색
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleCategorySelect(item)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    category === item
                      ? 'bg-[#3B82F6] text-white'
                      : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#3B82F6]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {searchLoading ? (
                <p className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-6 text-center text-sm text-[#94A3B8]">
                  검색 중...
                </p>
              ) : searchError ? (
                <p className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-6 text-center text-sm text-[#94A3B8]">
                  {searchError}
                </p>
              ) : searched && searchResults.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-6 text-center text-sm text-[#94A3B8]">
                  검색 결과가 없습니다.
                </p>
              ) : !searched ? (
                <p className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-6 text-center text-sm text-[#94A3B8]">
                  장소를 검색해 동선에 담아보세요.
                </p>
              ) : (
                searchResults.map((place) => {
                  const isSelected = selectedPlaces.some(
                    (item) => item.providerPlaceId === place.providerPlaceId,
                  );
                  return (
                    <button
                      key={place.providerPlaceId}
                      type="button"
                      onClick={() => handleAddPlace(place)}
                      disabled={isSelected}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-[#E2E8F0] bg-[#F8FAFC] opacity-70'
                          : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#0F172A]">{place.name}</p>
                        <p className="mt-0.5 truncate text-xs text-[#64748B]">{place.address}</p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          isSelected ? 'text-[#64748B]' : 'text-[#3B82F6]'
                        }`}
                      >
                        {isSelected ? '추가됨' : '+ 추가'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* 오른쪽: 지도 + (선택한 동선 / 저장된 동선) */}
          <div className="flex flex-col gap-6">
            {/* 2. 오른쪽 위: 실제 Kakao 지도 */}
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0F172A]">지도</h2>
                <span className="text-xs text-[#94A3B8]">직선 연결 · 실제 경로 아님</span>
              </div>

              <div className="relative mt-3 h-72 w-full overflow-hidden rounded-xl border border-[#E2E8F0]">
                <RouteMap center={HANSUNG_UNIV} places={selectedPlaces} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 3. 오른쪽 아래 왼쪽: 선택한 동선 */}
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <h2 className="text-base font-bold text-[#0F172A]">선택한 동선</h2>

                {/* 수정 모드 안내 */}
                {isEditing && (
                  <div className="mt-3 rounded-lg border border-[#3B82F6] bg-[#B6EEFF]/30 px-3 py-2 text-xs font-medium text-[#0F172A]">
                    수정 중인 동선: {currentRouteName()}
                  </div>
                )}

                <label className="mt-3 block text-xs font-medium text-[#64748B]">동선 이름</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(event) => setRouteName(event.target.value)}
                  placeholder="동선 이름을 입력하세요"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none"
                />

                {selectedPlaces.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center text-sm text-[#94A3B8]">
                    왼쪽에서 장소를 선택해 동선을 만들어보세요.
                  </p>
                ) : (
                  <ol className="mt-4 flex flex-col gap-2">
                    {selectedPlaces.map((place, index) => (
                      <li
                        key={place.providerPlaceId}
                        className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-2.5"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#0F172A]">{place.name}</p>
                          <p className="truncate text-xs text-[#64748B]">
                            {shortCategory(place.category)} · {place.address}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePlace(place.providerPlaceId)}
                          className="shrink-0 rounded px-2 py-1 text-xs text-[#64748B] hover:text-red-500"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ol>
                )}

                {/* 현재 동선 요약 */}
                {selectedPlaces.length > 0 && (
                  <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3">
                    <p className="text-xs font-medium text-[#64748B]">현재 동선</p>
                    <p className="mt-1 text-sm text-[#0F172A]">{summary}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* 수정 모드일 때만: 수정 완료 (기존 동선 덮어쓰기) */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="min-w-[120px] flex-1 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f6fd6]"
                    >
                      수정 완료
                    </button>
                  )}

                  {/* 항상: 동선 추가하기 (현재 선택을 새 동선으로 저장) */}
                  <button
                    type="button"
                    onClick={handleAddRoute}
                    className={`min-w-[120px] flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
                      isEditing
                        ? 'border border-[#3B82F6] bg-white text-[#3B82F6] hover:bg-[#B6EEFF]/30'
                        : 'bg-[#3B82F6] text-white hover:bg-[#2f6fd6]'
                    }`}
                  >
                    동선 추가하기
                  </button>

                  {/* 항상: 동선 추천 (공유 링크 생성) */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="min-w-[120px] flex-1 rounded-lg border border-[#3B82F6] bg-white px-4 py-2 text-sm font-medium text-[#3B82F6] hover:bg-[#B6EEFF]/30"
                  >
                    동선 추천
                  </button>

                  {/* 수정 모드일 때만: 수정 취소 (저장 데이터는 그대로, 수정 모드만 해제) */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="min-w-[120px] flex-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#64748B] hover:border-[#94A3B8]"
                    >
                      수정 취소
                    </button>
                  )}
                </div>

                {/* 공유 링크 */}
                {shareUrl && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-[#64748B]">공유 링크</p>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="min-w-0 flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="shrink-0 rounded-lg bg-[#3B82F6] px-3 py-2 text-xs font-medium text-white hover:bg-[#2f6fd6]"
                      >
                        {copied ? '복사됨' : '복사'}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* 4. 오른쪽 아래 오른쪽: 저장된 동선 */}
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <h2 className="text-base font-bold text-[#0F172A]">저장된 동선</h2>

                <div className="mt-3 flex flex-col gap-2">
                  {!loaded ? (
                    <p className="text-sm text-[#94A3B8]">불러오는 중...</p>
                  ) : savedRoutes.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center text-sm text-[#94A3B8]">
                      아직 저장된 동선이 없습니다.
                    </p>
                  ) : (
                    savedRoutes.map((route) => (
                      <div
                        key={route.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleLoadRoute(route)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleLoadRoute(route);
                          }
                        }}
                        className={`cursor-pointer rounded-xl border bg-white p-3 text-left transition-colors hover:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] ${
                          editingId === route.id ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-[#E2E8F0]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#0F172A]">{route.name}</p>
                            <p className="mt-1 text-xs text-[#64748B]">
                              {(route.places ?? []).map((place) => place.name).join(' → ')}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation(); // 카드 클릭(불러오기)이 함께 실행되지 않도록 전파 차단
                              handleDelete(route.id);
                            }}
                            className="shrink-0 rounded px-2 py-1 text-xs text-[#64748B] hover:text-red-500"
                          >
                            삭제
                          </button>
                        </div>
                        {editingId === route.id && (
                          <span className="mt-2 inline-block rounded-full bg-[#B6EEFF]/50 px-2 py-0.5 text-[10px] font-medium text-[#3B82F6]">
                            수정 중
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
