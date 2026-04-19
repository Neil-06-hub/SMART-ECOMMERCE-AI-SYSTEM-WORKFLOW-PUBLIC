'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Row,
  Col,
  Button,
  Rate,
  Tag,
  InputNumber,
  Form,
  Input,
  message,
  Typography,
  Avatar,
  Tooltip,
  Divider,
} from 'antd';
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { productAPI, aiAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store/useStore';
import AIRecCard from '@/components/ai/AIRecCard';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const { Title, Text, Paragraph } = Typography;

function formatPrice(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;
}

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function splitConfigValue(value = '') {
  return value
    .split(/[\/,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function extractConfigGroups(product) {
  const specs = product?.specs || [];
  const keys = ['ram', 'bo nho', 'o cung', 'mau', 'man hinh', 'ket noi', 'chat lieu', 'pin'];

  return specs
    .filter((spec) => keys.some((key) => normalizeText(spec.name).includes(key)))
    .slice(0, 4)
    .map((spec) => ({
      label: spec.name,
      options: splitConfigValue(spec.value).length > 0 ? splitConfigValue(spec.value) : [spec.value],
    }));
}

function buildSpecHighlights(product) {
  return (product?.specs || []).slice(0, 6);
}

function buildNeedTags(product) {
  const tags = product?.tags || [];
  return tags.slice(0, 4).map((tag) => tag.replace(/-/g, ' '));
}

function buildSimilarReasons(baseProduct, similarProduct) {
  const reasons = [];

  if (baseProduct?.category && similarProduct?.category === baseProduct.category) {
    reasons.push(`Cùng nhóm ${baseProduct.category}`);
  }

  const priceDiff = Math.abs((similarProduct?.price || 0) - (baseProduct?.price || 0));
  const priceBase = baseProduct?.price || 1;
  if (priceDiff / priceBase <= 0.15) reasons.push('Tầm giá tương đương');

  const sharedTag = (similarProduct?.tags || []).find((tag) => (baseProduct?.tags || []).includes(tag));
  if (sharedTag) reasons.push(`Chung chủ đề ${sharedTag.replace(/-/g, ' ')}`);

  if ((similarProduct?.rating || 0) >= 4.7) reasons.push('Đánh giá rất tốt');

  return reasons.slice(0, 3);
}

export default function ClientProductDetail({ initialProductData, id }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { addItem, items: cartItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [qty, setQty] = useState(1);

  const { product, similar } = initialProductData || {};
  const gallery = product?.images?.length ? product.images : [product?.image].filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0] || product?.image);

  const configGroups = useMemo(() => extractConfigGroups(product), [product]);
  const specHighlights = useMemo(() => buildSpecHighlights(product), [product]);
  const needTags = useMemo(() => buildNeedTags(product), [product]);

  const [selectedConfig, setSelectedConfig] = useState(() =>
    configGroups.reduce((acc, group) => {
      acc[group.label] = group.options[0];
      return acc;
    }, {})
  );

  if (!product) {
    return (
      <div style={{ padding: '72px 24px', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <div className="container">
          <InsightEmptyState
            title="Không tìm thấy sản phẩm"
            description="Sản phẩm có thể đã bị ẩn hoặc không còn tồn tại trong hệ thống."
            actionLabel="Quay lại cửa hàng"
            onAction={() => router.push('/shop')}
          />
        </div>
      </div>
    );
  }

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const inCart = cartItems.find((i) => i._id === product._id)?.quantity || 0;
    if (inCart + qty > product.stock) {
      message.warning(`Chỉ còn ${product.stock} sản phẩm (bạn đã có ${inCart} trong giỏ)`);
      return;
    }
    addItem(product, qty);
    message.success(`Đã thêm ${qty} "${product.name}" vào giỏ hàng`);

    if (isAuthenticated) {
      aiAPI.trackActivity({ productId: product._id, action: 'add_cart', placement: 'pdp' }).catch(() => {});
    }
  };

  const handleReview = async (values) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      await productAPI.addReview(id, values);
      message.success('Đánh giá thành công');
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    }
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px 72px' }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button
            onClick={() => router.back()}
            style={{ width: 42, height: 42, borderRadius: '50%', background: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeftOutlined />
          </button>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            <span onClick={() => router.push('/shop')} style={{ cursor: 'pointer' }}>Cửa hàng</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Chi tiết sản phẩm</span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 28, padding: 32, border: '1px solid var(--border-color)', boxShadow: '0 18px 36px rgba(131, 61, 7, 0.06)' }}>
          <Row gutter={[40, 40]}>
            <Col xs={24} lg={11}>
              <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)', border: '1px solid var(--border-color)', aspectRatio: '1 / 1' }}>
                <img
                  src={activeImage || 'https://placehold.co/700x700/f7f3ee/9a8b7a?text=Product'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {discount > 0 ? (
                    <div style={{ background: '#EF4444', color: 'white', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 999 }}>
                      Tiết kiệm {discount}%
                    </div>
                  ) : null}
                  {(product.rating || 0) >= 4.8 ? (
                    <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.2)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                      ⭐ Best Seller
                    </div>
                  ) : null}
                </div>
              </div>

              {gallery.length > 1 ? (
                <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                  {gallery.map((image) => (
                    <button
                      key={image}
                      onClick={() => setActiveImage(image)}
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: image === activeImage ? '2px solid var(--brand-teal)' : '1px solid var(--border-color)',
                        padding: 0,
                        background: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                  <SafetyCertificateOutlined style={{ fontSize: 20, color: 'var(--brand-teal)' }} />
                  Cam kết chính hãng
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                  <CheckCircleFilled style={{ fontSize: 20, color: 'var(--brand-teal)' }} />
                  Đổi trả trong 7 ngày
                </div>
              </div>
            </Col>

            <Col xs={24} lg={13}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {product.category || 'Danh mục'}
                  </div>
                  {isAuthenticated ? (
                    <Tooltip title="AI đánh giá sản phẩm này phù hợp với sở thích hiện tại của bạn">
                      <div className="bg-gradient-ai" style={{ color: 'white', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ThunderboltFilled /> 95% độ tin cậy AI
                      </div>
                    </Tooltip>
                  ) : null}
                </div>

                <h1 style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.25, marginBottom: 16 }}>
                  {product.name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 22, borderBottom: '1px dashed var(--border-color)', flexWrap: 'wrap' }}>
                  <Rate disabled value={product.rating || 5} style={{ fontSize: 16, color: '#F59E0B' }} />
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>({product.numReviews || 0} đánh giá)</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1', display: 'inline-block' }} />
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Đã bán <strong style={{ color: 'var(--text-main)' }}>{product.sold || 0}</strong></span>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1 }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price ? (
                      <span style={{ fontSize: 20, color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500 }}>
                        {formatPrice(product.originalPrice)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <Paragraph style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
                  {product.description || 'Chưa có thông tin mô tả chi tiết.'}
                </Paragraph>

                {needTags.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                    {needTags.map((tag) => (
                      <span key={tag} style={{ background: '#FFF7ED', color: '#9A3412', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, border: '1px solid #F5DEC5' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} xl={14}>
                    <div style={{ background: 'var(--bg-main)', borderRadius: 22, padding: 22, border: '1px solid var(--border-color)', height: '100%' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Cấu hình / Biến thể hiển thị</Title>
                        <Paragraph style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
                          Sẵn sàng cho schema `variants[]`; hiện đang đọc từ `specs` để giúp người dùng so sánh nhanh.
                        </Paragraph>
                      </div>

                      {configGroups.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {configGroups.map((group) => (
                            <div key={group.label}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                                {group.label}
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {group.options.map((option) => {
                                  const active = selectedConfig[group.label] === option;
                                  return (
                                    <button
                                      key={option}
                                      onClick={() => setSelectedConfig((prev) => ({ ...prev, [group.label]: option }))}
                                      style={{
                                        borderRadius: 999,
                                        padding: '8px 14px',
                                        border: active ? '1px solid var(--brand-teal)' : '1px solid var(--border-color)',
                                        background: active ? '#FFF4E8' : 'white',
                                        color: active ? '#9A3412' : 'var(--text-main)',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                          {specHighlights.map((spec) => (
                            <div key={spec.name} style={{ borderRadius: 16, background: 'white', border: '1px solid var(--border-color)', padding: 14 }}>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{spec.name}</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>{spec.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col xs={24} xl={10}>
                    <div style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)', borderRadius: 22, padding: 22, border: '1px solid #F1D9BF', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Mua nhanh & trạng thái</Title>
                        <Paragraph style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
                          Ưu tiên quyết định nhanh: tồn kho, giao hàng và CTA luôn ở cùng một cụm.
                        </Paragraph>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        <Tag color={product.stock > 0 ? 'green' : 'red'} style={{ margin: 0, borderRadius: 999, paddingInline: 12, paddingBlock: 6, fontWeight: 700 }}>
                          {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Tạm hết hàng'}
                        </Tag>
                        <Tag color="blue" style={{ margin: 0, borderRadius: 999, paddingInline: 12, paddingBlock: 6, fontWeight: 700 }}>
                          <RocketOutlined /> Giao nhanh nội thành
                        </Tag>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Số lượng</span>
                        <InputNumber min={1} max={product.stock || 1} value={qty} onChange={setQty} size="large" style={{ width: 92, borderRadius: 12 }} />
                      </div>

                      <Divider style={{ margin: 0, borderColor: '#F3DCC5' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-muted)', fontSize: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <SafetyCertificateOutlined style={{ color: 'var(--brand-teal)' }} />
                          Chính hãng 100%
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircleFilled style={{ color: 'var(--brand-teal)' }} />
                          Hỗ trợ đổi trả trong 7 ngày
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {product.stock > 0 ? (
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 'auto' }}>
                    <Button
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleAddToCart}
                      style={{ flex: 1, minWidth: 220, height: 56, borderRadius: 16, background: 'white', borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)', fontWeight: 800, fontSize: 16 }}
                    >
                      Thêm Giỏ Hàng
                    </Button>
                    <Button
                      size="large"
                      type="primary"
                      onClick={() => {
                        handleAddToCart();
                        router.push('/checkout');
                      }}
                      style={{ flex: 1, minWidth: 220, height: 56, borderRadius: 16, fontWeight: 800, fontSize: 16 }}
                    >
                      Mua Ngay
                    </Button>
                  </div>
                ) : (
                  <div style={{ background: '#FEF2F2', padding: 20, borderRadius: 18, border: '1px solid #FECACA', textAlign: 'center' }}>
                    <span style={{ color: '#EF4444', fontSize: 18, fontWeight: 700 }}>Sản phẩm hiện đang tạm hết hàng</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ marginTop: 48, background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--border-color)' }}>
          <Row gutter={[40, 40]}>
            <Col xs={24} lg={8}>
              <Title level={3} style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 24 }}>Đánh giá & Nhận xét</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {product.rating ? parseFloat(product.rating).toFixed(1) : '5.0'}
                </span>
                <div>
                  <Rate disabled value={product.rating || 5} style={{ fontSize: 20, color: '#F59E0B', marginBottom: 4 }} />
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{product.numReviews || 0} bài đánh giá</div>
                </div>
              </div>

              {isAuthenticated ? (
                <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 18, border: '1px solid var(--border-color)' }}>
                  <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Viết đánh giá của bạn</Title>
                  <Form form={form} onFinish={handleReview} layout="vertical">
                    <Form.Item name="rating" label="Chấm điểm" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]} style={{ marginBottom: 16 }}>
                      <Rate style={{ color: '#F59E0B' }} />
                    </Form.Item>
                    <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]} style={{ marginBottom: 16 }}>
                      <Input.TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." style={{ borderRadius: 14, resize: 'none' }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%', height: 46, borderRadius: 12, fontWeight: 700 }}>
                      Gửi Đánh Giá
                    </Button>
                  </Form>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 18, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>Vui lòng đăng nhập để đánh giá sản phẩm này.</p>
                  <Button onClick={() => router.push('/login')} style={{ background: 'white', borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)', fontWeight: 600, borderRadius: 10 }}>
                    Đăng nhập ngay
                  </Button>
                </div>
              )}
            </Col>

            <Col xs={24} lg={16}>
              {product.reviews && product.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {product.reviews.map((review) => (
                    <div key={review._id} style={{ padding: 24, background: 'var(--bg-main)', borderRadius: 18, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Avatar size={48} style={{ background: 'linear-gradient(135deg, var(--ai-purple), var(--ai-pink))', fontWeight: 700 }}>
                            {review.name.charAt(0)}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', marginBottom: 4 }}>{review.name}</div>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12, color: '#F59E0B' }} />
                          </div>
                        </div>
                        <Text type="secondary" style={{ fontSize: 13, background: 'white', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border-color)' }}>
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-main)', fontSize: 15, lineHeight: 1.7, paddingLeft: 60 }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <InsightEmptyState
                  compact
                  title="Chưa có đánh giá nào"
                  description="Hãy là người đầu tiên chia sẻ trải nghiệm về sản phẩm này."
                />
              )}
            </Col>
          </Row>
        </div>

        <div style={{ marginTop: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
            <div className="bg-gradient-ai" style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20 }}>
              <ThunderboltFilled />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Sản phẩm tương tự do AI gợi ý</Title>
              <Paragraph style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
                Ưu tiên các món gần phong cách, mức giá và ngữ cảnh xem hiện tại.
              </Paragraph>
            </div>
          </div>

          {similar?.length > 0 ? (
            <Row gutter={[24, 24]}>
              {similar.slice(0, 4).map((item, index) => (
                <Col key={item._id} xs={24} sm={12} md={12} lg={6}>
                  <AIRecCard
                    product={item}
                    placement="pdp"
                    matchPercent={[96, 92, 89, 85][index] || 84}
                    reasonTitle="Lý do sản phẩm này được đặt cạnh món bạn đang xem"
                    reasons={buildSimilarReasons(product, item)}
                    source="model"
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <InsightEmptyState
              title="Chưa có sản phẩm tương tự"
              description="Khu vực này sẽ hiện các món gần phong cách hoặc mức giá khi hệ thống có đủ tín hiệu liên quan."
            />
          )}
        </div>
      </div>
    </div>
  );
}
