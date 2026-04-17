'use client';

import { useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Slider,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleFilled,
  LockOutlined,
  RobotOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { aiAPI, authAPI } from '@/lib/api';
import AIRecCard from '@/components/ai/AIRecCard';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';
import { useAuthStore } from '@/store/useStore';

const { Option } = Select;
const { Paragraph, Text, Title } = Typography;

function formatBudgetLabel(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;
}

export default function AISuggest() {
  const [form] = Form.useForm();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, updateUser } = useAuthStore();

  const watchedStyles = Form.useWatch('styles', form) || [];
  const watchedColors = Form.useWatch('colors', form) || [];
  const watchedBudget = Form.useWatch('budget', form) || [0, 5000000];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: () => aiAPI.getRecommendations().then((response) => response.data),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const savePrefMutation = useMutation({
    mutationFn: (preferences) => authAPI.updateProfile({ preferences }),
    onSuccess: (response) => {
      updateUser(response.data.user);
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

  const contextualReasons = useMemo(() => {
    const reasons = [];

    watchedStyles.slice(0, 2).forEach((style) => reasons.push(`Ưu tiên phong cách ${style}`));
    watchedColors.slice(0, 1).forEach((color) => reasons.push(`Ưa chuộng tông ${color}`));

    if (watchedBudget[1]) {
      reasons.push(`Giữ trong ngân sách đến ${formatBudgetLabel(watchedBudget[1])}`);
    }

    return reasons.slice(0, 3);
  }, [watchedBudget, watchedColors, watchedStyles]);

  if (!isAuthenticated) {
    return (
      <div style={{ background: 'var(--bg-main)', minHeight: '80vh', padding: '56px 24px' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <InsightEmptyState
            title="Đăng nhập để mở hồ sơ gợi ý AI"
            description="AI Suggest cần lịch sử duyệt, wishlist và tín hiệu preference để tạo danh sách có khả năng chuyển đổi cao hơn danh mục thông thường."
            actionLabel="Đăng nhập ngay"
            onAction={() => router.push('/login')}
            icon={<LockOutlined />}
            accentColor="#7C3AED"
            accentBackground="rgba(124, 58, 237, 0.12)"
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '32px 24px 56px' }}>
      <div className="container" style={{ maxWidth: 1440 }}>
        <div
          style={{
            marginBottom: 24,
            borderRadius: 28,
            padding: '28px 28px 24px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 58%, #FEF3C7 100%)',
            border: '1px solid rgba(231, 217, 200, 0.9)',
            boxShadow: '0 24px 48px rgba(131, 61, 7, 0.06)',
          }}
        >
          <Space size={10} wrap style={{ marginBottom: 14 }}>
            <Tag color="gold" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5, fontWeight: 700 }}>
              <RobotOutlined /> Smart Stylist AI
            </Tag>
            <Tag color="orange" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5, fontWeight: 700 }}>
              <ThunderboltFilled /> Personal ranking
            </Tag>
          </Space>

          <Title level={1} style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.08 }}>
            Từ nhu cầu mơ hồ đến shortlist có lý do chọn rõ ràng.
          </Title>
          <Paragraph style={{ margin: '14px 0 0', maxWidth: 780, fontSize: 16, color: 'var(--text-muted)' }}>
            Điền vài tín hiệu mua sắm, AI sẽ gom lại thành một danh sách ưu tiên, có giải thích ngắn gọn để người dùng cảm thấy quyết định mua nhanh và tự tin hơn.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8} xl={7}>
            <Card
              bodyStyle={{ padding: 28 }}
              style={{
                borderRadius: 24,
                border: '1px solid var(--border-color)',
                position: 'sticky',
                top: 88,
                boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Hồ sơ AI
                </Text>
                <Title level={3} style={{ margin: '8px 0 8px' }}>
                  Tín hiệu mua sắm
                </Title>
                <Paragraph style={{ margin: 0, color: 'var(--text-muted)' }}>
                  Chỉ giữ những trường đủ tạo khác biệt cho ranking để form gọn nhưng vẫn giàu ngữ cảnh.
                </Paragraph>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ purpose: 'self', budget: [0, 5000000], styles: [], colors: [] }}
              >
                <Form.Item
                  name="purpose"
                  label={<span style={{ fontWeight: 700 }}>Mục đích mua sắm</span>}
                >
                  <Radio.Group optionType="button" buttonStyle="solid" style={{ display: 'flex' }}>
                    <Radio.Button value="self" style={{ flex: 1, textAlign: 'center' }}>Cho bản thân</Radio.Button>
                    <Radio.Button value="gift" style={{ flex: 1, textAlign: 'center' }}>Làm quà tặng</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="keywords"
                  label={<span style={{ fontWeight: 700 }}>Ngữ cảnh / nhu cầu thêm</span>}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Ví dụ: đi biển, họp với khách hàng, món quà tinh gọn dưới 3 triệu..."
                    style={{ borderRadius: 14 }}
                  />
                </Form.Item>

                <Form.Item
                  name="styles"
                  label={<span style={{ fontWeight: 700 }}>Phong cách ưu tiên</span>}
                >
                  <Select mode="multiple" size="large" placeholder="Chọn một hoặc nhiều phong cách">
                    <Option value="tối giản">Tối giản</Option>
                    <Option value="casual">Casual</Option>
                    <Option value="streetwear">Streetwear</Option>
                    <Option value="vintage">Vintage</Option>
                    <Option value="formal">Formal</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="colors"
                  label={<span style={{ fontWeight: 700 }}>Màu sắc mong muốn</span>}
                >
                  <Select mode="tags" size="large" placeholder="Ví dụ: đen, be, xanh navy..." />
                </Form.Item>

                <Form.Item
                  name="budget"
                  label={<span style={{ fontWeight: 700 }}>Ngân sách dự kiến</span>}
                >
                  <Slider
                    range
                    step={100000}
                    min={0}
                    max={10000000}
                    marks={{ 0: '0đ', 10000000: '10 triệu' }}
                    tooltip={{ formatter: formatBudgetLabel }}
                  />
                </Form.Item>

                <Card
                  bodyStyle={{ padding: 16 }}
                  style={{ borderRadius: 18, background: '#FFF7ED', border: '1px solid #F5E4D3', marginBottom: 18 }}
                >
                  <Text strong style={{ color: '#9A3412' }}>Tín hiệu đang gửi vào AI</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {contextualReasons.length > 0 ? contextualReasons.map((reason) => (
                      <Tag key={reason} color="orange" style={{ borderRadius: 999, margin: 0 }}>
                        {reason}
                      </Tag>
                    )) : (
                      <Text type="secondary">Chọn phong cách, màu hoặc ngân sách để AI cá nhân hóa sâu hơn.</Text>
                    )}
                  </div>
                </Card>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={savePrefMutation.isPending}
                  style={{ height: 50, borderRadius: 14, fontWeight: 700 }}
                >
                  Cập nhật hồ sơ và phân tích
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={16} xl={17}>
            <Card
              bodyStyle={{ padding: 18 }}
              style={{ marginBottom: 20, borderRadius: 22, border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <Space size={10} wrap>
                    <CheckCircleFilled style={{ color: '#10B981', fontSize: 18 }} />
                    <Text strong style={{ color: 'var(--text-main)', fontSize: 16 }}>
                      {resultType === 'personalized' ? 'Danh sách cá nhân hóa' : 'Danh sách theo tín hiệu sẵn có'}
                    </Text>
                  </Space>
                  <Paragraph style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
                    {resultMessage || 'AI sẽ làm mới danh sách khi bạn cập nhật preference ở cột bên trái.'}
                  </Paragraph>
                </div>

                <div
                  style={{
                    minWidth: 180,
                    borderRadius: 18,
                    padding: '14px 16px',
                    background: '#FFFBF5',
                    border: '1px solid #F5E4D3',
                  }}
                >
                  <Text type="secondary">Sản phẩm được xếp hạng</Text>
                  <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: 'var(--brand-teal)' }}>
                    {loading ? '...' : products.length}
                  </div>
                </div>
              </div>
            </Card>

            {loading ? (
              <AIProductSkeleton count={6} />
            ) : products.length === 0 ? (
              <InsightEmptyState
                title="AI đang chờ thêm tín hiệu"
                description="Cập nhật preference ở bên trái hoặc tương tác thêm với sản phẩm để hệ thống trả về shortlist có chất lượng cao hơn."
              />
            ) : (
              <Row gutter={[24, 24]}>
                {products.map((product, index) => (
                  <Col xs={24} md={12} xl={8} key={product._id}>
                    <AIRecCard
                      product={product}
                      placement="ai_suggest"
                      matchPercent={96 - Math.min(index, 5) * 3}
                      source={resultType === 'fallback' ? 'fallback' : 'model'}
                      reasonTitle="Vì sao AI đưa vào shortlist"
                      reasons={contextualReasons}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
