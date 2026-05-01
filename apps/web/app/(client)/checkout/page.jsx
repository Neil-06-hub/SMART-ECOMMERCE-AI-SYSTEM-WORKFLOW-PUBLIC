'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Typography, message, Space, Tag, Modal } from 'antd';
import {
  CreditCardOutlined, CarOutlined, WalletOutlined, CheckCircleOutlined,
  SafetyCertificateOutlined, TagOutlined, CheckOutlined, ClockCircleOutlined,
  CopyOutlined, ShoppingOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { orderAPI, discountAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store/useStore';

const { Title, Text } = Typography;

const PAYMENT_METHODS = [
  { value: 'COD', icon: <CarOutlined />, bg: '#E0F2FE', color: '#0284C7', title: 'Thanh Toán Khi Nhận Hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi nhận được hàng' },
  { value: 'banking', icon: <CreditCardOutlined />, bg: '#F0FDF4', color: '#15803D', title: 'Chuyển Khoản Ngân Hàng', desc: 'Chuyển khoản trực tiếp 24/7 qua mã QR VietQR' },
  { value: 'momo', icon: <WalletOutlined />, bg: '#FCE7F3', color: '#DB2777', title: 'Ví Điện Tử MoMo', desc: 'Quét mã QR thanh toán qua ứng dụng MoMo' },
];

const BANK_INFO = {
  bankId: 'VCB',
  bankName: 'Vietcombank',
  accountNo: '1234567890',
  accountName: 'SMART ECOMMERCE JSC',
};

export default function Checkout() {
  const [form] = Form.useForm();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [showQRModal, setShowQRModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discountAmount = appliedDiscount?.discountAmount || 0;
  const total = subtotal + shippingFee - discountAmount;

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return message.warning('Vui lòng nhập mã giảm giá');
    setDiscountLoading(true);
    try {
      const res = await discountAPI.validate({ code: discountCode, orderAmount: subtotal });
      setAppliedDiscount(res.data.discount);
      message.success(`Áp dụng thành công! Giảm ${formatPrice(res.data.discount.discountAmount)}`);
    } catch (err) {
      setAppliedDiscount(null);
      message.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setDiscountLoading(false);
    }
  };

  const onFinish = async (values) => {
    if (items.length === 0) return message.error('Giỏ hàng đang trống!');
    setLoading(true);
    try {
      const res = await orderAPI.create({
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: { fullName: values.fullName, phone: values.phone, address: values.address, city: values.city },
        paymentMethod: selectedPayment,
        note: values.note,
        discount: discountAmount,
        discountCode: appliedDiscount?.code || '',
      });
      const order = res.data.order;
      setCreatedOrder(order);
      clearCart();

      if (selectedPayment === 'banking' || selectedPayment === 'momo') {
        setShowQRModal(true);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleQRClose = () => {
    setShowQRModal(false);
    setSuccess(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép!');
  };

  const orderCode = createdOrder?._id?.slice(-8)?.toUpperCase() || '';
  const qrContent = `DH${orderCode}`;
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${total}&addInfo=${qrContent}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  // ─── SUCCESS PAGE ─────────────────────────────────────────────────────────
  if (success && createdOrder) {
    const paymentLabel = PAYMENT_METHODS.find(p => p.value === createdOrder.paymentMethod);
    const isPending = createdOrder.paymentMethod !== 'COD';
    return (
      <div style={{ padding: '80px 24px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '56px 40px', borderRadius: 28, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', maxWidth: 560, width: '100%' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#DCFCE7', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>
            <CheckCircleOutlined />
          </div>
          <Title level={2} style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: 8 }}>Đặt hàng thành công!</Title>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Cảm ơn bạn đã mua sắm tại SmartShop AI
          </p>

          <div style={{ background: 'var(--bg-main)', borderRadius: 16, padding: 20, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Mã đơn hàng</Text>
              <Text strong style={{ fontSize: 14, color: 'var(--brand-teal)' }}>#{orderCode}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tổng tiền</Text>
              <Text strong style={{ fontSize: 14 }}>{formatPrice(createdOrder.totalAmount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Thanh toán</Text>
              <Text strong style={{ fontSize: 14 }}>{paymentLabel?.title?.split('(')[0]?.trim()}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Trạng thái</Text>
              <Tag color={isPending ? 'orange' : 'blue'}>{isPending ? 'Chờ thanh toán' : 'Chờ xác nhận'}</Tag>
            </div>
          </div>

          <Space size="middle" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={() => router.push('/orders')}
              style={{ background: 'var(--brand-teal)', border: 'none', height: 48, borderRadius: 12, fontWeight: 700, padding: '0 28px' }}>
              Xem Đơn Hàng
            </Button>
            <Button size="large" onClick={() => router.push('/shop')}
              style={{ height: 48, borderRadius: 12, fontWeight: 700, padding: '0 28px' }}>
              Tiếp Tục Mua Sắm
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  // ─── CHECKOUT FORM ────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>Thanh Toán</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: 'var(--brand-teal)' }} /> Thông tin thanh toán được mã hóa an toàn 256-bit
          </p>
        </div>

        <Row gutter={[40, 40]}>
          <Col xs={24} lg={14}>
            <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
              {/* Shipping Info */}
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--border-color)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div className="bg-gradient-ai" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>1</div>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Thông Tin Giao Hàng</Title>
                </div>
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="fullName" label={<span style={{ fontWeight: 600 }}>Họ và tên</span>} rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                      <Input size="large" placeholder="Nguyễn Văn A" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>} rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                      <Input size="large" placeholder="0912345678" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="address" label={<span style={{ fontWeight: 600 }}>Địa chỉ chi tiết</span>} rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                  <Input size="large" placeholder="Số nhà, Tên đường, Phường/Xã..." style={{ borderRadius: 10 }} />
                </Form.Item>
                <Form.Item name="city" label={<span style={{ fontWeight: 600 }}>Tỉnh / Thành phố</span>} rules={[{ required: true, message: 'Vui lòng nhập tỉnh thành' }]}>
                  <Input size="large" placeholder="TP. Hồ Chí Minh" style={{ borderRadius: 10 }} />
                </Form.Item>
                <Form.Item name="note" label={<span style={{ fontWeight: 600 }}>Ghi chú <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Không bắt buộc)</span></span>}>
                  <Input.TextArea rows={3} placeholder="Ghi chú thêm..." style={{ borderRadius: 10, resize: 'none' }} />
                </Form.Item>
              </div>

              {/* Payment Method Selection */}
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div className="bg-gradient-ai" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>2</div>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Phương Thức Thanh Toán</Title>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PAYMENT_METHODS.map((opt) => {
                    const isSelected = selectedPayment === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setSelectedPayment(opt.value)}
                        style={{
                          padding: 20, borderRadius: 16, cursor: 'pointer',
                          border: isSelected ? '2px solid var(--brand-teal)' : '2px solid var(--border-color)',
                          background: isSelected ? 'var(--brand-amber-soft)' : 'transparent',
                          display: 'flex', alignItems: 'center', gap: 16,
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                      >
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: opt.bg, color: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{opt.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{opt.title}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{opt.desc}</div>
                        </div>
                        {isSelected && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                            <CheckOutlined />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Form>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={10}>
            <div style={{ borderRadius: 24, position: 'sticky', top: 100, background: 'white', padding: 32, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <Title level={4} style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="bg-gradient-ai" style={{ width: 8, height: 24, borderRadius: 4 }} /> Đơn Hàng Của Bạn
              </Title>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                {items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-main)', border: '1px solid var(--border-color)', flexShrink: 0, position: 'relative' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--text-main)', color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', marginBottom: 4 }}>{item.name}</div>
                      <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 14 }}>{formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>Tạm tính</Text>
                  <Text style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{formatPrice(subtotal)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>Phí vận chuyển</Text>
                  <Text style={{ fontWeight: 700, fontSize: 15, color: shippingFee === 0 ? 'var(--brand-teal)' : 'var(--text-main)' }}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </Text>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#22C55E', fontSize: 15 }}>
                      Giảm giá <Tag color="success" style={{ marginLeft: 4 }}>{appliedDiscount.code}</Tag>
                    </Text>
                    <Text style={{ fontWeight: 700, fontSize: 15, color: '#22C55E' }}>-{formatPrice(discountAmount)}</Text>
                  </div>
                )}
              </div>

              {/* Discount Code Input */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    prefix={<TagOutlined style={{ color: 'var(--text-muted)' }} />}
                    placeholder="Nhập mã giảm giá"
                    value={discountCode}
                    onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setAppliedDiscount(null); }}
                    onPressEnter={handleApplyDiscount}
                    style={{ borderRadius: 10, flex: 1 }}
                    disabled={!!appliedDiscount}
                  />
                  <Button
                    onClick={appliedDiscount ? () => { setAppliedDiscount(null); setDiscountCode(''); } : handleApplyDiscount}
                    loading={discountLoading}
                    type={appliedDiscount ? 'default' : 'primary'}
                    danger={!!appliedDiscount}
                    style={{ borderRadius: 10, fontWeight: 600 }}
                  >
                    {appliedDiscount ? 'Bỏ' : 'Áp dụng'}
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                <Text style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-main)' }}>Tổng thanh toán</Text>
                <Text style={{ fontWeight: 800, fontSize: 32, color: 'var(--brand-teal)', lineHeight: 1 }}>{formatPrice(total)}</Text>
              </div>

              <Button type="primary" block size="large" loading={loading} onClick={() => form.submit()}
                style={{ height: 60, borderRadius: 16, background: 'var(--brand-teal)', border: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 8px 16px rgba(234, 88, 12, 0.2)' }}>
                Xác Nhận & Đặt Hàng
              </Button>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>Nhấn "Đặt Hàng" đồng nghĩa bạn chấp nhận Điều Kiện & Điều Khoản của chúng tôi.</p>
            </div>
          </Col>
        </Row>
      </div>

      {/* ── QR PAYMENT MODAL ─────────────────────────────────────────────── */}
      <Modal
        open={showQRModal}
        onCancel={handleQRClose}
        footer={null}
        centered
        width={480}
        closable={false}
        maskClosable={false}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '32px 28px', textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedPayment === 'momo' ? '#FCE7F3' : '#E0F2FE', color: selectedPayment === 'momo' ? '#DB2777' : '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px' }}>
              {selectedPayment === 'momo' ? <WalletOutlined /> : <CreditCardOutlined />}
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
              {selectedPayment === 'momo' ? 'Thanh Toán Qua MoMo' : 'Chuyển Khoản Ngân Hàng'}
            </Title>
            <Text style={{ color: 'var(--text-muted)', fontSize: 13 }}>Quét mã QR bên dưới để thanh toán</Text>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 20, border: '1px solid var(--border-color)', display: 'inline-block' }}>
            <img
              src={qrUrl}
              alt="QR Thanh toán"
              style={{ width: 220, height: 220, objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div style={{ background: 'var(--bg-main)', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
            {[
              { label: 'Ngân hàng', val: BANK_INFO.bankName },
              { label: 'Số tài khoản', val: BANK_INFO.accountNo, copy: true },
              { label: 'Chủ tài khoản', val: BANK_INFO.accountName },
              { label: 'Số tiền', val: formatPrice(total) },
              { label: 'Nội dung CK', val: qrContent, copy: true },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                <Text style={{ color: 'var(--text-muted)' }}>{row.label}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text strong style={{ fontSize: 13 }}>{row.val}</Text>
                  {row.copy && (
                    <CopyOutlined onClick={() => copyToClipboard(row.val)} style={{ cursor: 'pointer', color: 'var(--brand-teal)', fontSize: 14 }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button block size="large" onClick={handleQRClose} icon={<ClockCircleOutlined />}
              style={{ height: 48, borderRadius: 12, fontWeight: 600 }}>
              Thanh toán sau
            </Button>
            <Button type="primary" block size="large" onClick={handleQRClose} icon={<CheckCircleOutlined />}
              style={{ height: 48, borderRadius: 12, fontWeight: 700, background: '#22C55E', border: 'none' }}>
              Tôi đã thanh toán
            </Button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 12 }}>
            Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán
          </p>
        </div>
      </Modal>
    </div>
  );
}
