'use client';

import { Table, Button, InputNumber, Typography, Row, Col, Popconfirm, message } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/store/useStore';

const { Title, Text } = Typography;

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để thanh toán');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  const columns = [
    {
      title: 'Sản phẩm', dataIndex: 'name',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-main)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)', marginBottom: 4 }}>{item.name}</div>
            <span style={{ fontSize: 13, color: 'var(--brand-teal)', fontWeight: 600, background: 'var(--bg-main)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-color)' }}>{item.category || 'Sản Phẩm'}</span>
          </div>
        </div>
      ),
    },
    { title: 'Đơn giá', dataIndex: 'price', render: (price) => <Text style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{formatPrice(price)}</Text> },
    {
      title: 'Số lượng', dataIndex: 'quantity',
      render: (qty, item) => <InputNumber min={1} max={item.stock} value={qty} onChange={(v) => updateQuantity(item._id, v)} style={{ width: 80, borderRadius: 8 }} size="middle" />,
    },
    { title: 'Thành tiền', render: (_, item) => <Text style={{ fontWeight: 800, fontSize: 16, color: 'var(--brand-teal)' }}>{formatPrice(item.price * item.quantity)}</Text> },
    {
      title: '', render: (_, item) => (
        <Popconfirm title="Xóa sản phẩm này khỏi giỏ hàng?" onConfirm={() => removeItem(item._id)} okText="Xóa" cancelText="Hủy">
          <Button danger icon={<DeleteOutlined />} type="text" style={{ borderRadius: 8 }} />
        </Popconfirm>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <div style={{ padding: '100px 24px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: 60, borderRadius: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', maxWidth: 600, width: '100%' }}>
          <div style={{ width: 120, height: 120, margin: '0 auto 32px', background: 'var(--bg-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />
          </div>
          <Title level={3} style={{ color: 'var(--text-main)', marginBottom: 12, fontWeight: 800 }}>Giỏ Hàng Trống</Title>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Button type="primary" size="large" onClick={() => router.push('/shop')} style={{ background: 'var(--brand-teal)', border: 'none', height: 56, padding: '0 40px', borderRadius: 14, fontWeight: 700, fontSize: 16 }}>
            Tiếp Tục Mua Sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>Giỏ Hàng Của Bạn</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15 }}>Bạn đang có <strong style={{ color: 'var(--brand-teal)' }}>{items.length}</strong> sản phẩm</p>
          </div>
          <Popconfirm title="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ?" onConfirm={clearCart} okText="Xóa tất cả" cancelText="Hủy">
            <Button danger type="text" style={{ fontWeight: 600, padding: '0 16px', height: 40, borderRadius: 10 }}>Xóa Tất Cả</Button>
          </Popconfirm>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid var(--border-color)' }}>
              <Table columns={columns} dataSource={items} rowKey="_id" pagination={false} style={{ minHeight: 300 }} />
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ borderRadius: 24, position: 'sticky', top: 100, background: 'white', padding: 32, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <Title level={4} style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="bg-gradient-ai" style={{ width: 8, height: 24, borderRadius: 4 }} /> Tổng Đơn Hàng
              </Title>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, borderBottom: '1px dashed var(--border-color)', paddingBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>Tạm tính ({items.length} sản phẩm)</Text>
                  <Text style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{formatPrice(subtotal)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>Phí vận chuyển</Text>
                  <Text style={{ fontWeight: 700, fontSize: 15, color: shippingFee === 0 ? 'var(--brand-teal)' : 'var(--text-main)' }}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </Text>
                </div>
              </div>

              {subtotal < 500000 && (
                <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 12, marginBottom: 24, border: '1px solid var(--border-color)' }}>
                  <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ThunderboltFilled style={{ color: 'var(--brand-teal)' }} /> Mua thêm <strong style={{ color: 'var(--brand-teal)' }}>{formatPrice(500000 - subtotal)}</strong> để được Miễn phí giao hàng
                  </Text>
                  <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${(subtotal / 500000) * 100}%`, height: '100%', background: 'var(--brand-teal)', borderRadius: 999 }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <Text style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-main)' }}>Tổng cộng</Text>
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ fontWeight: 800, fontSize: 32, color: 'var(--brand-teal)', lineHeight: 1, display: 'block' }}>{formatPrice(total)}</Text>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(Đã bao gồm VAT)</span>
                </div>
              </div>

              <Button type="primary" block size="large" icon={<ArrowRightOutlined />} onClick={handleCheckout}
                style={{ height: 56, borderRadius: 14, background: 'var(--brand-teal)', border: 'none', fontWeight: 700, fontSize: 16 }}>
                Tiến Hành Thanh Toán
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
