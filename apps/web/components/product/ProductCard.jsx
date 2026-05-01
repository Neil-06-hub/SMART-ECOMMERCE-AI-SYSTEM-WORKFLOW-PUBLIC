'use client';

import { useState } from 'react';
import { Rate, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, CheckOutlined, ThunderboltFilled, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useCartStore, useAuthStore, useWishlistStore } from '@/store/useStore';
import { aiAPI, wishlistAPI } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const cardVariants = {
  rest:  { y: 0,  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
  hover: {
    y: -6,
    boxShadow: '0 24px 48px rgba(232,93,4,0.12), 0 8px 20px rgba(0,0,0,0.06)',
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const imageVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.5, ease: 'easeOut' } },
};

const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

const ctaVariants = {
  rest:  { y: 12, opacity: 0 },
  hover: { y: 0, opacity: 1, transition: { delay: 0.06, duration: 0.22, ease: 'easeOut' } },
};

const AI_INSIGHTS = [
  'Phù hợp {percent}% với phong cách của bạn',
  'Giá nằm trong tầm bạn thường chọn',
  'Danh mục bạn đang quan tâm nhất',
];

const CROSS_SELL_HINTS = [
  'Thường mua kèm ốp lưng',
  'Hay đi cùng tai nghe Bluetooth',
  'Kết hợp tốt với chuột không dây',
  'Người mua cũng chọn thêm sạc nhanh',
];

const ProductCard = ({ product, matchPercent, size = 'medium', showAIOverlay = false }) => {
  const router      = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated }    = useAuthStore();
  const { isWishlisted, toggle } = useWishlistStore();
  const queryClient = useQueryClient();

  const [cartDone, setCartDone] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const heartControls = useAnimation();

  const wishlisted = isWishlisted(product._id);

  const wishlistMutation = useMutation({
    mutationFn: () => wishlistAPI.toggle(product._id),
    onSuccess: (res) => {
      toggle(product._id);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] });
      message.success(res.data.added ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích');
    },
    onError: () => message.error('Lỗi, vui lòng thử lại'),
  });

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { router.push('/login'); return; }
    await heartControls.start({
      scale: [1, 1.35, 0.9, 1.15, 1],
      transition: { duration: 0.42, ease: [0.36, 0.07, 0.19, 0.97] },
    });
    wishlistMutation.mutate();
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    setCartDone(false);
    addItem(product);
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setCartDone(true);
    setTimeout(() => setCartDone(false), 1200);
    if (isAuthenticated) {
      aiAPI.trackActivity({ productId: product._id, action: 'add_cart' }).catch(() => {});
    }
  };

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Size-aware aspect ratios
  const aspectRatio = size === 'hero' ? '3/4' : size === 'compact' ? '4/4.5' : '4/5';
  const insightText = matchPercent
    ? AI_INSIGHTS[0].replace('{percent}', matchPercent)
    : AI_INSIGHTS[Math.floor(Math.random() * AI_INSIGHTS.length)].replace('{percent}', '88');
  const crossSellHint = CROSS_SELL_HINTS[product.name.length % CROSS_SELL_HINTS.length];

  return (
    <motion.div
      className="product-card"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={() => router.push('/products/' + product._id)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 20,
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio, background: 'var(--color-bg)', overflow: 'hidden' }}>
        <motion.img
          variants={imageVariants}
          src={product.image || 'https://placehold.co/400x500/f1f5f9/a1a1aa?text=Product'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* AI Hover Overlay — Smart Insights */}
        <motion.div
          className="product-card-v2-overlay"
          variants={overlayVariants}
        >
          <motion.div variants={ctaVariants}>
            {/* AI Insight */}
            {(matchPercent || showAIOverlay) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 8,
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <div style={{ color: 'white', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  <ThunderboltFilled style={{ color: '#FDBA74', marginRight: 6 }} />
                  {insightText}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                  {crossSellHint}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); router.push('/products/' + product._id); }}
                style={{
                  flex: 1, height: 40, borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <EyeOutlined /> Xem chi tiết
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  width: 42, height: 40, borderRadius: 12,
                  background: product.stock === 0 ? 'rgba(255,255,255,0.1)'
                    : cartDone ? '#22C55E'
                    : 'var(--mood-accent)',
                  border: 'none', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 17, flexShrink: 0,
                  boxShadow: product.stock === 0 ? 'none' : '0 4px 14px rgba(232,93,4,0.3)',
                  transition: 'background 0.2s ease',
                }}
              >
                {cartDone ? <CheckOutlined /> : <ShoppingCartOutlined />}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Badges — top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, maxWidth: 'calc(100% - 58px)' }}>
          {matchPercent ? (
            <Tooltip title="AI khuyên dùng dựa trên sở thích của bạn">
              <div
                className="bg-gradient-ai"
                style={{ color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 4px 10px rgba(249,115,22,0.3)', whiteSpace: 'nowrap' }}
              >
                <ThunderboltFilled /> AI Match: {matchPercent}%
              </div>
            </Tooltip>
          ) : product.rating >= 4.8 ? (
            <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: '#D97706', border: '1px solid rgba(234,179,8,0.25)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              ★ Top Rated
            </div>
          ) : null}
          {discount > 0 && (
            <div style={{ background: '#EF4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
              -{discount}%
            </div>
          )}
        </div>

        {/* Wishlist button */}
        <Tooltip title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}>
          <motion.div
            onClick={handleWishlist}
            animate={heartControls}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 6,
              width: 36, height: 36, borderRadius: '50%',
              background: wishlisted ? '#FFF1F2' : 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {wishlisted
              ? <HeartFilled  style={{ fontSize: 17, color: '#EF4444' }} />
              : <HeartOutlined style={{ fontSize: 17, color: '#9CA3AF' }} />
            }
          </motion.div>
        </Tooltip>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <span style={{ background: 'var(--color-text)', color: 'white', fontWeight: 700, fontSize: 13, padding: '8px 20px', borderRadius: 999, letterSpacing: '0.02em' }}>Tạm Hết Hàng</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: size === 'hero' ? '18px 20px' : '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {product.category || 'Sản Phẩm'}
        </div>

        <div style={{
          fontWeight: 600, fontSize: size === 'hero' ? 16 : 14,
          color: 'var(--color-text)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          lineHeight: 1.5, marginBottom: 8, flex: 1,
        }}>
          {product.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <Rate disabled defaultValue={product.rating || 4.5} style={{ fontSize: 11, color: '#F59E0B' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>({product.numReviews || 0})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.originalPrice > product.price && (
              <span style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: 12, fontWeight: 400 }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: size === 'hero' ? 20 : 18, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
