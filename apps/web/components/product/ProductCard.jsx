'use client';

import { useState } from 'react';
import { Rate, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, CheckOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
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

const ctaVariants = {
  rest:  { y: 8, opacity: 0 },
  hover: { y: 0, opacity: 1, transition: { delay: 0.08, duration: 0.22, ease: 'easeOut' } },
};

const ProductCard = ({ product, matchPercent }) => {
  const router      = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated }    = useAuthStore();
  const { isWishlisted, toggle } = useWishlistStore();
  const queryClient = useQueryClient();

  const [cartDone, setCartDone] = useState(false);
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

  return (
    <motion.div
      className="product-card"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={() => router.push('/products/' + product._id)}
      style={{ cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--color-bg)', overflow: 'hidden' }}>
        <motion.img
          variants={imageVariants}
          src={product.image || 'https://placehold.co/400x500/f1f5f9/a1a1aa?text=Product'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Badges — top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, maxWidth: 'calc(100% - 58px)' }}>
          {matchPercent ? (
            <Tooltip title="AI khuyên dùng dựa trên sở thích của bạn">
              <div
                className="bg-gradient-ai"
                style={{ color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 4px 10px rgba(249,115,22,0.3)', whiteSpace: 'nowrap' }}
              >
                <ThunderboltFilled /> {matchPercent}% Phù hợp
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

        {/* Wishlist button — Framer Motion micro-interaction */}
        <Tooltip title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}>
          <motion.div
            onClick={handleWishlist}
            animate={heartControls}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 2,
              width: 36, height: 36, borderRadius: '50%',
              background: wishlisted ? '#FFF1F2' : 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              flexShrink: 0,
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
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {product.category || 'Sản Phẩm'}
        </div>

        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, marginBottom: 10, flex: 1 }}>
          {product.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
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
            <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: 18, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Add-to-cart — slides in on hover */}
          <motion.button
            variants={ctaVariants}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            whileTap={product.stock > 0 ? { scale: 0.93 } : {}}
            style={{
              width: 42, height: 42, borderRadius: 13,
              background: product.stock === 0
                ? '#E5E5E5'
                : cartDone
                  ? '#22C55E'
                  : 'var(--color-primary)',
              border: 'none',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              fontSize: 18,
              transition: 'background 0.25s ease',
              boxShadow: product.stock === 0 ? 'none' : '0 4px 14px rgba(232,93,4,0.28)',
              flexShrink: 0,
            }}
          >
            {cartDone
              ? <CheckOutlined style={{ fontSize: 17 }} />
              : <ShoppingCartOutlined />
            }
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
