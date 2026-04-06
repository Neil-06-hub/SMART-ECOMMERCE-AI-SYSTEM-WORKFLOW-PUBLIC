'use client';

import { Row, Col, Input, Select, Slider, Button, Radio, Spin, Typography, Form } from 'antd';
import { ThunderboltFilled, RobotOutlined, CheckCircleFilled, LockOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/useStore';
import { aiAPI, authAPI } from '@/lib/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function AISuggest() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { isAuthenticated, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: () => aiAPI.getRecommendations().then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const savePrefMutation = useMutation({
    mutationFn: (preferences) => authAPI.updateProfile({ preferences }),
    onSuccess: (res) => {
      updateUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['aiRecommendations'] });
    },
  });

  const onFinish = (values) => {
    const preferences = [...(values.styles || []), ...(values.colors || [])].filter(Boolean);
    savePrefMutation.mutate(preferences);
  };

  const products = data?.products || [];
  const resultType = data?.type;
  const resultMessage = data?.message;
  const loading = isLoading || isFetching || savePrefMutation.isPending;

  if (!isAuthenticated) {
    return (
      <div style={{ background: 'var(--bg-main)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', maxWidth: 500 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ai-purple), var(--ai-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>
            <LockOutlined style={{ color: 'white' }} />
          </div>
          <Title level={3} style={{ fontWeight: 800, color: 'var(--text-main)' }}>Đăng nhập để dùng AI Gợi ý</Title>
          <Paragraph style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
            Hệ thống AI sẽ phân tích lịch sử và sở thích của bạn để gợi ý những sản phẩm phù hợp nhất.
          </Paragraph>
          <Button type="primary" size="large" onClick={() => router.push('/login')}
            className="bg-gradient-ai" style={{ border: 'none', height: 50, borderRadius: 12, fontWeight: 700, padding: '0 40px' }}>
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(234, 88, 12, 0.1)', color: 'var(--brand-teal)', padding: '8px 16px', borderRadius: 999, fontWeight: 700, marginBottom: 16 }}>
            <RobotOutlined /> SMART STYLIST AI
          </div>
          <Title level={1} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
            Tìm Kiếm Phong Cách Đích Thực
          </Title>
          <Paragraph style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
            Hãy cho hệ thống AI biết sở thích của bạn. Chúng tôi sẽ phân tích và tìm ra những sản phẩm hoàn hảo nhất.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={8} xl={7}>
            <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', top: 80, border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                Hồ Sơ Sở Thích <ThunderboltFilled className="text-gradient-ai" />
              </h3>
              <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ purpose: 'self', budget: [0, 5000000] }}>
                <Form.Item name="purpose" label={<span style={{ fontWeight: 600 }}>Mục đích mua sắm</span>}>
                  <Radio.Group style={{ width: '100%' }}>
                    <Radio.Button value="self" style={{ width: '50%', textAlign: 'center' }}>Cho bản thân</Radio.Button>
                    <Radio.Button value="gift" style={{ width: '50%', textAlign: 'center' }}>Quà tặng</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="keywords" label={<span style={{ fontWeight: 600 }}>Từ khóa / Yêu cầu thêm</span>}>
                  <Input placeholder="Ví dụ: đi biển, dự tiệc, thân thiện môi trường..." size="large" style={{ borderRadius: 12 }} />
                </Form.Item>
                <Form.Item name="styles" label={<span style={{ fontWeight: 600 }}>Phong cách yêu thích</span>}>
                  <Select mode="multiple" placeholder="Chọn một hoặc nhiều phong cách" size="large" style={{ width: '100%' }}>
                    <Option value="minimalist">Minimalist (Tối giản)</Option>
                    <Option value="casual">Casual (Gọn gàng, đơn giản)</Option>
                    <Option value="streetwear">Streetwear (Đường phố)</Option>
                    <Option value="vintage">Vintage (Cổ điển)</Option>
                    <Option value="formal">Formal (Sang trọng)</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="colors" label={<span style={{ fontWeight: 600 }}>Màu sắc ưu tiên</span>}>
                  <Select mode="tags" placeholder="Nhập màu sắc (Xanh, Đỏ, Đen...)" size="large" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="budget" label={<span style={{ fontWeight: 600 }}>Ngân sách dự kiến</span>}>
                  <Slider range step={100000} min={0} max={10000000}
                    marks={{ 0: '0đ', 10000000: '10Tr' }}
                    tooltip={{ formatter: (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ' }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={savePrefMutation.isPending}
                  className="bg-gradient-ai" style={{ border: 'none', height: 50, borderRadius: 12, fontWeight: 700, fontSize: 16, marginTop: 16 }}>
                  Bắt Đầu Phân Tích
                </Button>
              </Form>
            </div>
          </Col>

          <Col xs={24} lg={16} xl={17}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, background: 'white', borderRadius: 24, border: '1px dashed var(--border-color)' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16, color: 'var(--text-muted)', fontWeight: 500 }}>AI đang phân tích sở thích để tìm lựa chọn tốt nhất...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, background: 'white', borderRadius: 24, border: '1px dashed var(--border-color)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>🤖</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Chờ Bạn Nhập Thông Tin</h3>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400 }}>Điền hồ sơ sở thích bên trái để AI phân tích và đưa ra gợi ý dành riêng cho bạn.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '16px 24px', background: 'white', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircleFilled style={{ color: '#10B981', fontSize: 24 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)' }}>
                        {resultType === 'personalized' ? 'Dành riêng cho bạn ✨' : 'Sản phẩm nổi bật 🌟'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{resultMessage || `Tìm thấy ${products.length} sản phẩm phù hợp`}</div>
                    </div>
                  </div>
                </div>
                <Row gutter={[24, 24]}>
                  {products.map((product) => (
                    <Col xs={24} sm={12} xl={8} key={product._id}>
                      <ProductCard product={product} matchPercent={resultType === 'personalized' ? 90 : null} />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
