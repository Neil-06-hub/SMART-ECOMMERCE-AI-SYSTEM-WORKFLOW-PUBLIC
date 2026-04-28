'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Rate, Tooltip, Typography, message } from 'antd';
import {
  EyeOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { aiAPI } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/store/useStore';

const { Paragraph, Text, Title } = Typography;

const sourceMap = {
  model:    { label: 'AI Model',  dotColor: '#E85D04' },
  cache:    { label: 'Cache',     dotColor: '#3B82F6' },
  fallback: { label: 'Fallback',  dotColor: '#9CA3AF' },
};

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deriveDefaultReasons(product) {
  const reasons = [];
  if (product?.category) reasons.push(`Cùng nhóm ${product.category}`);
  if (product?.price >= 20000000) reasons.push('Thuộc phân khúc cao cấp');
  else if (product?.price >= 5000000) reasons.push('Nằm trong tầm giá phổ biến');
  else reasons.push('Mức giá dễ tiếp cận');
  if (product?.tags?.length) {
    const firstTag = product.tags[0].replace(/-/g, ' ');
    reasons.push(`Liên quan ${firstTag}`);
  }
  if (product?.rating >= 4.7) reasons.push('Đánh giá rất tích cực');
  return reasons.slice(0, 3);
}

function formatPrice(price) {
  return `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;
}

export default function AIRecCard({
  product,
  placement    = 'homepage',
  matchPercent = 88,
  reasonTitle  = 'Lý do AI chọn sản phẩm này',
  reasons      = [],
  source       = 'model',
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem }         = useCartStore();

  const sourceInfo  = sourceMap[source] || sourceMap.model;
  const reasonList  = useMemo(
    () => (reasons.length ? reasons : deriveDefaultReasons(product)),
    [product, reasons]
  );

  if (!product) return null;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const safeMatchPercent = clamp(matchPercent || 88, 75, 99);

  const trackRecommendationClick = () => {
    if (!isAuthenticated) return;
    aiAPI.trackActivity({ productId: product._id, action: 'rec_click', placement }).catch(() => {});
  };

  const handleNavigate = () => {
    trackRecommendationClick();
    router.push(`/products/${product._id}`);
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addItem(product, 1);
    message.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    if (isAuthenticated) {
      aiAPI.trackActivity({ productId: product._id, action: 'add_cart', placement }).catch(() => {});
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={handleNavigate}
      style={{
        height: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.6)',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Image block */}
      <div style={{ marginBottom: 0 }}>
        <div
          style={{
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #FFF4EC 0%, #FEFEFE 100%)',
          }}
        >
          <div style={{ position: 'relative', aspectRatio: '4 / 4.2' }}>
            <motion.img
              variants={imageVariants}
              src={product.image || 'https://placehold.co/800x900/f7f3ee/9a8b7a?text=Product'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Badge row — full width, flex */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 6,
                padding: '10px 10px 0',
              }}
            >
              {/* Left: stacked badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: '#D97706', color: 'white',
                    borderRadius: 999, padding: '3px 10px',
                    fontSize: 11, fontWeight: 700,
                    overflow: 'hidden', whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  <RobotOutlined style={{ flexShrink: 0, fontSize: 11 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Dành riêng cho bạn</span>
                </div>
                {discount > 0 && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex', alignItems: 'center',
                      background: '#EF4444', color: 'white',
                      borderRadius: 999, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Right: source badge — glassmorphic */}
              <Tooltip title={source === 'fallback' ? 'Đang dùng danh sách dự phòng' : 'Nguồn gợi ý hiện tại'}>
                <div
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    color: '#374151',
                    borderRadius: 999, padding: '3px 10px',
                    fontSize: 11, fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: sourceInfo.dotColor,
                      display: 'inline-block', flexShrink: 0,
                    }}
                  />
                  {sourceInfo.label}
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Category + Match% */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
          <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {product.category || 'Sản phẩm'}
          </Text>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, #E85D04, #F97316)',
              color: 'white',
              borderRadius: 999,
              padding: '4px 11px',
              fontSize: 11, fontWeight: 700,
              boxShadow: '0 4px 12px rgba(232,93,4,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <ThunderboltFilled style={{ fontSize: 10 }} />
            {safeMatchPercent}%
          </div>
        </div>

        <Title level={5} style={{ margin: '0 0 12px', lineHeight: 1.4, fontWeight: 700, fontSize: 14 }}>
          {product.name}
        </Title>

        {/* Reason box — glassmorphism */}
        <div
          style={{
            marginBottom: 14,
            padding: '12px 14px',
            borderRadius: 16,
            background: 'rgba(255,250,243,0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(245,228,211,0.7)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <Text style={{ display: 'block', color: '#92400E', fontWeight: 700, marginBottom: 8, fontSize: 12 }}>
            {reasonTitle}
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {reasonList.map((reason) => (
              <span
                key={reason}
                style={{
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(244,217,191,0.8)',
                  color: '#92400E',
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {reason}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Rate disabled allowHalf value={product.rating || 0} style={{ fontSize: 12, color: '#F59E0B' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>({product.numReviews || 0})</Text>
        </div>

        {/* Price + Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, marginTop: 'auto' }}>
          <div>
            {product.originalPrice > product.price && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12, textDecoration: 'line-through', marginBottom: 2, fontWeight: 400 }}>
                {formatPrice(product.originalPrice)}
              </div>
            )}
            <div style={{ color: 'var(--color-primary)', fontSize: 22, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.01em' }}>
              {formatPrice(product.price)}
            </div>
            <Paragraph style={{ margin: '5px 0 0', color: product.stock === 0 ? '#DC2626' : 'var(--color-text-muted)', fontSize: 12 }}>
              {product.stock === 0 ? 'Tạm hết hàng' : `Còn ${product.stock || 0} sp`}
            </Paragraph>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button
              icon={<EyeOutlined />}
              size="middle"
              style={{ borderRadius: 12, height: 42, fontSize: 13 }}
              onClick={(event) => { event.stopPropagation(); handleNavigate(); }}
            >
              Xem
            </Button>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="middle"
              style={{ borderRadius: 12, height: 42, fontSize: 13 }}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
