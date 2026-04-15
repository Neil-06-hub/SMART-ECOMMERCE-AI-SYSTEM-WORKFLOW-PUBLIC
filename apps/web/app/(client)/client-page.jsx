'use client';

import { Row, Col, Spin, Button, Rate } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { productAPI, aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';
import ProductCard from '@/components/product/ProductCard';

// Dynamic import for chart (disable SSR)
const Area = dynamic(() => import('@ant-design/charts').then((m) => m.Area), { ssr: false });

const HeroBanner = ({ featuredProducts = [] }) => {
  const router = useRouter();
  const preview = featuredProducts.slice(0, 3);
  const offsets = [-180, 0, 180];
  const scales = [0.85, 1, 0.85];
  const zIndexes = [1, 3, 1];
  const rotations = [-8, 0, 8];

  return (
    <section style={{ background: 'var(--bg-main)', padding: '80px 48px 0', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-teal-light))',
          color: 'white', padding: '8px 24px', borderRadius: 999, fontSize: 16, fontWeight: 600,
        }}>
          Powered by Google Gemini AI
        </span>
      </div>
      <h1 style={{ margin: 0, lineHeight: 1.15 }}>
        <div style={{ fontSize: 66, fontWeight: 900, color: 'var(--text-main)' }}>Mua Sắm Thông Minh</div>
        <div style={{ fontSize: 66, fontWeight: 900 }} className="text-gradient-ai">Trải Nghiệm AI</div>
        <div style={{ fontSize: 66, fontWeight: 900 }} className="text-gradient-teal">Cá Nhân Hóa 100%</div>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 20, margin: '24px auto 40px', maxWidth: 680 }}>
        Hệ thống AI phân tích sở thích của bạn để gợi ý sản phẩm hoàn hảo. Marketing tự động, trải nghiệm mua sắm không giới hạn.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 60 }}>
        <Button size="large" onClick={() => router.push('/shop')} className="bg-gradient-ai" style={{ border: 'none', color: 'white', borderRadius: 999, fontWeight: 700, height: 60, padding: '0 40px', fontSize: 18 }}>
          Khám Phá Ngay →
        </Button>
        <Button size="large" style={{ background: 'transparent', border: '2px solid var(--ai-purple)', color: 'var(--ai-purple)', borderRadius: 999, fontWeight: 700, height: 60, padding: '0 40px', fontSize: 18 }}>
          Xem Demo AI ⊙
        </Button>
      </div>

      {preview.length > 0 && (
        <div style={{ position: 'relative', height: 380, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <style>{`
            @keyframes floatHeroCard {
              0% { transform: translateX(-50%) translateY(0px) scale(var(--scale)) rotate(var(--rot)); }
              50% { transform: translateX(-50%) translateY(-12px) scale(var(--scale)) rotate(var(--rot)); }
              100% { transform: translateX(-50%) translateY(0px) scale(var(--scale)) rotate(var(--rot)); }
            }
            .hero-card-anim { animation: floatHeroCard 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          `}</style>
          {preview.map((product, i) => (
            <div key={product._id} className="hero-card-anim" style={{
              '--scale': scales[i], '--rot': `${rotations[i]}deg`,
              position: 'absolute', left: `calc(50% + ${offsets[i]}px)`,
              transform: `translateX(-50%) scale(${scales[i]}) rotate(${rotations[i]}deg)`,
              animationDelay: `${i * 0.5}s`,
              zIndex: zIndexes[i], width: 255, background: 'white', borderRadius: 20,
              boxShadow: i === 1 ? '0 25px 65px rgba(0,0,0,0.18)' : '0 10px 30px rgba(0,0,0,0.12)',
              overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-color)',
            }}>
              <div style={{ position: 'relative', height: 205, background: '#F1F5F9' }}>
                <img src={product.image || 'https://placehold.co/400x400/f1f5f9/a1a1aa?text=Image'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="bg-gradient-ai" style={{ position: 'absolute', top: 12, left: 12, color: 'white', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>AI Pick</span>
              </div>
              <div style={{ padding: '16px 18px', textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', marginBottom: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{product.name}</div>
                <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 17 }}>{new Intl.NumberFormat('vi-VN').format(product.price)}đ</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const AIFeaturesSection = () => {
  const demoData = [
    { age: '18-24', gender: 'Nữ', count: 25 }, { age: '18-24', gender: 'Nam', count: 15 },
    { age: '25-34', gender: 'Nữ', count: 55 }, { age: '25-34', gender: 'Nam', count: 40 },
    { age: '35-44', gender: 'Nữ', count: 20 }, { age: '35-44', gender: 'Nam', count: 35 },
    { age: '45-54', gender: 'Nữ', count: 15 }, { age: '45-54', gender: 'Nam', count: 20 },
    { age: '55+', gender: 'Nữ', count: 5 }, { age: '55+', gender: 'Nam', count: 10 },
  ];
  const demoConfig = {
    data: demoData, xField: 'age', yField: 'count', colorField: 'gender', shapeField: 'smooth',
    smooth: true, height: 120, autoFit: true, color: ['#f97316', '#3b82f6'],
    xAxis: { label: { style: { fontSize: 10 } }, line: null, tickLine: null, grid: null },
    yAxis: { label: null, grid: null, line: null }, areaStyle: { fillOpacity: 0.5 },
    legend: { position: 'top-right', itemName: { style: { fontSize: 10 } } }, tooltip: { showMarkers: false },
  };
  const productWaves = [
    { month: 'T1', product: 'Giày Thể Thao', sales: 120 }, { month: 'T1', product: 'Áo Thun', sales: 80 }, { month: 'T1', product: 'Balo', sales: 40 },
    { month: 'T2', product: 'Giày Thể Thao', sales: 130 }, { month: 'T2', product: 'Áo Thun', sales: 90 }, { month: 'T2', product: 'Balo', sales: 45 },
    { month: 'T3', product: 'Giày Thể Thao', sales: 110 }, { month: 'T3', product: 'Áo Thun', sales: 105 }, { month: 'T3', product: 'Balo', sales: 60 },
    { month: 'T4', product: 'Giày Thể Thao', sales: 140 }, { month: 'T4', product: 'Áo Thun', sales: 110 }, { month: 'T4', product: 'Balo', sales: 70 },
    { month: 'T5', product: 'Giày Thể Thao', sales: 160 }, { month: 'T5', product: 'Áo Thun', sales: 130 }, { month: 'T5', product: 'Balo', sales: 90 },
  ];
  const productConfig = {
    data: productWaves, xField: 'month', yField: 'sales', colorField: 'product', shapeField: 'smooth',
    smooth: true, height: 120, autoFit: true, color: ['#f97316', '#3b82f6', '#10b981'],
    xAxis: { label: { style: { fontSize: 10 } }, line: null, tickLine: null, grid: null },
    yAxis: { label: null, grid: null, line: null }, areaStyle: { fillOpacity: 0.6 },
    legend: { position: 'top', layout: 'horizontal', itemName: { style: { fontSize: 10 } } }, tooltip: { showMarkers: false },
  };

  return (
    <section style={{ padding: '80px 48px', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--ai-purple)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 16 }}>
          Tính Năng Nổi Bật
        </span>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-main)', margin: '0' }}>
          Công Nghệ AI <span className="text-gradient-ai">Thay Đổi Cách Mua Sắm</span>
        </h2>
      </div>
      <Row gutter={[24, 24]} align="stretch" justify="center">
        <Col xs={24} md={8}>
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 24, padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 56, height: 56, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 24, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>🤖</div>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: 22, margin: '0 0 12px' }}>AI Recommendation</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, flex: 1, margin: 0 }}>Kết hợp Content-based và Collaborative Filtering để gợi ý sản phẩm phù hợp 100% với sở thích của bạn.</p>
            <div style={{ marginTop: 24 }}>
              <span className="text-gradient-ai" style={{ background: 'white', fontWeight: 700, fontSize: 14, padding: '8px 16px', borderRadius: 999, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)' }}>99.2% Accuracy</span>
            </div>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="bg-gradient-ai" style={{ borderRadius: 24, height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 32, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>✉ Smart Marketing</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 64, margin: '20px 0', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>📨</div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>Auto Marketing</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>AI tự động viết email cá nhân hóa, nhắc giỏ hàng, và gửi newsletter hấp dẫn.</p>
            </div>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ borderRadius: 24, padding: 32, background: 'white', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(234, 88, 12, 0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--brand-teal)' }}>📈</div>
              <h3 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-main)', margin: 0 }}>Business Insights</h3>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Phân Bố Khách Hàng</div>
                <Area {...demoConfig} />
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Top 3 Bán Chạy</div>
                <Area {...productConfig} />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </section>
  );
};

const testimonials = [
  { initials: 'MA', name: 'Nguyễn Minh Anh', role: 'Shopper', color: '#8B5CF6', text: 'AI gợi ý sản phẩm cực kỳ chính xác! Tôi đã tìm được đúng tai nghe mình cần chỉ sau 2 phút.', stars: 5 },
  { initials: 'HL', name: 'Trần Hoàng Long', role: 'Khách hàng thân thiết', color: '#0D9488', text: 'Email marketing tự động giúp tôi không bỏ lỡ bất kỳ deal nào. Nội dung email cảm giác rất con người.', stars: 5 },
  { initials: 'TH', name: 'Lê Thị Hương', role: 'Chủ shop online', color: '#EC4899', text: 'Dashboard phân tích AI là tính năng ăn tiền nhất. Doanh thu của tôi tăng trưởng rõ rệt.', stars: 5 },
];

const TestimonialsSection = () => (
  <section style={{ padding: '80px 48px', background: 'var(--bg-main)' }}>
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(234, 88, 12, 0.1)', color: 'var(--brand-teal)', border: '1px solid rgba(234, 88, 12, 0.2)', marginBottom: 16 }}>
        Đánh Giá Thực Tế
      </span>
      <h2 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Trải Nghiệm Từ <span className="text-gradient-teal">Người Dùng</span></h2>
    </div>
    <Row gutter={[24, 24]} justify="center">
      {testimonials.map((t, idx) => (
        <Col key={idx} xs={24} md={8}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{t.initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{t.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.role}</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-main)', fontSize: 15, lineHeight: 1.6, marginBottom: 20, flex: 1, fontStyle: 'italic' }}>"{t.text}"</p>
            <Rate disabled defaultValue={t.stars} style={{ fontSize: 16, color: 'var(--brand-teal)' }} />
          </div>
        </Col>
      ))}
    </Row>
  </section>
);

const CTASection = () => {
  const router = useRouter();
  return (
    <section>
      <div style={{ margin: '0 48px 80px', borderRadius: 32, background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translate(-50%, 0)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: 48, fontWeight: 900, margin: '0 0 16px' }}>Sẵn Sàng Mua Sắm Thông Minh?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, margin: '0 auto 40px', maxWidth: 600 }}>Tạo tài khoản ngay hôm nay và trải nghiệm tính năng phân tích sở thích cá nhân hóa miễn phí.</p>
          <Button size="large" onClick={() => router.push('/register')} className="bg-gradient-ai" style={{ border: 'none', color: 'white', borderRadius: 999, fontWeight: 700, height: 56, padding: '0 48px', fontSize: 18, marginBottom: 48, boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)' }}>
            Bắt Đầu Trải Nghiệm AI
          </Button>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Google Gemini', 'Next.js 15', 'Node.js', 'MongoDB'].map((tech) => (
              <span key={tech} style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 14, padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(249, 115, 22, 0.2)', background: 'rgba(255, 255, 255, 0.5)' }}>{tech}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function ClientHome({ initialFeaturedProducts = [] }) {
  const { isAuthenticated } = useAuthStore();

  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => aiAPI.getRecommendations().then((r) => r.data),
    enabled: !!isAuthenticated,
  });

  const featuredData = initialFeaturedProducts;
  const featuredLoading = false; // Data đã có sẵn server sider

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <HeroBanner featuredProducts={featuredData || []} />
      <AIFeaturesSection />

      {isAuthenticated && (
        <section style={{ padding: '80px 48px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: 'var(--text-main)' }}>{aiData?.message || 'Gợi ý cho bạn'}</h2>
              <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 16 }}>Dựa trên sở thích và lịch sử mua sắm gần đây</p>
            </div>
            <span className="bg-gradient-ai" style={{ color: 'white', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
              AI Analyzed
            </span>
          </div>
          {aiLoading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
            <Row gutter={[24, 24]}>
              {aiData?.products?.map((product) => (
                <Col key={product._id} xs={24} sm={12} md={8} lg={6}><ProductCard product={product} /></Col>
              ))}
            </Row>
          )}
        </section>
      )}

      <section style={{ padding: '80px 48px', background: isAuthenticated ? 'var(--bg-main)' : 'white' }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Sản Phẩm Nổi Bật</h2>
        </div>
        {featuredLoading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
          <Row gutter={[24, 24]}>
            {featuredData?.map((product) => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6}><ProductCard product={product} /></Col>
            ))}
          </Row>
        )}
      </section>

      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
