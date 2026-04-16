'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Rate, Tag, Tooltip, Typography, message } from 'antd';
import {
  EyeOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { aiAPI } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/store/useStore';

const { Paragraph, Text, Title } = Typography;

const sourceMap = {
  model: { label: 'AI Model', color: 'gold' },
  cache: { label: 'Cache', color: 'blue' },
  fallback: { label: 'Fallback', color: 'default' },
};

const cardStyles = {
  height: '100%',
  borderRadius: 24,
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
  boxShadow: '0 18px 32px rgba(131, 61, 7, 0.06)',
  background: 'white',
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
  placement = 'homepage',
  matchPercent = 88,
  reasonTitle = 'Lý do AI chọn sản phẩm này',
  reasons = [],
  source = 'model',
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const sourceInfo = sourceMap[source] || sourceMap.model;
  const reasonList = useMemo(
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

    aiAPI.trackActivity({
      productId: product._id,
      action: 'rec_click',
      placement,
    }).catch(() => {});
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
      aiAPI.trackActivity({
        productId: product._id,
        action: 'add_cart',
        placement,
      }).catch(() => {});
    }
  };

  return (
    <Card
      hoverable
      style={cardStyles}
      bodyStyle={{ padding: 18, display: 'flex', flexDirection: 'column', height: '100%' }}
      onClick={handleNavigate}
    >
      <div style={{ position: 'relative', marginBottom: 18 }}>
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Tag color="gold" style={{ margin: 0, borderRadius: 999, paddingInline: 12, paddingBlock: 4, fontWeight: 700 }}>
            <RobotOutlined /> Dành riêng cho bạn
          </Tag>
          {discount > 0 ? (
            <Tag color="red" style={{ margin: 0, borderRadius: 999, paddingInline: 10, paddingBlock: 4, fontWeight: 700 }}>
              -{discount}%
            </Tag>
          ) : null}
        </div>

        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <Tooltip title={source === 'fallback' ? 'Đang dùng danh sách dự phòng' : 'Nguồn gợi ý hiện tại'}>
            <Tag color={sourceInfo.color} style={{ margin: 0, borderRadius: 999, paddingInline: 10, paddingBlock: 4, fontWeight: 600 }}>
              {sourceInfo.label}
            </Tag>
          </Tooltip>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(231, 217, 200, 0.85)',
          }}
        >
          <div style={{ position: 'relative', aspectRatio: '4 / 4.2', background: '#FFF7ED' }}>
            <img
              src={product.image || 'https://placehold.co/800x900/f7f3ee/9a8b7a?text=Product'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--text-muted)', fontWeight: 700 }}>
          {product.category || 'Sản phẩm'}
        </Text>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#FFF3E8',
            color: '#9A3412',
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <ThunderboltFilled />
          {safeMatchPercent}% phù hợp
        </div>
      </div>

      <Title level={5} style={{ margin: '0 0 10px', lineHeight: 1.35, fontWeight: 800 }}>
        {product.name}
      </Title>

      <div
        style={{
          marginBottom: 12,
          padding: 14,
          borderRadius: 18,
          background: '#FFFAF3',
          border: '1px solid #F5E4D3',
        }}
      >
        <Text style={{ display: 'block', color: '#7C2D12', fontWeight: 700, marginBottom: 10 }}>
          {reasonTitle}
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {reasonList.map((reason) => (
            <span
              key={reason}
              style={{
                borderRadius: 999,
                background: 'white',
                border: '1px solid #F4D9BF',
                color: '#7C2D12',
                padding: '5px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Rate disabled allowHalf value={product.rating || 0} style={{ fontSize: 14, color: '#F59E0B' }} />
        <Text type="secondary">({product.numReviews || 0})</Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginTop: 'auto' }}>
        <div>
          {product.originalPrice > product.price ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'line-through', marginBottom: 2 }}>
              {formatPrice(product.originalPrice)}
            </div>
          ) : null}
          <div style={{ color: 'var(--brand-teal)', fontSize: 24, lineHeight: 1, fontWeight: 800 }}>
            {formatPrice(product.price)}
          </div>
          <Paragraph style={{ margin: '6px 0 0', color: product.stock === 0 ? '#DC2626' : 'var(--text-muted)', fontSize: 13 }}>
            {product.stock === 0 ? 'Tạm hết hàng' : `Còn ${product.stock || 0} sản phẩm`}
          </Paragraph>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            icon={<EyeOutlined />}
            size="large"
            style={{ borderRadius: 14, height: 46 }}
            onClick={(event) => {
              event.stopPropagation();
              handleNavigate();
            }}
          >
            Xem
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="large"
            style={{ borderRadius: 14, height: 46 }}
            disabled={product.stock === 0}
            onClick={handleAddToCart}
          >
            Thêm
          </Button>
        </div>
      </div>
    </Card>
  );
}
