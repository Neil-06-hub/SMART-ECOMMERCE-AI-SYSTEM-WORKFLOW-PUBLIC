'use client';

import {
  App,
  Button,
  Card,
  Col,
  InputNumber,
  Popconfirm,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  ThunderboltFilled,
  TruckOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';
import { useAuthStore, useCartStore } from '@/store/useStore';

const { Paragraph, Text, Title } = Typography;

const FREE_SHIPPING_THRESHOLD = 500000;

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

export default function Cart() {
  const router = useRouter();
  const { message } = App.useApp();
  const { isAuthenticated } = useAuthStore();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;
  const total = subtotal + shippingFee;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để thanh toán.');
      router.push('/login');
      return;
    }

    router.push('/checkout');
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 280 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 16,
              overflow: 'hidden',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              flexShrink: 0,
            }}
          >
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)', marginBottom: 6 }}>
              {item.name}
            </div>
            <Tag color="orange" style={{ margin: 0, borderRadius: 999 }}>
              {item.category || 'Sản phẩm'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      render: (price) => <Text strong style={{ color: 'var(--text-main)' }}>{formatPrice(price)}</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      render: (quantity, item) => (
        <InputNumber
          min={1}
          max={item.stock || 99}
          value={quantity}
          onChange={(value) => updateQuantity(item._id, value || 1)}
          style={{ width: 88, borderRadius: 10 }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      render: (_, item) => (
        <Text strong style={{ color: 'var(--brand-teal)', fontSize: 16 }}>
          {formatPrice(item.price * item.quantity)}
        </Text>
      ),
    },
    {
      title: '',
      align: 'right',
      render: (_, item) => (
        <Popconfirm
          title="Xóa sản phẩm này khỏi giỏ hàng?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => removeItem(item._id)}
        >
          <Button danger icon={<DeleteOutlined />} type="text" style={{ borderRadius: 10 }} />
        </Popconfirm>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-main)', minHeight: '80vh', padding: '56px 24px' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <InsightEmptyState
            title="Giỏ hàng của bạn đang trống"
            description="Hãy thêm vài sản phẩm để hệ thống bắt đầu tính tổng đơn, phí giao hàng và các ưu đãi liên quan."
            actionLabel="Khám phá cửa hàng"
            onAction={() => router.push('/shop')}
            icon={<ShoppingOutlined />}
            accentColor="#0F766E"
            accentBackground="rgba(13, 148, 136, 0.12)"
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '32px 24px 56px' }}>
      <div className="container" style={{ maxWidth: 1320 }}>
        <div
          style={{
            marginBottom: 24,
            borderRadius: 28,
            padding: '28px 28px 24px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 60%, #ECFEFF 100%)',
            border: '1px solid rgba(231, 217, 200, 0.9)',
            boxShadow: '0 24px 48px rgba(131, 61, 7, 0.06)',
          }}
        >
          <Row gutter={[20, 20]} align="middle">
            <Col xs={24} xl={16}>
              <Space size={10} wrap style={{ marginBottom: 14 }}>
                <Tag color="orange" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5, fontWeight: 700 }}>
                  <ShoppingOutlined /> Checkout staging
                </Tag>
              </Space>
              <Title level={1} style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
                Hoàn thiện đơn hàng với bố cục rõ ràng và ít ma sát hơn.
              </Title>
              <Paragraph style={{ margin: '14px 0 0', maxWidth: 760, fontSize: 16, color: 'var(--text-muted)' }}>
                Giỏ hàng nên trả lời nhanh ba câu hỏi: đang có gì, còn thiếu bao nhiêu để đạt ưu đãi, và bước tiếp theo là gì. Phần summary bên phải được tối ưu theo đúng logic đó.
              </Paragraph>
            </Col>

            <Col xs={24} xl={8}>
              <Row gutter={[12, 12]}>
                <Col xs={12}>
                  <Card bodyStyle={{ padding: 18 }} style={{ borderRadius: 22, border: '1px solid var(--border-color)' }}>
                    <Text type="secondary">Dòng sản phẩm</Text>
                    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{items.length}</div>
                    <Text style={{ color: 'var(--text-muted)' }}>Số item đang chờ thanh toán</Text>
                  </Card>
                </Col>
                <Col xs={12}>
                  <Card bodyStyle={{ padding: 18 }} style={{ borderRadius: 22, border: '1px solid var(--border-color)' }}>
                    <Text type="secondary">Tổng tạm tính</Text>
                    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--brand-teal)' }}>{formatPrice(subtotal)}</div>
                    <Text style={{ color: 'var(--text-muted)' }}>Chưa gồm phí giao hàng</Text>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <Space size={[8, 8]} wrap>
            <Tag color="blue" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5 }}>
              <TruckOutlined /> Giao hàng toàn quốc
            </Tag>
            <Tag color="green" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5 }}>
              <SafetyCertificateOutlined /> Thanh toán bảo mật
            </Tag>
          </Space>

          <Popconfirm
            title="Xóa toàn bộ sản phẩm trong giỏ?"
            okText="Xóa tất cả"
            cancelText="Hủy"
            onConfirm={clearCart}
          >
            <Button danger>Xóa tất cả</Button>
          </Popconfirm>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              bodyStyle={{ padding: 24 }}
              style={{ borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)' }}
            >
              <Table
                columns={columns}
                dataSource={items}
                rowKey="_id"
                pagination={false}
                scroll={{ x: 760 }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card
                bodyStyle={{ padding: 24 }}
                style={{ borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)' }}
              >
                <Space size={10} style={{ marginBottom: 18 }}>
                  <div
                    className="bg-gradient-ai"
                    style={{
                      width: 12,
                      height: 40,
                      borderRadius: 999,
                    }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    Tóm tắt đơn hàng
                  </Title>
                </Space>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Text type="secondary">Tạm tính ({items.length} sản phẩm)</Text>
                    <Text strong>{formatPrice(subtotal)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Text type="secondary">Phí giao hàng</Text>
                    <Text strong style={{ color: shippingFee === 0 ? '#059669' : 'var(--text-main)' }}>
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </Text>
                  </div>
                </div>

                <Card
                  bodyStyle={{ padding: 16 }}
                  style={{ borderRadius: 18, background: '#FFF7ED', border: '1px solid #F5E4D3', marginBottom: 20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <ThunderboltFilled style={{ color: 'var(--brand-teal)' }} />
                    <Text strong style={{ color: '#9A3412' }}>Ưu đãi giao hàng</Text>
                  </div>
                  <Paragraph style={{ marginBottom: 10, color: '#9A3412' }}>
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? 'Bạn đã đạt ngưỡng miễn phí giao hàng.'
                      : `Mua thêm ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí giao hàng.`}
                  </Paragraph>
                  <Progress percent={freeShippingProgress} showInfo={false} strokeColor="var(--brand-teal)" trailColor="#FDE7CF" />
                </Card>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                  <div>
                    <Text type="secondary">Tổng thanh toán</Text>
                    <div style={{ marginTop: 6, fontSize: 32, fontWeight: 800, color: 'var(--brand-teal)', lineHeight: 1 }}>
                      {formatPrice(total)}
                    </div>
                    <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>Đã bao gồm VAT</Text>
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={handleCheckout}
                  style={{ height: 54, borderRadius: 14, fontWeight: 700 }}
                >
                  Tiến hành thanh toán
                </Button>
              </Card>

              <Card
                bodyStyle={{ padding: 18 }}
                style={{
                  borderRadius: 22,
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  border: 'none',
                }}
              >
                <Text style={{ color: 'white', fontWeight: 800, display: 'block', marginBottom: 8 }}>
                  Trước khi thanh toán
                </Text>
                <Paragraph style={{ marginBottom: 0, color: 'rgba(255,255,255,0.75)' }}>
                  Kiểm tra lại số lượng và wishlist để tránh bỏ sót sản phẩm muốn mua cùng đơn hàng.
                </Paragraph>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
