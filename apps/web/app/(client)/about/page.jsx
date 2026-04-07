'use client';

import { Row, Col, Typography, Button, Divider, Tag } from 'antd';
import { ArrowRightOutlined, FireOutlined, ShopOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function About() {
  const router = useRouter();

  const blogPosts = [
    { id: 1, category: 'Xu Hướng', title: 'Màu Cam Đất & Đỏ Rực: Tông Màu Thống Trị Thu Đông 2026', excerpt: 'Sự trở lại mạnh mẽ của các tông màu ấm áp mang đến cảm giác tràn đầy năng lượng và tự tin.', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800', date: '12/03/2026' },
    { id: 2, category: 'Phong Cách', title: 'Y2K Trở Lại: Khi Quá Khứ Giao Thoa Cùng Tương Lai AI', excerpt: 'Nostalgia kết hợp cùng công nghệ vị lai, phong cách Y2K đang được giới trẻ biến tấu đầy sáng tạo.', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', date: '05/03/2026' },
    { id: 3, category: 'Mix & Match', title: 'Phối Đồ Layering 101: Tỏa Sáng Mà Không Bị Rườm Rà', excerpt: 'Bí kíp kết hợp nhiều lớp trang phục theo tỷ lệ chuẩn xác giúp bạn trông vừa thời thượng vừa giữ ấm.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800', date: '28/02/2026' },
  ];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: '60vh', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4))' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 900, marginBottom: 16, letterSpacing: -1 }}>
            Về Chúng Tôi & <span className="text-gradient-ai">Fashion Blog</span>
          </h1>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto 32px', color: 'rgba(255,255,255,0.8)' }}>
            Khám phá câu chuyện đằng sau SmartShop AI và cập nhật những xu hướng thời trang thịnh hành nhất do AI của chúng tôi chọn lọc.
          </p>
          <Button size="large" type="primary" onClick={() => router.push('/shop')} style={{ borderRadius: 999, height: 50, padding: '0 32px', fontSize: 16, fontWeight: 700 }}>
            Bắt Đầu Mua Sắm
          </Button>
        </div>
      </section>

      <div className="container" style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto' }}>
        {/* About SmartShop */}
        <Row gutter={[48, 48]} align="middle" style={{ marginBottom: 100 }}>
          <Col xs={24} lg={12}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-teal)', fontSize: 32 }}>
                <ShopOutlined />
              </div>
            </div>
            <Title level={2} style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', marginBottom: 24 }}>
              Sự Kết Hợp Giữa <br />Thời Trang & Công Nghệ
            </Title>
            <Paragraph style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 24 }}>
              SmartShop AI không chỉ là một cửa hàng. Chúng tôi là cầu nối giữa gu thẩm mỹ cá nhân của bạn và sức mạnh dự đoán xu hướng của trí tuệ nhân tạo.
            </Paragraph>
            <Paragraph style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Bằng cách phân tích hàng triệu dữ liệu thịnh hành toàn cầu, hệ thống gợi ý của chúng tôi giúp bạn luôn bắt kịp mọi làn sóng thời trang mới nhất.
            </Paragraph>
            <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
              <div>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--brand-teal)', marginBottom: 8 }}>10K+</div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Sản Phẩm Tinh Chọn</div>
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--brand-teal)', marginBottom: 8 }}>99%</div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>Độ Chính Xác Gợi Ý AI</div>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <img src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=800" alt="About Store" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
          </Col>
        </Row>

        <Divider style={{ borderColor: 'var(--border-color)', margin: '80px 0' }} />

        {/* Blog Posts */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--brand-teal)', fontWeight: 700, marginBottom: 8 }}>
              <FireOutlined /> TIN TỨC & XU HƯỚNG
            </div>
            <Title level={2} style={{ margin: 0, color: 'var(--text-main)', fontWeight: 900 }}>Fashion Blog</Title>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {blogPosts.map((post) => (
            <Col key={post.id} xs={24} md={8}>
              <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                <div style={{ height: 220, overflow: 'hidden', background: 'var(--bg-main)' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ marginBottom: 12 }}>
                    <Tag color="orange" style={{ borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{post.category}</Tag>
                  </div>
                  <Title level={4} style={{ margin: '0 0 12px', color: 'var(--text-main)', fontWeight: 800, lineHeight: 1.4 }}>{post.title}</Title>
                  <Paragraph style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </Paragraph>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{post.date}</span>
                    <Button type="link" icon={<ArrowRightOutlined />} style={{ color: 'var(--brand-teal)', fontWeight: 600, padding: 0 }}>Đọc thêm</Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
