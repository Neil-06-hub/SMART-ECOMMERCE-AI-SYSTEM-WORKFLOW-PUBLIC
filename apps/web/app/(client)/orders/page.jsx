'use client';

import { useState } from 'react';
import { Tag, Empty, Spin, Typography, Button, Modal, message, Tooltip } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import {
  ShoppingOutlined, CalendarOutlined, ClockCircleOutlined,
  CarOutlined, CreditCardOutlined, WalletOutlined, TagOutlined,
  EnvironmentOutlined, PhoneOutlined, UserOutlined, FileTextOutlined,
  ExclamationCircleOutlined, EyeOutlined, CloseCircleOutlined,
  CheckCircleOutlined, RocketOutlined, GiftOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const statusConfig = {
  pending:   { color: '#F59E0B', bg: '#FFFBEB', text: 'Chờ xác nhận',    icon: <ClockCircleOutlined /> },
  paid:      { color: '#8B5CF6', bg: '#F5F3FF', text: 'Đã thanh toán',   icon: <CheckCircleOutlined /> },
  confirmed: { color: '#3B82F6', bg: '#EFF6FF', text: 'Đã xác nhận',     icon: <CheckCircleOutlined /> },
  shipping:  { color: '#06B6D4', bg: '#ECFEFF', text: 'Đang giao hàng',  icon: <RocketOutlined /> },
  delivered: { color: '#22C55E', bg: '#F0FDF4', text: 'Đã giao hàng',    icon: <GiftOutlined /> },
  cancelled: { color: '#EF4444', bg: '#FEF2F2', text: 'Đã hủy',          icon: <CloseCircleOutlined /> },
};

const paymentMethodLabels = {
  COD: { text: 'Tiền mặt (COD)', icon: <CarOutlined />, color: '#0284C7' },
  banking: { text: 'Chuyển khoản', icon: <CreditCardOutlined />, color: '#15803D' },
  momo: { text: 'Ví MoMo', icon: <WalletOutlined />, color: '#DB2777' },
};

const paymentStatusLabels = {
  pending: { text: 'Chờ thanh toán', color: 'orange' },
  paid: { text: 'Đã thanh toán', color: 'green' },
  failed: { text: 'Thất bại', color: 'red' },
};

export default function OrderHistory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderAPI.getMy().then((r) => r.data.orders),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => orderAPI.cancel(id),
    onSuccess: () => {
      message.success('Đã hủy đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setDetailOrder(null);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Không thể hủy đơn hàng'),
  });

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleViewDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await orderAPI.getById(orderId);
      setDetailOrder(res.data.order);
    } catch {
      message.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = (orderId) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác không thể hoàn tác.',
      okText: 'Hủy đơn',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk: () => cancelMutation.mutate(orderId),
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-amber-soft)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>
          <ShoppingOutlined />
        </div>
        <Title level={3} style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Chưa có đơn hàng nào</Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>Hãy khám phá và mua sắm những sản phẩm tuyệt vời!</Text>
        <Button type="primary" size="large" onClick={() => router.push('/shop')}
          style={{ background: 'var(--brand-teal)', border: 'none', height: 48, borderRadius: 12, fontWeight: 700, padding: '0 32px' }}>
          Mua Sắm Ngay
        </Button>
      </div>
    );
  }

  const st = (order) => statusConfig[order.orderStatus] || statusConfig.pending;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="bg-gradient-ai" style={{ width: 8, height: 32, borderRadius: 4 }} />
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Đơn Hàng Của Tôi</Title>
            <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>{orders.length} đơn hàng</Text>
          </div>
        </div>

        {/* Order List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => {
            const s = st(order);
            const pm = paymentMethodLabels[order.paymentMethod] || paymentMethodLabels.COD;
            const code = order._id.slice(-8).toUpperCase();
            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'all 0.2s' }}>
                {/* Order Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: 'var(--bg-elevated)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: 15 }}>#{code}</Text>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {formatDate(order.createdAt)}
                    </Text>
                    <Tag style={{ margin: 0, borderRadius: 8, fontSize: 12, padding: '2px 10px', border: 'none', background: s.bg, color: s.color, fontWeight: 600 }}>
                      {s.icon} <span style={{ marginLeft: 4 }}>{s.text}</span>
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: pm.color, fontSize: 14 }}>{pm.icon}</span>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{pm.text}</Text>
                  </div>
                </div>

                {/* Products */}
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={item.image} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-color)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Text>
                          <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>x{item.quantity} · {formatPrice(item.price)}</Text>
                        </div>
                        <Text strong style={{ fontSize: 13, color: 'var(--brand-teal)', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</Text>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <Text style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>... và {order.items.length - 3} sản phẩm khác</Text>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tổng tiền: </Text>
                    <Text strong style={{ fontSize: 18, color: 'var(--brand-teal)' }}>{formatPrice(order.totalAmount)}</Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['pending', 'paid'].includes(order.orderStatus) && (
                      <Button size="small" danger onClick={() => handleCancel(order._id)} style={{ borderRadius: 8, fontWeight: 600, fontSize: 12 }}>
                        Hủy đơn
                      </Button>
                    )}
                    <Button type="primary" size="small" icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(order._id)}
                      style={{ borderRadius: 8, fontWeight: 600, fontSize: 12, background: 'var(--brand-teal)', border: 'none' }}>
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ORDER DETAIL MODAL ──────────────────────────────────────────── */}
      <Modal
        open={!!detailOrder}
        onCancel={() => setDetailOrder(null)}
        footer={null}
        centered
        width={640}
        loading={detailLoading}
        styles={{ body: { padding: 0 } }}
        title={null}
      >
        {detailOrder && (() => {
          const s = st(detailOrder);
          const pm = paymentMethodLabels[detailOrder.paymentMethod] || paymentMethodLabels.COD;
          const ps = paymentStatusLabels[detailOrder.paymentStatus] || paymentStatusLabels.pending;
          const code = detailOrder._id.slice(-8).toUpperCase();
          return (
            <div style={{ padding: '28px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: '0 0 8px', fontWeight: 800 }}>Chi Tiết Đơn Hàng</Title>
                <Text style={{ color: 'var(--brand-teal)', fontSize: 16, fontWeight: 700 }}>#{code}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag style={{ borderRadius: 8, fontSize: 13, padding: '4px 14px', border: 'none', background: s.bg, color: s.color, fontWeight: 600 }}>
                    {s.icon} <span style={{ marginLeft: 4 }}>{s.text}</span>
                  </Tag>
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ background: 'var(--bg-main)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', gap: 4 }}>
                  {['pending', 'confirmed', 'shipping', 'delivered'].map((step, idx) => {
                    const stepCfg = statusConfig[step];
                    const currentIdx = ['pending', 'confirmed', 'shipping', 'delivered'].indexOf(detailOrder.orderStatus);
                    const isCancelled = detailOrder.orderStatus === 'cancelled';
                    const isPast = !isCancelled && idx <= currentIdx;
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: isPast ? stepCfg.color : '#E5E7EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, margin: '0 auto 4px' }}>
                            {stepCfg.icon}
                          </div>
                          <Text style={{ fontSize: 10, color: isPast ? stepCfg.color : 'var(--text-muted)' }}>{stepCfg.text}</Text>
                        </div>
                        {idx < 3 && <div style={{ height: 2, flex: 1, background: isPast && idx < currentIdx ? stepCfg.color : '#E5E7EB', minWidth: 16 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: 14 }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 4 }}><CalendarOutlined /> Ngày đặt</Text>
                  <Text strong style={{ fontSize: 13 }}>{formatDate(detailOrder.createdAt)}</Text>
                </div>
                <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: 14 }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 4 }}>{pm.icon} Thanh toán</Text>
                  <Text strong style={{ fontSize: 13 }}>{pm.text}</Text>
                  <Tag color={ps.color} style={{ marginLeft: 6, fontSize: 11 }}>{ps.text}</Tag>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ background: 'var(--bg-main)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <Text strong style={{ fontSize: 13, marginBottom: 10, display: 'block' }}><EnvironmentOutlined style={{ color: 'var(--brand-teal)', marginRight: 6 }} />Thông tin giao hàng</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <Text><UserOutlined style={{ marginRight: 8, color: 'var(--text-muted)' }} />{detailOrder.shippingAddress.fullName}</Text>
                  <Text><PhoneOutlined style={{ marginRight: 8, color: 'var(--text-muted)' }} />{detailOrder.shippingAddress.phone}</Text>
                  <Text><EnvironmentOutlined style={{ marginRight: 8, color: 'var(--text-muted)' }} />{detailOrder.shippingAddress.address}, {detailOrder.shippingAddress.city}</Text>
                </div>
                {detailOrder.note && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border-color)' }}>
                    <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}><FileTextOutlined style={{ marginRight: 4 }} />Ghi chú: {detailOrder.note}</Text>
                  </div>
                )}
              </div>

              {/* Products */}
              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ fontSize: 13, marginBottom: 12, display: 'block' }}><ShoppingOutlined style={{ color: 'var(--brand-teal)', marginRight: 6 }} />Sản phẩm ({detailOrder.items.length})</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
                  {detailOrder.items.map((item) => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--bg-main)', borderRadius: 12 }}>
                      <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Text>
                        <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>SL: {item.quantity} × {formatPrice(item.price)}</Text>
                      </div>
                      <Text strong style={{ fontSize: 13, color: 'var(--brand-teal)', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: 'var(--bg-main)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tạm tính</Text>
                  <Text style={{ fontSize: 13 }}>{formatPrice(detailOrder.subtotal)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Phí vận chuyển</Text>
                  <Text style={{ fontSize: 13, color: detailOrder.shippingFee === 0 ? '#22C55E' : undefined }}>
                    {detailOrder.shippingFee === 0 ? 'Miễn phí' : formatPrice(detailOrder.shippingFee)}
                  </Text>
                </div>
                {detailOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#22C55E', fontSize: 13 }}>
                      <TagOutlined style={{ marginRight: 4 }} />Giảm giá {detailOrder.discountCode && <Tag color="success" style={{ fontSize: 11, marginLeft: 4 }}>{detailOrder.discountCode}</Tag>}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#22C55E' }}>-{formatPrice(detailOrder.discount)}</Text>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                  <Text strong style={{ fontSize: 15 }}>Tổng thanh toán</Text>
                  <Text strong style={{ fontSize: 20, color: 'var(--brand-teal)' }}>{formatPrice(detailOrder.totalAmount)}</Text>
                </div>
              </div>

              {/* Actions */}
              {['pending', 'paid'].includes(detailOrder.orderStatus) && (
                <Button danger block size="large" onClick={() => handleCancel(detailOrder._id)}
                  loading={cancelMutation.isPending}
                  style={{ height: 44, borderRadius: 12, fontWeight: 600 }}>
                  Hủy Đơn Hàng
                </Button>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
