'use client';
import { useEffect } from 'react';

import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { HeartFilled, ShopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useStore';
import { wishlistAPI } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const { Paragraph, Text, Title } = Typography;

export default function Wishlist() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((response) => response.data.wishlist),
  });

  const wishlist = data || [];

  if (!isAuthenticated) return null; // Bug 12 Fix: Client side guard

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '32px 24px 56px' }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        <div
          style={{
            marginBottom: 24,
            borderRadius: 28,
            padding: '28px 28px 24px',
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 60%, #FFF7ED 100%)',
            border: '1px solid rgba(254, 205, 211, 0.9)',
            boxShadow: '0 24px 48px rgba(239, 68, 68, 0.06)',
          }}
        >
          <Row gutter={[20, 20]} align="middle">
            <Col xs={24} xl={16}>
              <Space size={10} wrap style={{ marginBottom: 14 }}>
                <Tag color="red" style={{ borderRadius: 999, paddingInline: 12, paddingBlock: 5, fontWeight: 700 }}>
                  <HeartFilled /> Wishlist
                </Tag>
              </Space>
              <Title level={1} style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
                Những sản phẩm bạn đã đánh dấu để quay lại quyết định sau.
              </Title>
              <Paragraph style={{ margin: '14px 0 0', maxWidth: 760, fontSize: 16, color: 'var(--text-muted)' }}>
                Đây là khu vực phù hợp để so sánh giá, đọc lại review và kéo sản phẩm sang giỏ hàng ở thời điểm sẵn sàng chốt đơn.
              </Paragraph>
            </Col>

            <Col xs={24} xl={8}>
              <Card bodyStyle={{ padding: 18 }} style={{ borderRadius: 22, border: '1px solid var(--border-color)' }}>
                <Text type="secondary">Sản phẩm đang lưu</Text>
                <div style={{ marginTop: 8, fontSize: 32, fontWeight: 800, color: '#DC2626' }}>
                  {isLoading ? '...' : wishlist.length}
                </div>
                <Text style={{ color: 'var(--text-muted)' }}>Danh sách đồng bộ theo tài khoản của bạn</Text>
              </Card>
            </Col>
          </Row>
        </div>

        {isLoading ? (
          <AIProductSkeleton count={4} />
        ) : wishlist.length === 0 ? (
          <InsightEmptyState
            title="Wishlist của bạn đang trống"
            description="Nhấn vào biểu tượng trái tim ở bất kỳ sản phẩm nào để tạo shortlist cá nhân trước khi quyết định mua."
            actionLabel="Khám phá cửa hàng"
            onAction={() => router.push('/shop')}
            icon={<HeartFilled />}
            accentColor="#DC2626"
            accentBackground="rgba(239, 68, 68, 0.1)"
          />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {wishlist.map((product) => (
                <Col key={product._id} xs={24} sm={12} lg={8} xl={6}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
              <Button
                size="large"
                icon={<ShopOutlined />}
                onClick={() => router.push('/shop')}
                style={{ height: 48, borderRadius: 999, paddingInline: 28, fontWeight: 700 }}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
