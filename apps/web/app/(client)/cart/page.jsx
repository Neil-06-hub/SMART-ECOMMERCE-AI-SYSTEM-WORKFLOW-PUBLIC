'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  App, 
  Button, 
  Col, 
  Popconfirm,
  Row, 
  Typography, 
  Space, 
  Spin,
  Tag
} from 'antd';
import { 
  ShoppingOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthStore, useCartStore } from '@/store/useStore';
import CartItem from '@/components/cart/CartItem';
import OrderSummary from '@/components/cart/OrderSummary';
import AIAddons from '@/components/cart/AIAddons';

const { Title, Text, Paragraph } = Typography;

const FREE_SHIPPING_THRESHOLD = 500000;

export default function CartPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { isAuthenticated } = useAuthStore();
  const { items, removeItem, updateQuantity, clearCart, addItem, _hasHydrated } = useCartStore();

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;
  const total = subtotal + shippingFee;

  if (!_hasHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để thanh toán.');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  const handleFastAdd = (product) => {
    addItem(product, 1);
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-main)', minHeight: '80vh', padding: '100px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 480 }}
        >
          <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 32px' }}>
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <ShoppingOutlined style={{ fontSize: 120, color: 'var(--color-primary)', opacity: 0.2 }} />
            </motion.div>
            <motion.div
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ThunderboltOutlined style={{ fontSize: 40, color: 'var(--color-ai-light)' }} />
            </motion.div>
          </div>
          
          <Title level={2} style={{ fontWeight: 800, marginBottom: 16 }}>Giỏ hàng đang trống</Title>
          <Paragraph style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>
            Hàng ngàn sản phẩm công nghệ và phụ kiện cao cấp đang chờ bạn khám phá. Hãy bắt đầu hành trình mua sắm ngay!
          </Paragraph>
          
          <Button 
            type="primary" 
            size="large" 
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/shop')}
            style={{ height: 56, borderRadius: 18, paddingInline: 40, fontWeight: 700 }}
          >
            Tiếp tục mua sắm
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px 80px' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        {/* Header Section */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <Space size={8} style={{ marginBottom: 8 }}>
                <Link href="/shop" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <ArrowLeftOutlined style={{ fontSize: 12 }} /> Tiếp tục mua sắm
                </Link>
              </Space>
              <Title level={1} style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Giỏ hàng của bạn
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Bạn có <Text strong>{items.length}</Text> sản phẩm trong danh sách chờ.
              </Text>
            </div>
            
            <Popconfirm
              title="Xóa toàn bộ giỏ hàng?"
              onConfirm={clearCart}
              okText="Xóa tất cả"
              cancelText="Hủy"
            >
              <Button 
                danger 
                type="text" 
                icon={<DeleteOutlined />}
                style={{ borderRadius: 12 }}
              >
                Làm trống giỏ hàng
              </Button>
            </Popconfirm>
          </div>
        </div>

        <Row gutter={[40, 40]}>
          {/* Main Cart Items */}
          <Col xs={24} lg={15}>
            <div className="cart-items-list">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem 
                    key={item._id} 
                    item={item} 
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* AI Recommendations */}
            <AIAddons onAdd={handleFastAdd} />
          </Col>

          {/* Sidebar Summary */}
          <Col xs={24} lg={9}>
            <OrderSummary 
              subtotal={subtotal}
              shippingFee={shippingFee}
              total={total}
              itemCount={items.length}
              onCheckout={handleCheckout}
              freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
