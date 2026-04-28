'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Tag, Typography, Popconfirm, Tooltip } from 'antd';
import { 
  DeleteOutlined, 
  MinusOutlined, 
  PlusOutlined, 
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWishlistStore, useAuthStore } from '@/store/useStore';
import { wishlistAPI } from '@/lib/api';

const { Text, Title } = Typography;

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggle } = useWishlistStore();
  const wishlisted = isWishlisted(item._id);

  const toggleMutation = useMutation({
    mutationFn: (productId) => wishlistAPI.toggle(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] });
    }
  });

  const handleWishlistToggle = () => {
    toggle(item._id);
    if (isAuthenticated) {
      toggleMutation.mutate(item._id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.9,
        transition: { duration: 0.2 } 
      }}
      style={{ position: 'relative', marginBottom: 16 }}
    >
      {/* Swipe Background (Delete Action) - Fixed behind the draggable card */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: '#ff4d4f', 
          borderRadius: 24, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          paddingRight: 24,
          color: 'white',
          zIndex: 0
        }}
      >
        <DeleteOutlined style={{ fontSize: 24 }} />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            onRemove(item._id);
          }
        }}
        whileTap={{ cursor: 'grabbing' }}
        className="cart-item-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '16px 20px',
          borderRadius: 24,
          background: 'white',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid rgba(232, 93, 4, 0.05)'
        }}
      >
        {/* Product Image */}
        <div 
          style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 18, 
            overflow: 'hidden', 
            flexShrink: 0,
            background: '#f8f8f8'
          }}
        >
          <img 
            src={item.image} 
            alt={item.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Product Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Link href={`/products/${item._id}`}>
                <Title level={5} style={{ margin: 0, fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>
                  {item.name}
                </Title>
              </Link>
              <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.category || 'Lifestyle'}
              </Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text strong style={{ fontSize: 18, color: 'var(--color-primary)' }}>
                {formatPrice(item.price)}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            {/* Quantity Controls */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'rgba(0,0,0,0.03)', 
                borderRadius: 14,
                padding: '4px'
              }}
            >
              <motion.button
                whileTap={{ scale: 0.9, backgroundColor: 'rgba(0,0,0,0.1)' }}
                onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MinusOutlined style={{ fontSize: 12 }} />
              </motion.button>
              
              <div style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={item.quantity}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'inline-block' }}
                  >
                    {item.quantity}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.button
                whileTap={{ scale: 0.9, backgroundColor: 'rgba(0,0,0,0.1)' }}
                onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PlusOutlined style={{ fontSize: 12 }} />
              </motion.button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Tooltip title={wishlisted ? "Xóa khỏi Wishlist" : "Thêm vào Wishlist"}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlistToggle}
                  style={{
                    border: 'none',
                    background: wishlisted ? 'rgba(232, 93, 4, 0.1)' : 'transparent',
                    color: wishlisted ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {wishlisted ? <HeartFilled /> : <HeartOutlined />}
                </motion.button>
              </Tooltip>

              <Popconfirm
                title="Xóa sản phẩm này?"
                onConfirm={() => onRemove(item._id)}
                okText="Xóa"
                cancelText="Hủy"
                placement="topRight"
              >
                <motion.button
                  whileHover={{ scale: 1.1, color: '#ff4d4f' }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text-muted)',
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DeleteOutlined />
                </motion.button>
              </Popconfirm>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
