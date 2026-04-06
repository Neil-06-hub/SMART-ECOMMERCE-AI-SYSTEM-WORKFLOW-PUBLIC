'use client';

import { useState } from 'react';
import { Popover, Badge, Button, Spin, Empty, message } from 'antd';
import { HeartFilled, HeartOutlined, DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useWishlistStore, useCartStore } from '@/store/useStore';

const WishlistContent = ({ onClose }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((r) => r.data.wishlist),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistAPI.remove(productId),
    onSuccess: (_, productId) => {
      removeItem(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  const wishlist = data || [];

  if (isLoading) {
    return (
      <div style={{ width: 340, display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ width: 340 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#94A3B8', fontSize: 13 }}>Chưa có sản phẩm yêu thích</span>}
          style={{ margin: '28px 0' }}
        >
          <Button size="small" onClick={() => { onClose(); router.push('/shop'); }} style={{ borderColor: '#EF4444', color: '#EF4444' }}>
            Khám phá cửa hàng
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ width: 340 }}>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {wishlist.slice(0, 5).map((product) => (
          <div key={product._id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <img
              src={product.image || 'https://placehold.co/60x60/f1f5f9/a1a1aa?text=SP'}
              alt={product.name}
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0, cursor: 'pointer', border: '1px solid #F1F5F9' }}
              onClick={() => { onClose(); router.push(`/products/${product._id}`); }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', cursor: 'pointer', lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                onClick={() => { onClose(); router.push(`/products/${product._id}`); }}
              >
                {product.name}
              </div>
              <div style={{ color: '#EA580C', fontWeight: 700, fontSize: 14 }}>{formatPrice(product.price)}</div>
              {product.stock === 0 && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Hết hàng</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <Button size="small" type="primary" icon={<ShoppingCartOutlined />} disabled={product.stock === 0}
                onClick={() => { addItem(product); message.success('Đã thêm vào giỏ hàng!'); }}
                style={{ background: '#0F172A', borderColor: '#0F172A', borderRadius: 8 }} />
              <Button size="small" danger icon={<DeleteOutlined />}
                loading={removeMutation.isPending && removeMutation.variables === product._id}
                onClick={() => removeMutation.mutate(product._id)}
                style={{ borderRadius: 8 }} />
            </div>
          </div>
        ))}
        {wishlist.length > 5 && (
          <div style={{ padding: '8px 0', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
            +{wishlist.length - 5} sản phẩm khác
          </div>
        )}
      </div>
      <div style={{ paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
        <Button type="primary" block icon={<ArrowRightOutlined />}
          onClick={() => { onClose(); router.push('/wishlist'); }}
          style={{ background: '#EF4444', borderColor: '#EF4444', borderRadius: 8, fontWeight: 600 }}>
          Xem tất cả ({wishlist.length} sản phẩm)
        </Button>
      </div>
    </div>
  );
};

const WishlistDropdown = () => {
  const [open, setOpen] = useState(false);
  const { items: wishlistIds } = useWishlistStore();

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={<WishlistContent onClose={() => setOpen(false)} />}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <HeartFilled style={{ color: '#EF4444' }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Yêu thích</span>
          {wishlistIds.length > 0 && <Badge count={wishlistIds.length} style={{ background: '#EF4444' }} />}
        </div>
      }
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{ padding: '14px 16px', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 372 }}
      overlayStyle={{ paddingTop: 8 }}
    >
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Badge count={wishlistIds.length} style={{ background: '#EF4444' }} offset={[2, -4]}>
          <HeartOutlined style={{ fontSize: 26, color: wishlistIds.length > 0 ? '#EF4444' : '#0F172A', transition: 'color 0.2s' }} />
        </Badge>
      </div>
    </Popover>
  );
};

export default WishlistDropdown;
