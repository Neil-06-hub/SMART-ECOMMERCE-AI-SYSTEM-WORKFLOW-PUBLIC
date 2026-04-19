'use client';

import { useState } from 'react';
import { App, Badge, Button, Empty, Popover, Skeleton, Tag } from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  HeartFilled,
  HeartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store/useStore';

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

function WishlistContent({ onClose }) {
  const router = useRouter();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((response) => response.data.wishlist),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistAPI.remove(productId),
    onSuccess: (_, productId) => {
      removeItem(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] });
    },
  });

  const wishlist = data || [];

  if (isLoading) {
    return (
      <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton.Image active style={{ width: 64, height: 64, borderRadius: 14 }} />
            <Skeleton active title={{ width: '80%' }} paragraph={{ rows: 2, width: ['95%', '55%'] }} style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ width: 360 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có sản phẩm nào trong wishlist."
          style={{ margin: '18px 0 12px' }}
        >
          <Button
            type="primary"
            size="large"
            onClick={() => {
              onClose();
              router.push('/shop');
            }}
            style={{ borderRadius: 12, fontWeight: 700 }}
          >
            Khám phá cửa hàng
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
        {wishlist.slice(0, 5).map((product) => (
          <div
            key={product._id}
            style={{
              display: 'flex',
              gap: 12,
              padding: 12,
              borderRadius: 18,
              border: '1px solid var(--border-color)',
              background: '#FFFBF5',
            }}
          >
            <img
              src={product.image || 'https://placehold.co/80x80/f8fafc/a1a1aa?text=SP'}
              alt={product.name}
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 14, flexShrink: 0, cursor: 'pointer' }}
              onClick={() => {
                onClose();
                router.push(`/products/${product._id}`);
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--text-main)',
                  lineHeight: 1.45,
                  marginBottom: 6,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onClose();
                  router.push(`/products/${product._id}`);
                }}
              >
                {product.name}
              </div>

              <div style={{ color: 'var(--brand-teal)', fontWeight: 800, marginBottom: 8 }}>
                {formatPrice(product.price)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {product.stock === 0 ? (
                  <Tag color="red" style={{ margin: 0, borderRadius: 999 }}>Hết hàng</Tag>
                ) : (
                  <Tag color="green" style={{ margin: 0, borderRadius: 999 }}>Sẵn sàng mua</Tag>
                )}

                <Button
                  size="small"
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  disabled={product.stock === 0}
                  onClick={() => {
                    addItem(product);
                    message.success('Đã thêm sản phẩm vào giỏ hàng.');
                  }}
                  style={{ borderRadius: 10 }}
                >
                  Thêm
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={removeMutation.isPending && removeMutation.variables === product._id}
                  onClick={() => removeMutation.mutate(product._id)}
                  style={{ borderRadius: 10 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlist.length > 5 ? (
        <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          +{wishlist.length - 5} sản phẩm khác trong danh sách
        </div>
      ) : null}

      <Button
        type="primary"
        block
        size="large"
        icon={<ArrowRightOutlined />}
        onClick={() => {
          onClose();
          router.push('/wishlist');
        }}
        style={{ marginTop: 16, borderRadius: 12, fontWeight: 700 }}
      >
        Xem toàn bộ wishlist
      </Button>
    </div>
  );
}

export default function WishlistDropdown() {
  const [open, setOpen] = useState(false);
  const { items: wishlistIds, setItems } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  // Sync wishlist store từ server sau khi login (hoặc khi data stale)
  useQuery({
    queryKey: ['wishlistIds'],
    queryFn: async () => {
      const res = await wishlistAPI.getIds();
      setItems(res.data.wishlistIds);
      return res.data.wishlistIds;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={<WishlistContent onClose={() => setOpen(false)} />}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <HeartFilled style={{ color: '#DC2626' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Wishlist</span>
          {wishlistIds.length > 0 ? <Badge count={wishlistIds.length} style={{ background: '#DC2626' }} /> : null}
        </div>
      }
      trigger="click"
      placement="bottomRight"
      arrow={false}
      styles={{
        body: {
          padding: '16px 18px',
          borderRadius: 20,
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.14)',
          minWidth: 392,
        },
      }}
      overlayStyle={{ paddingTop: 10 }}
    >
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Badge count={wishlistIds.length} style={{ background: '#DC2626' }} offset={[2, -4]}>
          <HeartOutlined style={{ fontSize: 26, color: wishlistIds.length > 0 ? '#DC2626' : '#0F172A', transition: 'color 0.2s' }} />
        </Badge>
      </div>
    </Popover>
  );
}
