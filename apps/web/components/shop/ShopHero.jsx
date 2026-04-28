'use client';

import { useState, useRef, useEffect } from 'react';
import { Tag, Typography } from 'antd';
import { RobotOutlined, SearchOutlined, ThunderboltFilled } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useMood } from '@/hooks/useMoodEngine';

const { Paragraph, Title } = Typography;

const NL_SUGGESTIONS = [
  'Tìm laptop gaming dưới 20 triệu',
  'Tai nghe chống ồn bán chạy',
  'Đồng hồ thông minh mới về',
  'Phụ kiện giảm giá dưới 2tr',
  'Điện thoại pin trâu dưới 10 triệu',
];

export default function ShopHero({
  totalProducts,
  aiCount,
  isLoading,
  onNLSearch,
  onSearch,
  searchText,
}) {
  const { mood } = useMood();
  const [query, setQuery] = useState(searchText || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef(null);

  // Sync with parent state
  useEffect(() => {
    if (searchText !== query) {
      setQuery(searchText || '');
    }
  }, [searchText]);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % NL_SUGGESTIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    onNLSearch(query.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onNLSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        marginBottom: 28,
        borderRadius: 28,
        padding: '36px 32px 32px',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 58%, #F8FAFC 100%)',
        border: '1px solid rgba(231, 217, 200, 0.9)',
        boxShadow: '0 24px 48px rgba(131, 61, 7, 0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orb */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${mood.glow}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Tag
            color="orange"
            style={{ borderRadius: 999, paddingInline: 14, paddingBlock: 5, fontWeight: 700, fontSize: 12 }}
          >
            <ThunderboltFilled /> Shopping Concierge
          </Tag>
          <Tag
            style={{
              borderRadius: 999,
              paddingInline: 14,
              paddingBlock: 5,
              fontWeight: 700,
              fontSize: 12,
              background: mood.accentSoft,
              border: `1px solid ${mood.accent}22`,
              color: mood.accent,
            }}
          >
            <RobotOutlined /> {mood.label}
          </Tag>
        </div>

        {/* Headline */}
        <Title
          level={1}
          style={{
            margin: 0,
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: 800,
          }}
        >
          Mua sắm thông minh.{' '}
          <span style={{ color: mood.accent }}>AI hiểu bạn.</span>
        </Title>
        <Paragraph
          style={{
            margin: '12px 0 24px',
            maxWidth: 600,
            fontSize: 15,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          Nhập bất kỳ điều gì bạn muốn — hệ thống sẽ tự phân tích ngữ cảnh, khoảng giá
          và danh mục để tìm đúng sản phẩm bạn cần.
        </Paragraph>

        {/* NL Search */}
        <form onSubmit={handleSubmit} className="nl-search-wrap">
          <input
            ref={inputRef}
            type="text"
            className="nl-search-input"
            placeholder={NL_SUGGESTIONS[placeholderIndex]}
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              onSearch?.(val);
              if (val.length > 0) setShowSuggestions(true);
              else setShowSuggestions(false);
            }}
            onFocus={() => query.length === 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <button type="submit" className="nl-search-btn" aria-label="Tìm kiếm">
            <SearchOutlined />
          </button>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                className="nl-search-suggestions glass-panel"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ padding: '4px 12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Thử tìm kiếm thông minh
                </div>
                {NL_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: 14,
                      color: 'var(--color-text)',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--mood-accent-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <SearchOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: mood.accent,
                boxShadow: `0 0 8px ${mood.glow}`,
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              {isLoading ? '...' : totalProducts}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>sản phẩm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#F59E0B',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)',
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              {aiCount}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI đề xuất</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
