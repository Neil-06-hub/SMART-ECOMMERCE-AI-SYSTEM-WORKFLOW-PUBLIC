'use client';

import { Button, Select, Slider, Typography } from 'antd';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;
const { Text } = Typography;

const QUICK_FILTERS = [
  { label: 'Đang giảm giá', value: 'discount', icon: '🏷️' },
  { label: 'Bán chạy', value: 'popular', icon: '🔥' },
  { label: 'Mới về', value: 'newest', icon: '✨' },
];

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export default function FilterSheet({
  open,
  onClose,
  filters,
  categories = [],
  sliderValue,
  onSliderChange,
  onPriceCommit,
  onFilter,
  onQuickFilter,
  onReset,
  activeFilterCount,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass-panel"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 360,
              maxWidth: '85vw',
              zIndex: 201,
              padding: 28,
              overflowY: 'auto',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '8px 0 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FilterOutlined style={{ fontSize: 18, color: 'var(--mood-accent)' }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  Bộ lọc
                </span>
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      background: 'var(--mood-accent)',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                style={{ borderRadius: 12 }}
              />
            </div>

            {/* Sort */}
            <Section label="Sắp xếp">
              <Select
                value={filters.sort}
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => onFilter('sort', value)}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="popular">Bán chạy</Option>
                <Option value="price_asc">Giá tăng dần</Option>
                <Option value="price_desc">Giá giảm dần</Option>
                <Option value="rating">Đánh giá cao</Option>
              </Select>
            </Section>

            {/* Categories */}
            <Section label="Danh mục">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <CategoryButton
                  active={!filters.category}
                  onClick={() => onFilter('category', '')}
                >
                  Tất cả sản phẩm
                </CategoryButton>
                {categories.map((cat) => (
                  <CategoryButton
                    key={cat}
                    active={filters.category === cat}
                    onClick={() => onFilter('category', cat)}
                  >
                    {cat}
                  </CategoryButton>
                ))}
              </div>
            </Section>

            {/* Price Range */}
            <Section label="Khoảng giá">
              <div style={{ paddingInline: 4 }}>
                <Slider
                  range
                  min={0}
                  max={100000000}
                  step={500000}
                  value={sliderValue}
                  onChange={onSliderChange}
                  onChangeComplete={onPriceCommit}
                  tooltip={{ formatter: formatPrice }}
                />
              </div>
              <div
                style={{
                  marginTop: 8,
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: 'var(--mood-accent-soft)',
                  border: '1px solid rgba(232, 93, 4, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'var(--mood-accent)',
                }}
              >
                <span>{formatPrice(sliderValue[0])}</span>
                <span>{formatPrice(sliderValue[1])}</span>
              </div>
            </Section>

            {/* Quick Filters */}
            <Section label="Lọc nhanh">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUICK_FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`filter-chip ${filters.quickFilter === item.value ? 'active' : ''}`}
                    onClick={() => onQuickFilter(item.value)}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Reset */}
            <Button
              block
              onClick={() => { onReset(); onClose(); }}
              style={{
                height: 48,
                borderRadius: 14,
                marginTop: 8,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Làm mới bộ lọc
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Text
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.2,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {label}
      </Text>
      {children}
    </div>
  );
}

function CategoryButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 14px',
        border: active ? '1px solid var(--mood-accent)' : '1px solid var(--color-border)',
        borderRadius: 12,
        background: active ? 'var(--mood-accent)' : 'white',
        color: active ? 'white' : 'var(--text-main)',
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}
