'use client';

import { useState, useRef, useEffect } from 'react';
import { Tag, Typography, Spin } from 'antd';
import { LoadingOutlined, RobotOutlined, SearchOutlined, ShoppingOutlined, ThunderboltFilled } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useMood } from '@/hooks/useMoodEngine';
import { aiAPI } from '@/lib/api';

const { Paragraph, Title } = Typography;

const NL_SUGGESTIONS = [
  'Tìm laptop gaming dưới 20 triệu',
  'Tai nghe chống ồn bán chạy',
  'Đồng hồ thông minh mới về',
  'Phụ kiện giảm giá dưới 2tr',
  'Điện thoại pin trâu dưới 10 triệu',
];

function formatPrice(price) {
  if (!price) return '';
  return price.toLocaleString('vi-VN') + '₫';
}

export default function ShopHero({
  totalProducts,
  aiCount,
  isLoading,
  onNLSearch,
  onAIFilters,
  onSearch,
  searchText,
  availableCategories,
}) {
  const { mood } = useMood();
  const [query, setQuery] = useState(searchText || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Chatbot state
  const [chatState, setChatState] = useState('idle'); // 'idle' | 'loading' | 'responded'
  const [aiResponse, setAiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef(null);

  // Sync with parent state
  useEffect(() => {
    if (searchText !== query) setQuery(searchText || '');
  }, [searchText]);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % NL_SUGGESTIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Debounced AI product suggestions (only while typing, not after submit)
  useEffect(() => {
    if (query.length < 2 || chatState === 'responded') {
      setAiSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    setSuggestionsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await aiAPI.getSearchSuggestions(query, 5);
        setAiSuggestions(res.data?.data || []);
      } catch {
        setAiSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [query, chatState]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || isSubmitting) return;

    setIsSubmitting(true);
    setChatState('loading');
    setShowSuggestions(false);
    aiAPI.trackSearch(q).catch(() => {});

    try {
      const res = await aiAPI.chatSearch(q, availableCategories || []);
      const data = res.data?.data || {};

      if (data.source === 'fallback' || !data.interpretation) {
        onNLSearch(q);
        setChatState('idle');
      } else {
        setAiResponse(data);
        setChatState('responded');
        onAIFilters?.(data);
      }
    } catch {
      onNLSearch(q);
      setChatState('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
    aiAPI.trackSearch(text).catch(() => {});
    onNLSearch(text);
    setShowSuggestions(false);
  };

  const dismissResponse = () => {
    setChatState('idle');
    setAiResponse(null);
  };

  const isAIMode = query.length >= 2 && chatState !== 'responded';

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
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${mood.glow}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Tag color="orange" style={{ borderRadius: 999, paddingInline: 14, paddingBlock: 5, fontWeight: 700, fontSize: 12 }}>
            <ThunderboltFilled /> Shopping Concierge
          </Tag>
          <Tag style={{
            borderRadius: 999, paddingInline: 14, paddingBlock: 5,
            fontWeight: 700, fontSize: 12,
            background: mood.accentSoft, border: `1px solid ${mood.accent}22`, color: mood.accent,
          }}>
            <RobotOutlined /> {mood.label}
          </Tag>
        </div>

        {/* Headline */}
        <Title level={1} style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 800 }}>
          Mua sắm thông minh.{' '}
          <span style={{ color: mood.accent }}>AI hiểu bạn.</span>
        </Title>
        <Paragraph style={{ margin: '12px 0 24px', maxWidth: 600, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Nhập bất kỳ điều gì bạn muốn — AI sẽ phân tích ngữ cảnh, khoảng giá và danh mục để tìm đúng sản phẩm bạn cần.
        </Paragraph>

        {/* NL Search */}
        <form onSubmit={handleSubmit} className="nl-search-wrap">
          <input
            ref={inputRef}
            type="text"
            className="nl-search-input"
            placeholder={chatState === 'loading' ? 'AI đang phân tích...' : NL_SUGGESTIONS[placeholderIndex]}
            value={query}
            disabled={isSubmitting}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              onSearch?.(val);
              if (chatState === 'responded') {
                setChatState('idle');
                setAiResponse(null);
              }
              setShowSuggestions(val.length === 0 || val.length >= 2);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <button
            type="submit"
            className="nl-search-btn"
            aria-label="Tìm kiếm"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingOutlined spin /> : <SearchOutlined />}
          </button>

          {/* Suggestion dropdown */}
          <AnimatePresence>
            {showSuggestions && chatState !== 'loading' && (
              <motion.div
                className="nl-search-suggestions glass-panel"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {isAIMode ? (
                  <>
                    <div style={{ padding: '4px 12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RobotOutlined style={{ color: mood.accent }} /> Gợi ý sản phẩm
                    </div>
                    {suggestionsLoading ? (
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                        <Spin size="small" /> Đang tìm sản phẩm...
                      </div>
                    ) : aiSuggestions.length > 0 ? (
                      aiSuggestions.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSuggestionClick(product.name)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 10, width: '100%', padding: '10px 12px',
                            border: 'none', background: 'transparent', borderRadius: 10,
                            cursor: 'pointer', fontSize: 14, color: 'var(--color-text)',
                            textAlign: 'left', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--mood-accent-soft)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            <ShoppingOutlined style={{ color: mood.accent, fontSize: 13, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.name.length > 45 ? product.name.slice(0, 45) + '…' : product.name}
                            </span>
                          </span>
                          {product.price > 0 && (
                            <span style={{ fontSize: 12, color: mood.accent, fontWeight: 700, flexShrink: 0 }}>
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                        Nhấn Enter để AI phân tích yêu cầu của bạn
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ padding: '4px 12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Thử tìm kiếm thông minh
                    </div>
                    {NL_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '10px 12px', border: 'none', background: 'transparent',
                          borderRadius: 10, cursor: 'pointer', fontSize: 14,
                          color: 'var(--color-text)', textAlign: 'left', transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--mood-accent-soft)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <SearchOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
                        {suggestion}
                      </button>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* AI Chatbot Response Bubble */}
        <AnimatePresence>
          {chatState === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                marginTop: 12, padding: '14px 18px', borderRadius: 18,
                background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: mood.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <RobotOutlined style={{ color: 'white', fontSize: 15 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14 }}>
                <Spin size="small" />
                AI đang phân tích yêu cầu của bạn...
              </div>
            </motion.div>
          )}

          {chatState === 'responded' && aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                marginTop: 12, padding: '16px 18px', borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(59,130,246,0.05))',
                border: '1px solid rgba(249,115,22,0.18)',
                boxShadow: '0 4px 20px rgba(249,115,22,0.08)',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
            >
              {/* Robot avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(135deg, ${mood.accent}, #3B82F6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: `0 4px 12px ${mood.accent}40`,
              }}>
                <RobotOutlined style={{ color: 'white', fontSize: 16 }} />
              </div>

              <div style={{ flex: 1 }}>
                {/* Interpretation */}
                <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text-main)', lineHeight: 1.65, fontWeight: 500 }}>
                  {aiResponse.interpretation}
                </p>

                {/* Applied filter pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {aiResponse.category && (
                    <Tag color="orange" style={{ borderRadius: 999, fontSize: 12 }}>
                      📂 {aiResponse.category}
                    </Tag>
                  )}
                  {aiResponse.maxPrice && (
                    <Tag color="blue" style={{ borderRadius: 999, fontSize: 12 }}>
                      💰 Dưới {(aiResponse.maxPrice / 1000000).toFixed(0)}tr
                    </Tag>
                  )}
                  {aiResponse.minPrice > 0 && (
                    <Tag color="geekblue" style={{ borderRadius: 999, fontSize: 12 }}>
                      💰 Trên {(aiResponse.minPrice / 1000000).toFixed(0)}tr
                    </Tag>
                  )}
                  {aiResponse.keywords && (
                    <Tag style={{ borderRadius: 999, fontSize: 12 }}>
                      🔍 {aiResponse.keywords}
                    </Tag>
                  )}
                  {aiResponse.sort === 'popular' && (
                    <Tag color="volcano" style={{ borderRadius: 999, fontSize: 12 }}>🔥 Bán chạy</Tag>
                  )}
                  {aiResponse.sort === 'price_asc' && (
                    <Tag color="cyan" style={{ borderRadius: 999, fontSize: 12 }}>⬆️ Giá tăng dần</Tag>
                  )}
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={dismissResponse}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: 18, padding: '0 4px',
                  lineHeight: 1, flexShrink: 0, borderRadius: 6,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                aria-label="Đóng"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: mood.accent, boxShadow: `0 0 8px ${mood.glow}` }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{isLoading ? '...' : totalProducts}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>sản phẩm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.3)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{aiCount}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI đề xuất</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
