'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
  search: '',
  category: '',
  sort: 'newest',
  minPrice: 0,
  maxPrice: 100000000,
  quickFilter: '',
};

const NL_PATTERNS = [
  { regex: /d[uư][oơ]́?i\s*([\d,.]+)\s*(tri[eệ]u|tr)/i, key: 'maxPrice', multiplier: 1000000 },
  { regex: /tr[eê]n\s*([\d,.]+)\s*(tri[eệ]u|tr)/i, key: 'minPrice', multiplier: 1000000 },
  { regex: /t[uư]̀?\s*([\d,.]+)\s*(tri[eệ]u|tr)\s*[đd][eế]n\s*([\d,.]+)\s*(tri[eệ]u|tr)/i, key: 'range', multiplier: 1000000 },
  { regex: /d[uư][oơ]́?i\s*([\d,.]+)\s*k/i, key: 'maxPrice', multiplier: 1000 },
  { regex: /gi[aả]m\s*gi[aá]/i, key: 'quickFilter', value: 'discount' },
  { regex: /b[aá]n\s*ch[aạ]y/i, key: 'quickFilter', value: 'popular' },
  { regex: /m[oớ]i\s*v[eề]/i, key: 'quickFilter', value: 'newest' },
];

const CATEGORY_KEYWORDS = {
  'laptop': 'Laptop',
  'điện thoại': 'Điện thoại',
  'phone': 'Điện thoại',
  'tai nghe': 'Tai nghe',
  'headphone': 'Tai nghe',
  'đồng hồ': 'Đồng hồ',
  'watch': 'Đồng hồ',
  'máy tính bảng': 'Máy tính bảng',
  'tablet': 'Máy tính bảng',
  'phụ kiện': 'Phụ kiện',
  'camera': 'Camera',
  'loa': 'Loa',
  'speaker': 'Loa',
  'bàn phím': 'Bàn phím',
  'chuột': 'Chuột',
  'keyboard': 'Bàn phím',
  'mouse': 'Chuột',
};

/**
 * Parse Vietnamese natural language query into structured filters.
 * Client-side only — no API call needed.
 */
function parseNLQuery(query, availableCategories = []) {
  if (!query || query.length < 3) return null;

  const lower = query.toLowerCase();
  const extracted = {};

  // Price extraction
  for (const pattern of NL_PATTERNS) {
    const match = lower.match(pattern.regex);
    if (!match) continue;

    if (pattern.key === 'range') {
      extracted.minPrice = parseFloat(match[1].replace(/,/g, '.')) * pattern.multiplier;
      extracted.maxPrice = parseFloat(match[3].replace(/,/g, '.')) * pattern.multiplier;
    } else if (pattern.key === 'quickFilter') {
      extracted.quickFilter = pattern.value;
    } else {
      const value = parseFloat(match[1].replace(/,/g, '.')) * pattern.multiplier;
      extracted[pattern.key] = value;
    }
  }

  // Category detection
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      // Verify category exists in available categories
      const match = availableCategories.find(
        (c) => c.toLowerCase() === category.toLowerCase()
      );
      if (match) {
        extracted.category = match;
      }
      break;
    }
  }

  // Remaining words become search keywords (strip price/category matches)
  let remaining = lower;
  for (const keyword of Object.keys(CATEGORY_KEYWORDS)) {
    remaining = remaining.replace(keyword, '');
  }
  remaining = remaining
    .replace(/d[uư][oơ]́?i\s*[\d,.]+\s*(tri[eệ]u|tr|k)/gi, '')
    .replace(/tr[eê]n\s*[\d,.]+\s*(tri[eệ]u|tr|k)/gi, '')
    .replace(/t[uư]̀?\s*[\d,.]+\s*(tri[eệ]u|tr)\s*[đd][eế]n\s*[\d,.]+\s*(tri[eệ]u|tr)/gi, '')
    .replace(/gi[aả]m\s*gi[aá]/gi, '')
    .replace(/b[aá]n\s*ch[aạ]y/gi, '')
    .replace(/m[oớ]i\s*v[eề]/gi, '')
    .replace(/tìm|tìm kiếm|cho|tôi|mua|quà|sinh nhật|phù hợp|làm|dưới|trên|màu/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (remaining.length > 1) {
    extracted.search = remaining;
  }

  return Object.keys(extracted).length > 0 ? extracted : null;
}

export default function useShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => {
    // Initialize from URL search params if available
    const initial = { ...DEFAULT_FILTERS };
    if (searchParams.get('category')) initial.category = searchParams.get('category');
    if (searchParams.get('search')) initial.search = searchParams.get('search');
    if (searchParams.get('sort')) initial.sort = searchParams.get('sort');
    if (searchParams.get('minPrice')) initial.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) initial.maxPrice = Number(searchParams.get('maxPrice'));
    return initial;
  });

  const [searchText, setSearchText] = useState(filters.search);
  const [sliderValue, setSliderValue] = useState([filters.minPrice, filters.maxPrice]);
  const [nlQuery, setNlQuery] = useState('');

  // Debounce search text → filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchText, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice < 100000000) params.set('maxPrice', String(filters.maxPrice));

    const queryString = params.toString();
    const newUrl = queryString ? `/shop?${queryString}` : '/shop';

    // Only replace if actually changed to avoid infinite loop
    if (typeof window !== 'undefined' && window.location.search !== `?${queryString}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters.category, filters.search, filters.sort, filters.minPrice, filters.maxPrice, router]);

  const handleFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }, []);

  const handlePriceCommit = useCallback(([minPrice, maxPrice]) => {
    setFilters((current) => ({ ...current, minPrice, maxPrice, page: 1 }));
  }, []);

  const handleQuickFilter = useCallback((value) => {
    setFilters((current) => {
      const nextValue = current.quickFilter === value ? '' : value;
      const updates = { quickFilter: nextValue, page: 1 };

      if (value === 'popular') updates.sort = nextValue ? 'popular' : 'newest';
      if (value === 'newest') updates.sort = 'newest';

      return { ...current, ...updates };
    });
  }, []);

  const handleNLSearch = useCallback((query, availableCategories) => {
    const parsed = parseNLQuery(query, availableCategories);
    if (!parsed) {
      // Fall back to regular text search
      setSearchText(query);
      return;
    }

    setFilters((current) => ({
      ...current,
      ...parsed,
      page: 1,
    }));
    setNlQuery(query);

    if (parsed.minPrice || parsed.maxPrice) {
      setSliderValue([
        parsed.minPrice || DEFAULT_FILTERS.minPrice,
        parsed.maxPrice || DEFAULT_FILTERS.maxPrice,
      ]);
    }
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchText('');
    setSliderValue([DEFAULT_FILTERS.minPrice, DEFAULT_FILTERS.maxPrice]);
    setNlQuery('');
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.search) count++;
    if (filters.quickFilter) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 100000000) count++;
    if (filters.sort !== 'newest') count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilters,
    searchText,
    setSearchText,
    sliderValue,
    setSliderValue,
    nlQuery,
    handleFilter,
    handlePriceCommit,
    handleQuickFilter,
    handleNLSearch,
    handleReset,
    activeFilterCount,
    hasActiveFilters,
    DEFAULT_FILTERS,
  };
}
