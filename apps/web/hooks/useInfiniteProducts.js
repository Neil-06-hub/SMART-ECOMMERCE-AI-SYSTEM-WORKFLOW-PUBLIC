'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { productAPI } from '@/lib/api';

const MILESTONE_INTERVAL = 20; // Insert milestone every N products

const MILESTONE_MESSAGES = [
  {
    icon: '🏷️',
    title: 'Bạn đã xem hết sản phẩm giảm giá',
    description: 'Dưới đây là các mẫu mới nhất phù hợp với bạn.',
    cta: null,
  },
  {
    icon: '🤖',
    title: 'AI nhận thấy bạn quan tâm danh mục này',
    description: 'Hãy thử xem thêm phụ kiện liên quan để hoàn thiện bộ sưu tập.',
    cta: 'Xem phụ kiện →',
  },
  {
    icon: '📊',
    title: 'Điểm giữa catalog',
    description: 'Sản phẩm từ đây ít được xem bởi người có hồ sơ tương tự bạn.',
    cta: null,
  },
  {
    icon: '💡',
    title: 'Mẹo: Thêm vào yêu thích',
    description: 'Lưu sản phẩm thú vị vào wishlist giúp AI hiểu gu của bạn chính xác hơn.',
    cta: null,
  },
  {
    icon: '🎯',
    title: 'Bạn đang duyệt rất kỹ!',
    description: 'Nếu cần tư vấn, hãy mở AI Concierge bên phải để được gợi ý cá nhân hóa.',
    cta: 'Mở AI Concierge →',
  },
];

export default function useInfiniteProducts(filters, quickFilter) {
  const sentinelRef = useRef(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['products-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productAPI.getAll({ ...filters, page: pageParam });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // IntersectionObserver for infinite scroll trigger
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten pages → products + insert milestones
  const { products, totalProducts } = useMemo(() => {
    if (!data?.pages) return { products: [], totalProducts: 0 };

    let allProducts = data.pages.flatMap((page) => page.products || []);

    // Apply client-side quick filter
    if (quickFilter === 'discount') {
      allProducts = allProducts.filter((p) => p.originalPrice > p.price);
    }

    const total = quickFilter === 'discount'
      ? allProducts.length
      : data.pages[0]?.pagination?.total || allProducts.length;

    return { products: allProducts, totalProducts: total };
  }, [data, quickFilter]);

  // Build items list with milestones inserted
  const itemsWithMilestones = useMemo(() => {
    const items = [];
    let milestoneIndex = 0;

    products.forEach((product, index) => {
      items.push({ type: 'product', data: product, key: product._id });

      // Insert milestone after every MILESTONE_INTERVAL products
      if (
        (index + 1) % MILESTONE_INTERVAL === 0 &&
        index < products.length - 1
      ) {
        const milestone = MILESTONE_MESSAGES[milestoneIndex % MILESTONE_MESSAGES.length];
        items.push({
          type: 'milestone',
          data: milestone,
          key: `milestone-${index}`,
        });
        milestoneIndex++;
      }
    });

    return items;
  }, [products]);

  const isEmpty = !isLoading && products.length === 0;
  const isReachingEnd = !hasNextPage && products.length > 0;

  return {
    products,
    itemsWithMilestones,
    totalProducts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isEmpty,
    isReachingEnd,
    sentinelRef,
    fetchNextPage,
  };
}
