'use client';

import { useState } from 'react';
import { Form, Input, Button, Radio, Row, Col, Typography, message, Space, Tag } from 'antd';
import { CreditCardOutlined, CarOutlined, WalletOutlined, CheckCircleOutlined, SafetyCertificateOutlined, TagOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { orderAPI, discountAPI } from '@/lib/api';
import { useCartStore } from '@/store/useStore';

const { Title, Text } = Typography;

export default function Checkout() {
  const [form] = Form.useForm();
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discountAmount = appliedDiscount?.discountAmount || 0;
  const total = subtotal + shippingFee - discountAmount;

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
      await orderAPI.create({
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: { fullName: values.fullName, phone: values.phone, address: values.address, city: values.city },
        paymentMethod: values.paymentMethod,
        note: values.note,
        discount: discountAmount,
        discountCode: appliedDiscount?.code || '',
      });
      clearCart();
      setSuccess(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '100px 24px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', maxWidth: 640 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#DCFCE7', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, margin: '0 auto 32px' }}>
            <CheckCircleOutlined />
          </div>
          <Title level={2} style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: 16 }}>Đặt hàng thành công!</Title>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>Cảm ơn bạn đã tin tưởng mua sắm. Mã đơn hàng của bạn đã được gửi qua email.</p>
          <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" size="large" onClick={() => router.push('/orders')} style={{ background: 'var(--brand-teal)', border: 'none', height: 50, borderRadius: 12, fontWeight: 700, padding: '0 32px' }}>Xem Đơn Hàng</Button>
            <Button size="large" onClick={() => router.push('/shop')} style={{ height: 50, borderRadius: 12, fontWeight: 700, padding: '0 32px' }}>Tiếp Tục Mua Sắm</Button>
          </Space>
        </div>
      </div>
    );
  }

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
            <Form form={form} onFinish={onFinish} layout="vertical" initialValues={{ paymentMethod: 'COD' }} requiredMark={false}>
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

              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div className="bg-gradient-ai" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>2</div>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Phương Thức Thanh Toán</Title>
                </div>
                <Form.Item name="paymentMethod" style={{ marginBottom: 0 }}>
                  <Radio.Group style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { value: 'COD', icon: <CarOutlined />, bg: '#E0F2FE', color: '#0284C7', title: 'Thanh Toán Bằng Tiền Mặt (COD)', desc: 'Thanh toán khi nhận được hàng' },
                      { value: 'banking', icon: <CreditCardOutlined />, bg: '#F1F5F9', color: '#475569', title: 'Chuyển Khoản Ngân Hàng', desc: 'Chuyển khoản trực tiếp 24/7 qua mã QR' },
                      { value: 'momo', icon: <WalletOutlined />, bg: '#FCE7F3', color: '#DB2777', title: 'Ví Điện Tử MoMo', desc: 'Quét mã QR qua app MoMo' },
                    ].map((opt) => (
                      <Radio.Button key={opt.value} value={opt.value} style={{ height: 'auto', padding: 20, borderRadius: 16, border: '2px solid var(--border-color)', background: 'transparent', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: opt.bg, color: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{opt.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{opt.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{opt.desc}</div>
                          </div>
                        </div>
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </div>
            </Form>
          </Col>

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
    </div>
  );
}
