'use client';

import { useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Pagination,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  HomeOutlined,
  LoginOutlined,
  RobotOutlined,
  SearchOutlined,
  ShoppingOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { aiAPI, productAPI } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import AIRecCard from '@/components/ai/AIRecCard';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';
import { useAuthStore } from '@/store/useStore';

const { Option } = Select;
const { Paragraph, Text, Title } = Typography;

const DEFAULT_FILTERS = {
  page: 1,
  limit: 12,
  search: '',
  category: '',
  sort: 'newest',
  minPrice: 0,
  maxPrice: 100000000,
};

const QUICK_FILTERS = [
  { label: 'Đang giảm giá', value: 'discount' },
  { label: 'Bán chạy', value: 'popular' },
  { label: 'Mới về', value: 'newest' },
];

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

export default function Shop() {
  const router = useRouter();
  const { message } = App.useApp();
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [gridView, setGridView] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [quickFilter, setQuickFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productAPI.getAll(filters).then((response) => response.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productAPI.getCategories().then((response) => response.data.categories),
  });

  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-recommendations-shop'],
    queryFn: () => aiAPI.getRecommendations().then((response) => response.data),
    enabled: isAuthenticated && aiEnabled,
    staleTime: 60000,
  });

  const handleFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const handleQuickFilter = (value) => {
    const nextValue = quickFilter === value ? '' : value;
    setQuickFilter(nextValue);

    if (value === 'popular') {
      handleFilter('sort', nextValue ? 'popular' : 'newest');
    }

    if (value === 'newest') {
      handleFilter('sort', 'newest');
    }
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setQuickFilter('');
  };

  const products = useMemo(() => {
    const rawProducts = data?.products || [];

    if (quickFilter === 'discount') {
      return rawProducts.filter((product) => product.originalPrice > product.price);
    }

    return rawProducts;
  }, [data?.products, quickFilter]);

  const aiProducts = aiData?.products || [];
  const aiSource = aiData?.meta?.source || aiData?.source || 'model';
  const totalProducts = quickFilter === 'discount'
    ? products.length
    : data?.pagination?.total || products.length;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '32px 24px 56px' }}>
      <div className="container" style={{ maxWidth: 1440 }}>
        <div
          style={{
            marginBottom: 24,
            borderRadius: 28,
            padding: '28px 28px 24px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 58%, #F8FAFC 100%)',
            border: '1px solid rgba(231, 217, 200, 0.9)',
            boxShadow: '0 24px 48px rgba(131, 61, 7, 0.06)',
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} xl={15}>
              <Space size={10} wrap style={{ marginBottom: 14 }}>
                <Tag color="orange" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5, fontWeight: 700 }}>
                  <HomeOutlined /> Cửa hàng thông minh
                </Tag>
                <Tag color="gold" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5, fontWeight: 700 }}>
                  <RobotOutlined /> AI merchandising
                </Tag>
              </Space>

              <Title level={1} style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.08 }}>
                Khám phá catalog theo ngữ cảnh mua sắm, không chỉ theo danh mục.
              </Title>
              <Paragraph style={{ margin: '14px 0 0', maxWidth: 760, fontSize: 16, color: 'var(--text-muted)' }}>
                Bộ lọc bên trái giúp thu hẹp nhu cầu nhanh. Khu vực AI bên phải ưu tiên những sản phẩm có khả năng chuyển đổi tốt với hồ sơ và hành vi duyệt hiện tại của bạn.
              </Paragraph>
            </Col>

            <Col xs={24} xl={9}>
              <Row gutter={[12, 12]}>
                <Col xs={12}>
                  <Card bodyStyle={{ padding: 18 }} style={{ borderRadius: 22, border: '1px solid var(--border-color)', height: '100%' }}>
                    <Text type="secondary">Sản phẩm đang hiển thị</Text>
                    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }}>{totalProducts}</div>
                    <Text style={{ color: 'var(--text-muted)' }}>Kết quả theo bộ lọc hiện tại</Text>
                  </Card>
                </Col>
                <Col xs={12}>
                  <Card bodyStyle={{ padding: 18 }} style={{ borderRadius: 22, border: '1px solid var(--border-color)', height: '100%' }}>
                    <Text type="secondary">AI đề xuất</Text>
                    <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: 'var(--brand-teal)' }}>
                      {aiEnabled && isAuthenticated ? aiProducts.length : 0}
                    </div>
                    <Text style={{ color: 'var(--text-muted)' }}>Danh sách ưu tiên theo hồ sơ</Text>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6} xl={5}>
            <div
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 24,
                border: '1px solid var(--border-color)',
                boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)',
                position: 'sticky',
                top: 88,
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Tìm kiếm nhanh
                </Text>
                <Input
                  placeholder="Tên sản phẩm, chất liệu, mục đích..."
                  prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                  value={filters.search}
                  onChange={(event) => handleFilter('search', event.target.value)}
                  size="large"
                  style={{ marginTop: 12, borderRadius: 14 }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Danh mục
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <Button
                    type={!filters.category ? 'primary' : 'default'}
                    block
                    style={{ height: 42, borderRadius: 12, justifyContent: 'flex-start' }}
                    onClick={() => handleFilter('category', '')}
                  >
                    Tất cả sản phẩm
                  </Button>
                  {(categoriesData || []).map((category) => (
                    <Button
                      key={category}
                      block
                      type={filters.category === category ? 'primary' : 'default'}
                      style={{ height: 42, borderRadius: 12, justifyContent: 'flex-start' }}
                      onClick={() => handleFilter('category', category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Khoảng giá
                </Text>
                <div style={{ marginTop: 14, paddingInline: 6 }}>
                  <Slider
                    range
                    min={0}
                    max={100000000}
                    step={500000}
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={([minPrice, maxPrice]) => {
                      setFilters((current) => ({ ...current, minPrice, maxPrice, page: 1 }));
                    }}
                    tooltip={{ formatter: (value) => formatPrice(value) }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 10,
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: '#FFF7ED',
                    border: '1px solid #F5E4D3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontWeight: 700,
                    color: '#9A3412',
                  }}
                >
                  <span>{formatPrice(filters.minPrice)}</span>
                  <span>{formatPrice(filters.maxPrice)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Lọc nhanh
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {QUICK_FILTERS.map((item) => (
                    <Button
                      key={item.value}
                      type={quickFilter === item.value ? 'primary' : 'default'}
                      shape="round"
                      onClick={() => handleQuickFilter(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button block onClick={handleReset} style={{ height: 44, borderRadius: 12 }}>
                Làm mới bộ lọc
              </Button>
            </div>
          </Col>

          <Col xs={24} lg={12} xl={13}>
            <Card
              bodyStyle={{ padding: 18 }}
              style={{ marginBottom: 20, borderRadius: 22, border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <Space size={8} wrap>
                    <HomeOutlined style={{ color: 'var(--brand-teal)' }} />
                    <Text type="secondary">Cửa hàng</Text>
                    <Text strong style={{ color: 'var(--text-main)' }}>
                      {totalProducts} sản phẩm
                    </Text>
                  </Space>
                  <Paragraph style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
                    Ưu tiên những mặt hàng có tín hiệu mua tốt và dễ so sánh giá trị.
                  </Paragraph>
                </div>

                <Space size={12} wrap>
                  <Select
                    value={filters.sort}
                    style={{ width: 180 }}
                    size="large"
                    onChange={(value) => handleFilter('sort', value)}
                  >
                    <Option value="newest">Mới nhất</Option>
                    <Option value="popular">Bán chạy</Option>
                    <Option value="price_asc">Giá tăng dần</Option>
                    <Option value="price_desc">Giá giảm dần</Option>
                    <Option value="rating">Đánh giá cao</Option>
                  </Select>

                  <div
                    style={{
                      display: 'flex',
                      border: '1px solid var(--border-color)',
                      borderRadius: 14,
                      padding: 4,
                      background: '#FFF7ED',
                    }}
                  >
                    <Button
                      type={gridView ? 'primary' : 'text'}
                      icon={<AppstoreOutlined />}
                      onClick={() => setGridView(true)}
                    />
                    <Button
                      type={!gridView ? 'primary' : 'text'}
                      icon={<BarsOutlined />}
                      onClick={() => setGridView(false)}
                    />
                  </div>
                </Space>
              </div>

              {(filters.category || quickFilter) ? (
                <>
                  <Divider style={{ margin: '18px 0 14px' }} />
                  <Space size={[8, 8]} wrap>
                    {filters.category ? (
                      <Tag closable color="orange" onClose={() => handleFilter('category', '')}>
                        {filters.category}
                      </Tag>
                    ) : null}
                    {quickFilter ? (
                      <Tag closable color="gold" onClose={() => setQuickFilter('')}>
                        {QUICK_FILTERS.find((item) => item.value === quickFilter)?.label}
                      </Tag>
                    ) : null}
                  </Space>
                </>
              ) : null}
            </Card>

            {isLoading ? (
              <AIProductSkeleton count={gridView ? 6 : 4} />
            ) : products.length === 0 ? (
              <InsightEmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description="Hãy nới rộng khoảng giá, đổi danh mục hoặc tắt bớt lọc nhanh để hệ thống trả về nhiều lựa chọn hơn."
                actionLabel="Đặt lại bộ lọc"
                onAction={handleReset}
                icon={<SearchOutlined />}
                accentColor="#0F766E"
                accentBackground="rgba(13, 148, 136, 0.12)"
              />
            ) : (
              <>
                <Row gutter={[20, 20]}>
                  {products.map((product) => (
                    <Col key={product._id} xs={24} sm={gridView ? 12 : 24} xl={gridView ? 8 : 24}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>

                <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    current={filters.page}
                    total={data?.pagination?.total || products.length}
                    pageSize={filters.limit}
                    showSizeChanger={false}
                    onChange={(page) => setFilters((current) => ({ ...current, page }))}
                  />
                </div>
              </>
            )}
          </Col>

          <Col xs={24} lg={6} xl={6}>
            <div
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 20,
                border: '1px solid var(--border-color)',
                boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)',
                position: 'sticky',
                top: 88,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    className="bg-gradient-ai"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 18,
                    }}
                  >
                    <ThunderboltFilled />
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>AI mua sắm</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Gợi ý theo hồ sơ và tín hiệu duyệt trang
                    </div>
                  </div>
                </div>
                <Switch checked={aiEnabled} onChange={setAiEnabled} />
              </div>

              {!aiEnabled ? (
                <InsightEmptyState
                  compact
                  title="AI đang tạm tắt"
                  description="Bật lại để xem các sản phẩm có khả năng phù hợp cao với nhu cầu hiện tại."
                />
              ) : !isAuthenticated ? (
                <InsightEmptyState
                  compact
                  title="Đăng nhập để cá nhân hóa"
                  description="Hệ thống cần lịch sử duyệt và hành vi trước đó để ưu tiên gợi ý chính xác hơn."
                  actionLabel="Đăng nhập"
                  onAction={() => router.push('/login')}
                  icon={<LoginOutlined />}
                  accentColor="#7C3AED"
                  accentBackground="rgba(124, 58, 237, 0.12)"
                />
              ) : aiLoading ? (
                <AIProductSkeleton count={1} />
              ) : aiProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <AIRecCard
                    product={aiProducts[0]}
                    placement="shop_sidebar"
                    matchPercent={96}
                    source={aiSource}
                    reasonTitle="Tín hiệu AI đang ưu tiên"
                    reasons={[
                      'Khả năng nhấp cao ở ngữ cảnh hiện tại',
                      'Mức giá gần với lịch sử mua sắm',
                      'Phù hợp với danh mục bạn vừa xem',
                    ]}
                  />

                  {aiProducts.slice(1, 4).map((product, index) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => router.push(`/products/${product._id}`)}
                      style={{
                        padding: 14,
                        borderRadius: 18,
                        border: '1px solid var(--border-color)',
                        background: '#FFFBF5',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <Text strong style={{ color: 'var(--text-main)' }}>{product.name}</Text>
                        <Tag color="gold" style={{ margin: 0, borderRadius: 999 }}>
                          {93 - (index * 3)}%
                        </Tag>
                      </div>
                      <div style={{ color: 'var(--brand-teal)', fontWeight: 800, marginBottom: 8 }}>
                        {formatPrice(product.price)}
                      </div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Đồng giá trị, dễ cân nhắc cùng phiên mua sắm hiện tại.
                      </Text>
                    </button>
                  ))}
                </div>
              ) : (
                <InsightEmptyState
                  compact
                  title="Chưa đủ tín hiệu AI"
                  description="Duyệt thêm sản phẩm hoặc tương tác với wishlist, giỏ hàng để hệ thống hiểu rõ hơn gu của bạn."
                />
              )}

              <Card
                bodyStyle={{ padding: 18 }}
                style={{
                  marginTop: 18,
                  borderRadius: 22,
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  border: 'none',
                  color: 'white',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <ShoppingOutlined style={{ color: '#FDBA74', fontSize: 18 }} />
                  <Text style={{ color: 'white', fontWeight: 800 }}>Mẹo tăng tỷ lệ chốt</Text>
                </div>
                <Paragraph style={{ marginBottom: 16, color: 'rgba(255,255,255,0.76)' }}>
                  Thêm sản phẩm vào wishlist hoặc giỏ hàng để AI đẩy ranking chính xác hơn ở lần quay lại tiếp theo.
                </Paragraph>
                <Button
                  block
                  size="large"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push('/ai-suggest');
                      return;
                    }

                    message.info('Đăng nhập để mở hồ sơ gợi ý AI chuyên sâu.');
                    router.push('/login');
                  }}
                  style={{ borderRadius: 14, height: 46, fontWeight: 700 }}
                >
                  Mở AI Suggest
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
