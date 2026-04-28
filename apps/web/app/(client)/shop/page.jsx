'use client';

import { Suspense, useState } from 'react';
import { App, Col, Row, Tag, Typography } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { aiAPI, productAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';
import { MoodProvider, useMood } from '@/hooks/useMoodEngine';
import useShopFilters from '@/hooks/useShopFilters';
import useInfiniteProducts from '@/hooks/useInfiniteProducts';

import ShopHero from '@/components/shop/ShopHero';
import FilterSheet from '@/components/shop/FilterSheet';
import ProductCarousel from '@/components/shop/ProductCarousel';
import ProductInfiniteList from '@/components/shop/ProductInfiniteList';
import AIConciergePanel from '@/components/shop/AIConciergePanel';
import MoodIndicator from '@/components/shop/MoodIndicator';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const { Text } = Typography;

function ShopContent() {
  const router = useRouter();
  const { message } = App.useApp();
  const { isAuthenticated } = useAuthStore();
  const { mood } = useMood();

  // Filter state
  const {
    filters,
    searchText,
    setSearchText,
    sliderValue,
    setSliderValue,
    handleFilter,
    handlePriceCommit,
    handleQuickFilter,
    handleNLSearch,
    handleReset,
    activeFilterCount,
    hasActiveFilters,
  } = useShopFilters();

  // UI state
  const [filterOpen, setFilterOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Data queries
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productAPI.getCategories().then((r) => r.data.categories),
  });

  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productAPI.getFeatured().then((r) => r.data),
    staleTime: 120000,
  });

  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-recommendations-shop'],
    queryFn: () => aiAPI.getRecommendations().then((r) => r.data),
    enabled: isAuthenticated && aiEnabled,
    staleTime: 60000,
  });

  // Infinite scroll products
  const {
    products,
    itemsWithMilestones,
    totalProducts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isEmpty,
    isReachingEnd,
    sentinelRef,
  } = useInfiniteProducts(filters, filters.quickFilter);

  const aiProducts = aiData?.products || [];
  const aiSource = aiData?.meta?.source || aiData?.source || 'model';
  const featuredProducts = featuredData?.products || [];

  const handleNL = (query) => {
    handleNLSearch(query, categoriesData || []);
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '32px 24px 56px' }}>
      <div className="container" style={{ maxWidth: 1440 }}>
        {/* Hero + NL Search */}
        <ShopHero
          totalProducts={totalProducts}
          aiCount={aiEnabled && isAuthenticated ? aiProducts.length : 0}
          isLoading={isLoading}
          onNLSearch={handleNL}
          onSearch={setSearchText}
          searchText={searchText}
        />

        {/* Sticky Toolbar — Filter trigger + Search + Active filters + Mood */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            position: 'sticky',
            top: 88,
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 28,
            padding: '12px 20px',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Filter trigger button */}
            <button
              type="button"
              className={`filter-chip ${hasActiveFilters ? 'active' : ''}`}
              onClick={() => setFilterOpen(true)}
              style={{ height: 44 }}
            >
              <FilterOutlined />
              <span className="hide-mobile">Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span style={{
                  background: hasActiveFilters ? 'rgba(255,255,255,0.3)' : 'var(--mood-accent)',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 999,
                  minWidth: 18,
                  textAlign: 'center',
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Integrated Search Bar */}
          <div style={{ flex: 1, maxWidth: 500, position: 'relative' }}>
            <SearchOutlined style={{ 
              position: 'absolute', 
              left: 14, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)', 
              fontSize: 15,
              zIndex: 1 
            }} />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="sticky-search-input"
              style={{
                width: '100%',
                height: 44,
                padding: '0 16px 0 42px',
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.06)',
                background: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="hide-mobile">
              <MoodIndicator />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--mood-accent-soft)',
                  border: 'none',
                  color: 'var(--mood-accent)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 12,
                  transition: 'all 0.2s',
                }}
              >
                Đặt lại
              </button>
            )}
          </div>
        </motion.div>

        {/* Active Filter Tags — Shown below the sticky bar */}
        {hasActiveFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, overflow: 'hidden' }}
          >
            {filters.category && (
              <Tag
                closable
                color="orange"
                onClose={() => handleFilter('category', '')}
                style={{ borderRadius: 999, margin: 0, padding: '4px 12px' }}
              >
                Danh mục: {filters.category}
              </Tag>
            )}
            {filters.quickFilter && (
              <Tag
                closable
                color="gold"
                onClose={() => handleQuickFilter(filters.quickFilter)}
                style={{ borderRadius: 999, margin: 0, padding: '4px 12px' }}
              >
                {filters.quickFilter === 'discount' ? '🏷️ Giảm giá' :
                 filters.quickFilter === 'popular' ? '🔥 Bán chạy' : '✨ Mới về'}
              </Tag>
            )}
            {filters.search && (
              <Tag
                closable
                color="blue"
                onClose={() => { setSearchText(''); handleFilter('search', ''); }}
                style={{ borderRadius: 999, margin: 0, padding: '4px 12px' }}
              >
                <SearchOutlined /> {filters.search}
              </Tag>
            )}
            {activeFilterCount > 0 && (filters.minPrice > 0 || filters.maxPrice < 100000000) && (
              <Tag
                closable
                color="green"
                onClose={() => handlePriceCommit([0, 100000000])}
                style={{ borderRadius: 999, margin: 0, padding: '4px 12px' }}
              >
                Giá: {new Intl.NumberFormat('vi-VN').format(filters.minPrice)}đ - {new Intl.NumberFormat('vi-VN').format(filters.maxPrice)}đ
              </Tag>
            )}
          </motion.div>
        )}

        {/* Main content area */}
        <Row gutter={[24, 24]}>
          {/* Products column */}
          <Col xs={24} xl={18}>
            {isLoading ? (
              <>
                <AIProductSkeleton variant="bento" />
                <AIProductSkeleton count={6} variant="grid" />
              </>
            ) : isEmpty ? (
              <InsightEmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description="Hãy nới rộng khoảng giá, đổi danh mục hoặc thử tìm kiếm bằng ngôn ngữ tự nhiên."
                actionLabel="Đặt lại bộ lọc"
                onAction={handleReset}
                icon={<SearchOutlined />}
                accentColor="#0F766E"
                accentBackground="rgba(13, 148, 136, 0.12)"
              />
            ) : (
              <>
                {/* 1. Featured & AI Recommendations Carousel */}
                {!hasActiveFilters && (featuredProducts.length > 0 || aiProducts.length > 0) && (
                  <ProductCarousel
                    title="Đề xuất cho bạn"
                    subtitle="Sản phẩm AI lựa chọn dựa trên sở thích của bạn"
                    icon="✨"
                    products={[...aiProducts, ...featuredProducts].slice(0, 10)}
                    aiProducts={aiProducts}
                  />
                )}

                {/* 2. Category Highlights (Only when no active filters) */}
                {!hasActiveFilters && categoriesData?.slice(0, 2).map((cat, idx) => {
                  const catProducts = products.filter(p => p.category === cat.name).slice(0, 8);
                  if (catProducts.length < 3) return null;
                  return (
                    <ProductCarousel
                      key={cat.name}
                      title={cat.name}
                      subtitle={`Khám phá những mẫu ${cat.name.toLowerCase()} mới nhất`}
                      icon={idx === 0 ? "📱" : "💻"}
                      products={catProducts}
                    />
                  );
                })}

                {/* 3. Main Catalog / Infinite List */}
                <div style={{ marginTop: 32 }}>
                  <ProductInfiniteList
                    itemsWithMilestones={itemsWithMilestones}
                    isFetchingNextPage={isFetchingNextPage}
                    isReachingEnd={isReachingEnd}
                    sentinelRef={sentinelRef}
                    onMilestoneAction={() => {
                      if (isAuthenticated) router.push('/ai-suggest');
                      else router.push('/login');
                    }}
                  />
                </div>
              </>
            )}
          </Col>

          {/* AI Concierge — desktop sidebar */}
          <Col xs={0} xl={6}>
            <AIConciergePanel
              aiProducts={aiProducts}
              aiSource={aiSource}
              aiLoading={aiLoading}
              aiEnabled={aiEnabled}
              setAiEnabled={setAiEnabled}
              isAuthenticated={isAuthenticated}
            />
          </Col>
        </Row>

        {/* Filter Sheet (drawer) */}
        <FilterSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          categories={categoriesData || []}
          sliderValue={sliderValue}
          onSliderChange={setSliderValue}
          onPriceCommit={handlePriceCommit}
          onFilter={handleFilter}
          onQuickFilter={handleQuickFilter}
          onReset={handleReset}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '32px 24px 56px' }}>
        <div className="container" style={{ maxWidth: 1440 }}>
          <AIProductSkeleton variant="bento" />
          <AIProductSkeleton count={6} variant="grid" />
        </div>
      </div>
    }>
      <MoodProvider>
        <ShopContent />
      </MoodProvider>
    </Suspense>
  );
}
