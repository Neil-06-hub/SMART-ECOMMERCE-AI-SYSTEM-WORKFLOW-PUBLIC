'use client';

import { Col, Row, Empty, Button, Spin, Typography } from 'antd';
import { HeartFilled, ShopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

const { Title } = Typography;

export default function Wishlist() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((r) => r.data.wishlist),
  });

  const wishlist = data || [];

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #FEE2E2, #FECDD3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeartFilled style={{ fontSize: 26, color: '#EF4444' }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: '#0F172A' }}>Sản phẩm yêu thích</Title>
          <span style={{ color: '#64748B', fontSize: 15 }}>{wishlist.length > 0 ? `${wishlist.length} sản phẩm` : 'Danh sách trống'}</span>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'white', borderRadius: 24, border: '1px dashed #E2E8F0' }}>
          <HeartFilled style={{ fontSize: 64, color: '#FECDD3', marginBottom: 20 }} />
          <Title level={4} style={{ color: '#64748B', fontWeight: 500 }}>Bạn chưa có sản phẩm yêu thích nào</Title>
          <p style={{ color: '#94A3B8', marginBottom: 28 }}>Nhấn vào icon ❤️ trên sản phẩm để thêm vào danh sách yêu thích</p>
          <Button type="primary" size="large" icon={<ShopOutlined />} onClick={() => router.push('/shop')}
            style={{ background: '#EF4444', borderColor: '#EF4444', borderRadius: 999, height: 48, padding: '0 32px', fontWeight: 600, fontSize: 15 }}>
            Khám phá cửa hàng
          </Button>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {wishlist.map((product) => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Button size="large" icon={<ShopOutlined />} onClick={() => router.push('/shop')}
              style={{ borderRadius: 999, height: 48, padding: '0 32px', fontWeight: 600 }}>
              Tiếp tục mua sắm
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
