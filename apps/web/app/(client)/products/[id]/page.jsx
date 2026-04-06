'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Button, Rate, Tag, InputNumber, Spin, Form, Input, message, Typography, Avatar, Tooltip } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, ThunderboltFilled, CheckCircleFilled, SafetyCertificateOutlined } from '@ant-design/icons';
import { productAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store/useStore';
import ProductCard from '@/components/product/ProductCard';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetail() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [form] = Form.useForm();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [qty, setQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getById(id).then((r) => r.data),
  });

  if (isLoading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>;

  const { product, similar } = data || {};
  if (!product) return (
    <div style={{ textAlign: 'center', padding: 100, background: 'var(--bg-main)', minHeight: '80vh' }}>
      <Title level={3} style={{ color: 'var(--text-main)' }}>Không tìm thấy sản phẩm</Title>
      <Button onClick={() => router.push('/shop')} type="primary" size="large" style={{ marginTop: 20, background: 'var(--brand-teal)', border: 'none' }}>Quay lại Cửa hàng</Button>
    </div>
  );

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    addItem(product, qty);
    message.success(`Đã thêm ${qty} "${product.name}" vào giỏ hàng!`);
  };

  const handleReview = async (values) => {
    if (!isAuthenticated) return message.warning('Vui lòng đăng nhập để đánh giá');
    try {
      await productAPI.addReview(id, values);
      message.success('Đánh giá thành công!');
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
    }
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button onClick={() => router.back()} style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeftOutlined />
          </button>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            <span onClick={() => router.push('/shop')} style={{ cursor: 'pointer' }}>Cửa hàng</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Chi tiết sản phẩm</span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: '32px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} lg={11}>
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'var(--bg-main)', border: '1px solid var(--border-color)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={product.image || 'https://placehold.co/600x600/f1f5f9/a1a1aa?text=Product'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {discount > 0 && <div style={{ background: '#EF4444', color: 'white', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 999 }}>Tiết kiệm {discount}%</div>}
                  {product.rating >= 4.8 && <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.2)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>⭐ Best Seller</div>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                  <SafetyCertificateOutlined style={{ fontSize: 20, color: 'var(--brand-teal)' }} /> Cam kết chính hãng 100%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                  <CheckCircleFilled style={{ fontSize: 20, color: 'var(--brand-teal)' }} /> Trả hàng trong 7 ngày
                </div>
              </div>
            </Col>

            <Col xs={24} lg={13}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{product.category || 'Danh mục'}</div>
                  {isAuthenticated && (
                    <Tooltip title="AI đánh giá sản phẩm này phù hợp với sở thích của bạn">
                      <div className="bg-gradient-ai" style={{ color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ThunderboltFilled /> 95% Độ tin cậy AI
                      </div>
                    </Tooltip>
                  )}
                </div>

                <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: 16 }}>{product.name}</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 24, borderBottom: '1px dashed var(--border-color)' }}>
                  <Rate disabled value={product.rating || 5} style={{ fontSize: 16, color: '#F59E0B' }} />
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>({product.numReviews || 0} Đánh giá)</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Đã bán <strong style={{ color: 'var(--text-main)' }}>{product.sold || 0}</strong></span>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--brand-teal)', lineHeight: 1 }}>{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span style={{ fontSize: 20, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500 }}>{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>

                <Paragraph style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                  {product.description || 'Chưa có thông tin mô tả chi tiết.'}
                </Paragraph>

                {product.tags && product.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {product.tags.map((tag) => (
                      <span key={tag} style={{ background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}>#{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                  {product.stock > 0 ? (
                    <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Số lượng</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <InputNumber min={1} max={product.stock} value={qty} onChange={setQty} size="large" style={{ width: 80, borderRadius: 8 }} />
                          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>còn {product.stock} sản phẩm</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <Button size="large" icon={<ShoppingCartOutlined />} onClick={handleAddToCart}
                          style={{ flex: 1, height: 56, borderRadius: 12, background: 'white', borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)', fontWeight: 700, fontSize: 16 }}>
                          Thêm Giỏ Hàng
                        </Button>
                        <Button size="large" type="primary" onClick={() => { handleAddToCart(); router.push('/checkout'); }}
                          style={{ flex: 1, height: 56, borderRadius: 12, background: 'var(--brand-teal)', border: 'none', fontWeight: 700, fontSize: 16 }}>
                          Mua Ngay
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#FEF2F2', padding: 24, borderRadius: 16, border: '1px solid #FECACA', textAlign: 'center' }}>
                      <span style={{ color: '#EF4444', fontSize: 18, fontWeight: 700 }}>⚠️ Sản phẩm hiện đang tạm hết hàng</span>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 48, background: 'white', borderRadius: 24, padding: '32px', border: '1px solid var(--border-color)' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} lg={8}>
              <Title level={3} style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 24 }}>Đánh giá & Nhận xét</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{product.rating ? parseFloat(product.rating).toFixed(1) : '5.0'}</span>
                <div>
                  <Rate disabled value={product.rating || 5} style={{ fontSize: 20, color: '#F59E0B', marginBottom: 4 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{product.numReviews || 0} bài đánh giá</div>
                </div>
              </div>
              {isAuthenticated ? (
                <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)' }}>
                  <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Viết đánh giá của bạn</Title>
                  <Form form={form} onFinish={handleReview} layout="vertical">
                    <Form.Item name="rating" label="Chấm điểm" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]} style={{ marginBottom: 16 }}>
                      <Rate style={{ color: '#F59E0B' }} />
                    </Form.Item>
                    <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]} style={{ marginBottom: 16 }}>
                      <Input.TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." style={{ borderRadius: 12, resize: 'none' }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%', height: 44, borderRadius: 10, background: 'var(--ai-purple)', border: 'none', fontWeight: 700 }}>Gửi Đánh Giá</Button>
                  </Form>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>Vui lòng đăng nhập để đánh giá sản phẩm này.</p>
                  <Button onClick={() => router.push('/login')} style={{ background: 'white', borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)', fontWeight: 600, borderRadius: 8 }}>Đăng nhập ngay</Button>
                </div>
              )}
            </Col>

            <Col xs={24} lg={16}>
              {product.reviews && product.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {product.reviews.map((r) => (
                    <div key={r._id} style={{ padding: 24, background: 'var(--bg-main)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Avatar size={48} style={{ background: 'linear-gradient(135deg, var(--ai-purple), var(--ai-pink))', fontWeight: 700 }}>{r.name.charAt(0)}</Avatar>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', marginBottom: 4 }}>{r.name}</div>
                            <Rate disabled defaultValue={r.rating} style={{ fontSize: 12, color: '#F59E0B' }} />
                          </div>
                        </div>
                        <Text type="secondary" style={{ fontSize: 13, background: 'white', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border-color)' }}>
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-main)', fontSize: 15, lineHeight: 1.6, paddingLeft: 60 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-main)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
                  <span style={{ fontSize: 40 }}>💬</span>
                  <h3 style={{ margin: '16px 0 8px', color: 'var(--text-main)' }}>Chưa có đánh giá nào</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hãy là người đầu tiên đánh giá sản phẩm này.</p>
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* Similar Products */}
        {similar?.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div className="bg-gradient-ai" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20 }}>
                <ThunderboltFilled />
              </div>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Gợi Ý Thông Minh</Title>
              <span className="text-gradient-ai" style={{ fontSize: 14, fontWeight: 700 }}>AI Powered</span>
            </div>
            <Row gutter={[24, 24]}>
              {similar.slice(0, 4).map((p, i) => (
                <Col key={p._id} xs={24} sm={12} md={8} lg={6}>
                  <ProductCard product={p} matchPercent={[94, 89, 85, 82][i] || 80} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
