'use client';

import { Rate, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore, useWishlistStore } from '@/store/useStore';
import { aiAPI, wishlistAPI } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ProductCard = ({ product, matchPercent }) => {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggle } = useWishlistStore();
  const queryClient = useQueryClient();

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

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { router.push('/login'); return; }
    wishlistMutation.mutate();
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    if (isAuthenticated) {
      aiAPI.trackActivity({ productId: product._id, action: 'add_cart' }).catch(() => {});
    }
  };

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="product-card"
      onClick={() => router.push('/products/' + product._id)}
      style={{
        background: 'var(--bg-card)', borderRadius: 20,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden', cursor: 'pointer',
        position: 'relative', border: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 220, background: 'var(--bg-main)', overflow: 'hidden' }}>
        <img
          src={product.image || 'https://placehold.co/400x400/f1f5f9/a1a1aa?text=Product'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
        />

        {/* Badges — capped width to never collide with wishlist button (36px + 12px*2 = 60px) */}
        <div
          style={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
            maxWidth: 'calc(100% - 62px)',
          }}
        >
          {matchPercent ? (
            <Tooltip title="AI khuyên dùng dựa trên sở thích của bạn">
              <div
                className="bg-gradient-ai"
                style={{
                  color: 'white', fontSize: 12, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 999,
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 4px 10px rgba(249,115,22,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                <ThunderboltFilled /> {matchPercent}% Phù hợp
              </div>
            </Tooltip>
          ) : product.rating >= 4.8 ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)',
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                whiteSpace: 'nowrap',
              }}
            >
              ⭐ Top Rated
            </div>
          ) : null}
          {discount > 0 && (
            <div
              style={{
                background: '#EF4444', color: 'white',
                fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                whiteSpace: 'nowrap',
              }}
            >
              -{discount}%
            </div>
          )}
        </div>

        {/* Wishlist button — always top-right, never overlaps badges */}
        <Tooltip title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}>
          <div
            onClick={handleWishlist}
            style={{
              position: 'absolute', top: 10, right: 10, zIndex: 2,
              width: 36, height: 36, borderRadius: '50%',
              background: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer', transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {wishlisted
              ? <HeartFilled style={{ fontSize: 18, color: '#EF4444' }} />
              : <HeartOutlined style={{ fontSize: 18 }} />
            }
          </div>
        </Tooltip>

        {/* Out of stock */}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <span style={{ background: 'var(--text-main)', color: 'white', fontWeight: 700, fontSize: 14, padding: '8px 20px', borderRadius: 999 }}>Tạm Hết Hàng</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {product.category || 'Sản Phẩm'}
        </div>

        <div style={{
          fontWeight: 700, fontSize: 16, color: 'var(--text-main)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          lineHeight: 1.4, marginBottom: 12, flex: 1,
        }}>
          {product.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Rate disabled defaultValue={product.rating || 4.5} style={{ fontSize: 13, color: '#F59E0B' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>({product.numReviews || 0})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.originalPrice > product.price && (
              <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: 13, fontWeight: 500 }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span style={{ color: 'var(--brand-teal)', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: product.stock === 0 ? 'var(--border-color)' : 'var(--brand-teal)',
              border: 'none', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer', fontSize: 20,
              transition: 'all 0.2s ease',
              boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(234, 88, 12, 0.2)',
            }}
          >
            <ShoppingCartOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
