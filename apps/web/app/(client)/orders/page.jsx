'use client';

import { Card, Tag, Empty, Spin, Typography, Row, Col, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';

const { Title, Text } = Typography;

const statusConfig = {
  pending:   { color: 'orange', text: 'Chờ xác nhận' },
  paid:      { color: 'purple', text: 'Đã thanh toán' },
  confirmed: { color: 'blue',   text: 'Đã xác nhận' },
  shipping:  { color: 'cyan',   text: 'Đang giao hàng' },
  delivered: { color: 'green',  text: 'Đã giao hàng' },
  cancelled: { color: 'red',    text: 'Đã hủy' },
};

export default function OrderHistory() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderAPI.getMy().then((r) => r.data.orders),
  });

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  if (!data?.length) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <Empty description="Bạn chưa có đơn hàng nào">
          <Button type="primary" onClick={() => router.push('/shop')} style={{ background: '#667eea' }}>Mua sắm ngay</Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 48px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Lịch sử đơn hàng</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.map((order) => {
          const status = statusConfig[order.orderStatus] || statusConfig.pending;
          return (
            <Card key={order._id} style={{ borderRadius: 12 }}
              extra={<Tag color={status.color}>{status.text}</Tag>}
              title={
                <div>
                  <Text strong>Đơn hàng #{order._id.slice(-8).toUpperCase()}</Text>
                  <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  {order.items.map((item) => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
                        <div><Text type="secondary" style={{ fontSize: 12 }}>x{item.quantity} • {formatPrice(item.price)}</Text></div>
                      </div>
                    </div>
                  ))}
                </Col>
                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'right' }}>
                    <div><Text type="secondary">Tổng tiền</Text></div>
                    <Text strong style={{ fontSize: 18, color: '#e53935' }}>{formatPrice(order.totalAmount)}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {order.shippingAddress.fullName} • {order.shippingAddress.city}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
