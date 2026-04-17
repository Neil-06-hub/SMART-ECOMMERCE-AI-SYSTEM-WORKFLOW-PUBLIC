'use client';

import { Row, Col, Button, Rate, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';
import ProductCard from '@/components/product/ProductCard';
import AIRecCard from '@/components/ai/AIRecCard';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const Area = dynamic(() => import('@ant-design/charts').then((m) => m.Area), { ssr: false });

const sourceLabels = {
  personalized_ai: 'AI Model',
  featured_fallback: 'Fallback',
};

const sourceColors = {
  personalized_ai: 'gold',
  featured_fallback: 'default',
};

const testimonials = [
  { initials: 'MA', name: 'Nguyễn Minh Anh', role: 'Shopper', color: '#8B5CF6', text: 'AI gợi ý sản phẩm cực kỳ chính xác. Tôi tìm được đúng món mình cần chỉ sau vài phút.', stars: 5 },
  { initials: 'HL', name: 'Trần Hoàng Long', role: 'Khách hàng thân thiết', color: '#0D9488', text: 'Email marketing tự động không còn cảm giác máy móc. Nội dung phù hợp với hành vi mua sắm thật sự.', stars: 5 },
  { initials: 'TH', name: 'Lê Thị Hương', role: 'Chủ shop online', color: '#EC4899', text: 'Dashboard AI giúp tôi nhìn rõ tăng trưởng và vùng cần tối ưu. Đây là khu vực tạo niềm tin mạnh nhất.', stars: 5 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getMatchPercent(score, index) {
  const fallbackValues = [98, 95, 92, 90, 88, 86, 84, 82];
  const fallback = fallbackValues[index] || 80;

  if (typeof score !== 'number' || Number.isNaN(score)) return fallback;
  if (score >= 0 && score <= 1) return clamp(Math.round(score * 100), 78, 99);

  return clamp(Math.round(78 + Math.log10(Math.abs(score) + 1) * 18), 78, 99);
}

function getPriceBandLabel(price) {
  if (price >= 20000000) return 'Phân khúc cao cấp';
  if (price >= 5000000) return 'Tầm giá phổ biến';
  return 'Giá dễ tiếp cận';
}

function buildHomepageAIProducts(aiData) {
  const products = aiData?.products || [];
  const scores = aiData?.scores || [];
  const source = aiData?.type || 'featured_fallback';

  return products.map((product, index) => ({
    product,
    matchPercent: getMatchPercent(scores[index], index),
    reasonTitle: source === 'featured_fallback'
      ? 'AI tạm dùng danh sách nổi bật để giữ trải nghiệm liền mạch'
      : 'AI chọn dựa trên tín hiệu hành vi gần đây của bạn',
    reasons: [
      product.category ? `Ưu tiên ${product.category}` : 'Hợp nhu cầu gần đây',
      getPriceBandLabel(product.price),
      product.tags?.[0] ? `Liên quan ${product.tags[0].replace(/-/g, ' ')}` : 'Được xem nhiều gần đây',
    ].filter(Boolean).slice(0, 3),
    source: source === 'featured_fallback' ? 'fallback' : 'model',
  }));
}

function buildHomepageSummary(aiData) {
  const products = aiData?.products || [];
  const categoryMap = products
    .map((product) => product.category)
    .filter(Boolean)
    .reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category]) => category);

  if (aiData?.type === 'featured_fallback') {
    return 'AI tạm thời không sẵn sàng, hệ thống đang giữ trải nghiệm bằng danh sách sản phẩm nổi bật và sẽ tự làm mới khi dịch vụ phục hồi.';
  }

  if (topCategories.length > 0) {
    return `Tập trung vào ${topCategories.join(' và ')} cùng mức giá bạn thường quan tâm gần đây.`;
  }

  return 'Danh sách này được làm mới theo lịch sử xem và hành vi thêm giỏ hàng gần đây.';
}

function HeroBanner({ featuredProducts = [] }) {
  const router = useRouter();
  const preview = featuredProducts.slice(0, 3);
  const offsets = [-180, 0, 180];
  const scales = [0.85, 1, 0.85];
  const zIndexes = [1, 3, 1];
  const rotations = [-8, 0, 8];

  return (
    <section style={{ background: 'var(--bg-main)', padding: '80px 48px 0', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-teal-light))', color: 'white', padding: '8px 24px', borderRadius: 999, fontSize: 16, fontWeight: 600 }}>
          Powered by Google Gemini AI
        </span>
      </div>

      <h1 style={{ margin: 0, lineHeight: 1.12 }}>
        <div style={{ fontSize: 66, fontWeight: 900, color: 'var(--text-main)' }}>Mua Sắm Thông Minh</div>
        <div style={{ fontSize: 66, fontWeight: 900 }} className="text-gradient-ai">Trải Nghiệm AI</div>
        <div style={{ fontSize: 66, fontWeight: 900 }} className="text-gradient-teal">Cá Nhân Hóa 100%</div>
      </h1>

      <p style={{ color: 'var(--text-muted)', fontSize: 20, margin: '24px auto 40px', maxWidth: 700 }}>
        Hệ thống AI phân tích sở thích của bạn để gợi ý sản phẩm phù hợp hơn, giao tiếp rõ ràng hơn và giảm ma sát khi ra quyết định mua sắm.
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' }}>
        <Button size="large" onClick={() => router.push('/shop')} className="bg-gradient-ai" style={{ border: 'none', color: 'white', borderRadius: 999, fontWeight: 700, height: 60, padding: '0 40px', fontSize: 18 }}>
          Khám Phá Ngay →
        </Button>
        <Button size="large" onClick={() => router.push('/ai-suggest')} style={{ background: 'transparent', border: '2px solid var(--ai-purple)', color: 'var(--ai-purple)', borderRadius: 999, fontWeight: 700, height: 60, padding: '0 40px', fontSize: 18 }}>
          Xem Demo AI
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

          {preview.map((product, index) => (
            <div
              key={product._id}
              className="hero-card-anim"
              style={{
                '--scale': scales[index],
                '--rot': `${rotations[index]}deg`,
                position: 'absolute',
                left: `calc(50% + ${offsets[index]}px)`,
                transform: `translateX(-50%) scale(${scales[index]}) rotate(${rotations[index]}deg)`,
                animationDelay: `${index * 0.5}s`,
                zIndex: zIndexes[index],
                width: 255,
                background: 'white',
                borderRadius: 20,
                boxShadow: index === 1 ? '0 25px 65px rgba(0,0,0,0.18)' : '0 10px 30px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ position: 'relative', height: 205, background: '#F1F5F9' }}>
                <img src={product.image || 'https://placehold.co/400x400/f1f5f9/a1a1aa?text=Image'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="bg-gradient-ai" style={{ position: 'absolute', top: 12, left: 12, color: 'white', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
                  AI Pick
                </span>
              </div>
              <div style={{ padding: '16px 18px', textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', marginBottom: 6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {product.name}
                </div>
                <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 17 }}>
                  {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AIFeaturesSection() {
  const demoData = [
    { age: '18-24', gender: 'Nữ', count: 25 }, { age: '18-24', gender: 'Nam', count: 15 },
    { age: '25-34', gender: 'Nữ', count: 55 }, { age: '25-34', gender: 'Nam', count: 40 },
    { age: '35-44', gender: 'Nữ', count: 20 }, { age: '35-44', gender: 'Nam', count: 35 },
    { age: '45-54', gender: 'Nữ', count: 15 }, { age: '45-54', gender: 'Nam', count: 20 },
    { age: '55+', gender: 'Nữ', count: 5 }, { age: '55+', gender: 'Nam', count: 10 },
  ];

  const demoConfig = {
    data: demoData,
    xField: 'age',
    yField: 'count',
    colorField: 'gender',
    shapeField: 'smooth',
    smooth: true,
    height: 120,
    autoFit: true,
    color: ['#f97316', '#3b82f6'],
    xAxis: { label: { style: { fontSize: 10 } }, line: null, tickLine: null, grid: null },
    yAxis: { label: null, grid: null, line: null },
    areaStyle: { fillOpacity: 0.5 },
    legend: { position: 'top-right', itemName: { style: { fontSize: 10 } } },
    tooltip: { showMarkers: false },
  };

  const productWaves = [
    { month: 'T1', product: 'Giày Thể Thao', sales: 120 }, { month: 'T1', product: 'Áo Thun', sales: 80 }, { month: 'T1', product: 'Balo', sales: 40 },
    { month: 'T2', product: 'Giày Thể Thao', sales: 130 }, { month: 'T2', product: 'Áo Thun', sales: 90 }, { month: 'T2', product: 'Balo', sales: 45 },
    { month: 'T3', product: 'Giày Thể Thao', sales: 110 }, { month: 'T3', product: 'Áo Thun', sales: 105 }, { month: 'T3', product: 'Balo', sales: 60 },
    { month: 'T4', product: 'Giày Thể Thao', sales: 140 }, { month: 'T4', product: 'Áo Thun', sales: 110 }, { month: 'T4', product: 'Balo', sales: 70 },
    { month: 'T5', product: 'Giày Thể Thao', sales: 160 }, { month: 'T5', product: 'Áo Thun', sales: 130 }, { month: 'T5', product: 'Balo', sales: 90 },
  ];

  const productConfig = {
    data: productWaves,
    xField: 'month',
    yField: 'sales',
    colorField: 'product',
    shapeField: 'smooth',
    smooth: true,
    height: 120,
    autoFit: true,
    color: ['#f97316', '#3b82f6', '#10b981'],
    xAxis: { label: { style: { fontSize: 10 } }, line: null, tickLine: null, grid: null },
    yAxis: { label: null, grid: null, line: null },
    areaStyle: { fillOpacity: 0.6 },
    legend: { position: 'top', layout: 'horizontal', itemName: { style: { fontSize: 10 } } },
    tooltip: { showMarkers: false },
  };

  return (
    <section style={{ padding: '80px 48px', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--ai-purple)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 16 }}>
          Tính Năng Nổi Bật
        </span>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          Công Nghệ AI <span className="text-gradient-ai">Thay Đổi Cách Mua Sắm</span>
        </h2>
      </div>

      <Row gutter={[24, 24]} align="stretch" justify="center">
        <Col xs={24} md={8}>
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 24, padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 56, height: 56, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 24, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>🤖</div>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: 22, margin: '0 0 12px' }}>AI Recommendation</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, flex: 1, margin: 0 }}>
              Kết hợp nội dung và hành vi để gợi ý đúng sản phẩm hơn, đồng thời giải thích vì sao món đó xuất hiện.
            </p>
            <div style={{ marginTop: 24 }}>
              <span className="text-gradient-ai" style={{ background: 'white', fontWeight: 700, fontSize: 14, padding: '8px 16px', borderRadius: 999, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)' }}>
                Powered by AI
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="bg-gradient-ai" style={{ borderRadius: 24, height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 32, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>
                ✉ Smart Marketing
              </span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 64, margin: '20px 0', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>📨</div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>Auto Marketing</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0, lineHeight: 1.5 }}>
                AI tự động viết nội dung cá nhân hóa, nhắc giỏ hàng và giữ nhịp tương tác nhất quán.
              </p>
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
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Phân Bố Khách Hàng (Minh họa)</div>
                <Area {...demoConfig} />
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Top 3 Bán Chạy (Minh họa)</div>
                <Area {...productConfig} />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section style={{ padding: '80px 48px', background: 'var(--bg-main)' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(234, 88, 12, 0.1)', color: 'var(--brand-teal)', border: '1px solid rgba(234, 88, 12, 0.2)', marginBottom: 16 }}>
          Đánh Giá Thực Tế
        </span>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          Trải Nghiệm Từ <span className="text-gradient-teal">Người Dùng</span>
        </h2>
        <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>(Các đánh giá minh họa từ người đùng bản Beta)</p>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {testimonials.map((item) => (
          <Col key={item.name} xs={24} md={8}>
            <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {item.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.role}</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: 15, lineHeight: 1.6, marginBottom: 20, flex: 1, fontStyle: 'italic' }}>
                "{item.text}"
              </p>
              <Rate disabled defaultValue={item.stars} style={{ fontSize: 16, color: 'var(--brand-teal)' }} />
            </div>
          </Col>
        ))}
      </Row>
    </section>
  );
}

function CTASection() {
  const router = useRouter();

  return (
    <section>
      <div style={{ margin: '0 48px 80px', borderRadius: 32, background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translate(-50%, 0)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: 48, fontWeight: 900, margin: '0 0 16px' }}>Sẵn Sàng Mua Sắm Thông Minh?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 18, margin: '0 auto 40px', maxWidth: 600 }}>
            Tạo tài khoản ngay hôm nay để kích hoạt gợi ý cá nhân hóa, feedback thời gian thực và trải nghiệm mua sắm mượt hơn.
          </p>
          <Button size="large" onClick={() => router.push('/register')} className="bg-gradient-ai" style={{ border: 'none', color: 'white', borderRadius: 999, fontWeight: 700, height: 56, padding: '0 48px', fontSize: 18, marginBottom: 48, boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)' }}>
            Bắt Đầu Trải Nghiệm AI
          </Button>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Google Gemini', 'Next.js 15', 'Node.js', 'MongoDB'].map((tech) => (
              <span key={tech} style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 14, padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(249, 115, 22, 0.2)', background: 'rgba(255, 255, 255, 0.5)' }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ClientHome({ initialFeaturedProducts = [] }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: aiData, isLoading: aiLoading, isFetching: aiRefreshing } = useQuery({
    queryKey: ['ai-recommendations', 'homepage'],
    queryFn: () => aiAPI.getRecommendations().then((response) => response.data),
    enabled: !!isAuthenticated,
    staleTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const featuredData = initialFeaturedProducts;
  const aiProducts = buildHomepageAIProducts(aiData);
  const aiSummary = buildHomepageSummary(aiData);
  const aiSource = aiData?.type || 'featured_fallback';

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <HeroBanner featuredProducts={featuredData || []} />
      <AIFeaturesSection />

      <section style={{ padding: '80px 48px', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <Tag color="gold" style={{ margin: 0, borderRadius: 999, paddingInline: 14, paddingBlock: 6, fontWeight: 700 }}>
                Dành riêng cho bạn
              </Tag>
              <Tag color={sourceColors[aiSource]} style={{ margin: 0, borderRadius: 999, paddingInline: 14, paddingBlock: 6, fontWeight: 600 }}>
                {sourceLabels[aiSource]}
              </Tag>
              {aiRefreshing ? (
                <Tag color="blue" style={{ margin: 0, borderRadius: 999, paddingInline: 14, paddingBlock: 6, fontWeight: 600 }}>
                  Đang cập nhật
                </Tag>
              ) : null}
            </div>

            <h2 style={{ margin: 0, fontSize: 34, fontWeight: 900, color: 'var(--text-main)' }}>
              {isAuthenticated ? (aiData?.message || 'AI Recommendation cá nhân hóa') : 'Mở khóa AI Recommendation cá nhân hóa'}
            </h2>
            <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7 }}>
              {isAuthenticated
                ? aiSummary
                : 'Đăng nhập để mỗi sản phẩm có lý do gợi ý, độ phù hợp và trạng thái AI hoặc fallback rõ ràng.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ background: '#FFF7ED', borderRadius: 18, border: '1px solid #F3DCC5', padding: '12px 16px', minWidth: 140 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Nguồn dữ liệu</div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{sourceLabels[aiSource]}</div>
            </div>
            <div style={{ background: '#FFF7ED', borderRadius: 18, border: '1px solid #F3DCC5', padding: '12px 16px', minWidth: 140 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Số gợi ý</div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{isAuthenticated ? aiProducts.length : Math.min(featuredData.length, 4)}</div>
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          aiLoading && aiProducts.length === 0 ? (
            <AIProductSkeleton count={4} />
          ) : aiProducts.length > 0 ? (
            <Row gutter={[24, 24]}>
              {aiProducts.map((item) => (
                <Col key={item.product._id} xs={24} sm={12} md={8} lg={6}>
                  <AIRecCard
                    product={item.product}
                    placement="homepage"
                    matchPercent={item.matchPercent}
                    reasonTitle={item.reasonTitle}
                    reasons={item.reasons}
                    source={item.source}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <InsightEmptyState
              title="Chưa tạo được danh sách cá nhân hóa"
              description="Khi bạn tiếp tục xem sản phẩm và thêm vào giỏ, AI sẽ giải thích rõ hơn vì sao mỗi món được đề xuất."
            />
          )
        ) : (
          <div style={{ borderRadius: 28, padding: 28, background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)', border: '1px solid var(--border-color)' }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} lg={8}>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 900, color: 'var(--text-main)' }}>Đăng nhập để thấy lý do AI gợi ý</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Sau khi đăng nhập, mỗi sản phẩm sẽ có lý do đề xuất, độ phù hợp và cập nhật theo hành vi gần đây của bạn.
                  </p>
                  <Button type="primary" size="large" style={{ marginTop: 20 }} onClick={() => router.push('/login')}>
                    Đăng nhập để cá nhân hóa
                  </Button>
                </div>
              </Col>
              <Col xs={24} lg={16}>
                <Row gutter={[16, 16]}>
                  {featuredData.slice(0, 4).map((product) => (
                    <Col key={product._id} xs={24} sm={12}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        )}
      </section>

      <section style={{ padding: '80px 48px', background: isAuthenticated ? 'var(--bg-main)' : 'white' }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Sản Phẩm Nổi Bật</h2>
        </div>
        <Row gutter={[24, 24]}>
          {featuredData?.map((product) => (
            <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </section>

      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
