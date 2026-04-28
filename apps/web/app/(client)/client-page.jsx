'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Button, Rate, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';
import ProductCard from '@/components/product/ProductCard';
import AIRecCard from '@/components/ai/AIRecCard';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const sectionVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function FadeInSection({ children, delay = 0, style }) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

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
  { initials: 'MA', name: 'Nguyễn Minh Anh',   role: 'Shopper',              color: '#8B5CF6', text: 'AI gợi ý sản phẩm cực kỳ chính xác. Tôi tìm được đúng món mình cần chỉ sau vài phút.', stars: 5 },
  { initials: 'HL', name: 'Trần Hoàng Long',   role: 'Khách hàng thân thiết', color: '#0D9488', text: 'Email marketing tự động không còn cảm giác máy móc. Nội dung phù hợp với hành vi mua sắm thật sự.', stars: 5 },
  { initials: 'TH', name: 'Lê Thị Hương',     role: 'Chủ shop online',       color: '#EC4899', text: 'Dashboard AI giúp tôi nhìn rõ tăng trưởng và vùng cần tối ưu. Đây là khu vực tạo niềm tin mạnh nhất.', stars: 5 },
  { initials: 'PT', name: 'Phạm Thanh Tùng',  role: 'Freelancer',            color: '#F59E0B', text: 'Lần đầu tiên mua sắm online mà tôi không phải tìm kiếm mệt mỏi. AI đề xuất đúng gu thẩm mỹ của mình.', stars: 5 },
  { initials: 'NL', name: 'Ngô Thị Lan',      role: 'Sinh viên',             color: '#3B82F6', text: 'Giao diện rất mượt và đẹp. Nhận thông báo giỏ hàng bị bỏ quên rồi quay lại mua luôn.', stars: 5 },
  { initials: 'VK', name: 'Vũ Quốc Khánh',   role: 'Kỹ sư phần mềm',       color: '#10B981', text: 'Tích hợp AI vào e-commerce rất ấn tượng. Phần lý do gợi ý minh bạch, không cảm giác bị "ép" mua.', stars: 5 },
  { initials: 'BN', name: 'Bùi Ngọc Nhung',  role: 'Content Creator',       color: '#EF4444', text: 'Mỗi lần vào app là thấy sản phẩm mới khác nhau, phù hợp với thứ tôi đang quan tâm. Cực kỳ thông minh!', stars: 5 },
  { initials: 'DM', name: 'Đinh Văn Mạnh',   role: 'Doanh nhân',            color: '#6366F1', text: 'Báo cáo Business Insights giúp tôi ra quyết định nhập hàng nhanh hơn. Dữ liệu trực quan và dễ đọc.', stars: 5 },
  { initials: 'HQ', name: 'Hồ Thị Quỳnh',   role: 'Nội trợ',               color: '#D97706', text: 'Không ngờ AI hiểu mình đến vậy. Gợi ý đúng loại sản phẩm gia dụng tôi cần mà chưa kịp tìm.', stars: 5 },
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
  const preview = featuredProducts.slice(0, 2);

  const activitySignals = [
    { label: 'Đã xem', item: 'Giày Thể Thao Nike', weight: 85, color: '#E85D04' },
    { label: 'Thêm giỏ', item: 'Áo Polo Slim Fit', weight: 62, color: '#E85D04' },
    { label: 'Yêu thích', item: 'Balo Laptop 15"', weight: 44, color: '#0D9488' },
  ];

  return (
    <section style={{ position: 'relative', background: 'var(--bg-main)', padding: '72px 48px 64px', overflow: 'hidden' }}>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes heroSlideIn {
          from { opacity: 0; transform: translateX(34px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
        @keyframes aiDotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1); }
        }
        @keyframes aiBrainPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,93,4,0.35); }
          50%       { box-shadow: 0 0 0 8px rgba(232,93,4,0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: var(--tw); }
        }
        @keyframes orbHero1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(22px,-28px) scale(1.1); }
        }
        @keyframes orbHero2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(-18px,22px) scale(0.9); }
        }
        @keyframes liveBlip {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        @keyframes heroStatIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes meshBlob1 {
          0%, 100% { transform: translate(0,0)     scale(1);    }
          33%       { transform: translate(40px,-50px) scale(1.12); }
          66%       { transform: translate(-28px,32px) scale(0.92); }
        }
        @keyframes meshBlob2 {
          0%, 100% { transform: translate(0,0)      scale(1);    }
          33%       { transform: translate(-45px,28px) scale(0.88); }
          66%       { transform: translate(32px,-40px) scale(1.08); }
        }
        @keyframes meshBlob3 {
          0%, 100% { transform: translate(0,0)    scale(1);    }
          50%       { transform: translate(18px,24px) scale(1.06); }
        }
        @keyframes sparkleRise {
          0%   { opacity: 0;    transform: translateY(0px)   scale(0)    rotate(0deg);   }
          12%  { opacity: 0.55; transform: translateY(-6px)  scale(1)    rotate(12deg);  }
          80%  { opacity: 0.22; transform: translateY(-55px) scale(0.72) rotate(-10deg); }
          100% { opacity: 0;    transform: translateY(-75px) scale(0)    rotate(-22deg); }
        }
        @keyframes dotGridPulse {
          0%, 100% { opacity: 0.28; }
          50%       { opacity: 0.5;  }
        }
      `}</style>

      {/* ── Animated Background Layer ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Gradient blobs */}
        <div style={{ position: 'absolute', top: '-25%', left: '-12%', width: '62%', height: '80%', background: 'radial-gradient(ellipse at center, rgba(232,93,4,0.14) 0%, transparent 65%)', animation: 'meshBlob1 20s ease-in-out infinite', filter: 'blur(52px)' }} />
        <div style={{ position: 'absolute', bottom: '-25%', right: '-8%', width: '58%', height: '75%', background: 'radial-gradient(ellipse at center, rgba(248,113,113,0.11) 0%, transparent 65%)', animation: 'meshBlob2 24s ease-in-out infinite', filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', top: '15%', right: '10%', width: '42%', height: '58%', background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.09) 0%, transparent 65%)', animation: 'meshBlob3 17s ease-in-out infinite', filter: 'blur(36px)' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(232,93,4,0.18) 1px, transparent 1px)', backgroundSize: '34px 34px', animation: 'dotGridPulse 6s ease-in-out infinite' }} />
        {/* Floating sparkle particles */}
        {[
          { top: '18%', left: '6%',  delay: '0s',   dur: '7s',   size: 15, char: '✦' },
          { top: '62%', left: '11%', delay: '2.4s', dur: '9s',   size: 11, char: '◆' },
          { top: '38%', left: '20%', delay: '1.2s', dur: '6.5s', size: 9,  char: '✦' },
          { top: '78%', left: '38%', delay: '3.6s', dur: '8.5s', size: 13, char: '◆' },
          { top: '8%',  left: '52%', delay: '0.9s', dur: '10s',  size: 10, char: '✦' },
          { top: '72%', left: '70%', delay: '2.1s', dur: '7.5s', size: 12, char: '◆' },
          { top: '42%', left: '82%', delay: '4.3s', dur: '9s',   size: 8,  char: '✦' },
          { top: '22%', left: '90%', delay: '1.7s', dur: '8s',   size: 14, char: '◆' },
          { top: '55%', left: '46%', delay: '3.1s', dur: '6s',   size: 9,  char: '✦' },
          { top: '85%', left: '58%', delay: '0.6s', dur: '11s',  size: 11, char: '◆' },
          { top: '30%', left: '73%', delay: '5.0s', dur: '8s',   size: 7,  char: '✦' },
          { top: '90%', left: '25%', delay: '2.8s', dur: '9.5s', size: 10, char: '◆' },
        ].map((p, i) => (
          <div key={i} style={{ position: 'absolute', top: p.top, left: p.left, fontSize: p.size, color: i % 3 === 0 ? '#E85D04' : i % 3 === 1 ? '#F97316' : '#f87171', animation: `sparkleRise ${p.dur} ease-in-out ${p.delay} infinite`, userSelect: 'none', lineHeight: 1 }}>
            {p.char}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

        {/* ── Left column ── */}
        <div style={{ flex: '1 1 420px' }}>
          <div style={{ marginBottom: 22, animation: 'heroFadeUp 0.55s ease 0.05s both' }}>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-teal-light))', color: 'white', padding: '8px 24px', borderRadius: 999, fontSize: 15, fontWeight: 600 }}>
              Powered by Google Gemini AI
            </span>
          </div>

          <h1 style={{ margin: '0 0 20px', lineHeight: 1.1 }}>
            <div style={{ fontSize: 60, fontWeight: 900, color: 'var(--text-main)', animation: 'heroFadeUp 0.6s ease 0.12s both' }}>Mua Sắm Thông Minh</div>
            <div style={{ fontSize: 60, fontWeight: 900, animation: 'heroFadeUp 0.6s ease 0.22s both' }} className="text-gradient-ai">Trải Nghiệm AI</div>
            <div style={{ fontSize: 60, fontWeight: 900, animation: 'heroFadeUp 0.6s ease 0.32s both' }} className="text-gradient-teal">Cá Nhân Hóa 100%</div>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: 17, margin: '0 0 36px', maxWidth: 500, lineHeight: 1.75, animation: 'heroFadeUp 0.6s ease 0.42s both' }}>
            Hệ thống AI phân tích sở thích của bạn để gợi ý sản phẩm phù hợp hơn, giao tiếp rõ ràng hơn và giảm ma sát khi ra quyết định mua sắm.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'heroFadeUp 0.6s ease 0.5s both' }}>
            <Button
              size="large"
              onClick={() => router.push('/shop')}
              className="bg-gradient-ai"
              style={{ border: 'none', color: 'white', borderRadius: 999, fontWeight: 700, height: 54, padding: '0 36px', fontSize: 16 }}
            >
              Khám Phá Ngay →
            </Button>
            <Button
              size="large"
              onClick={() => router.push('/ai-suggest')}
              style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(232,93,4,0.35)', color: '#E85D04', borderRadius: 999, fontWeight: 700, height: 54, padding: '0 36px', fontSize: 16 }}
            >
              Xem Demo AI
            </Button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 36, marginTop: 44, animation: 'heroStatIn 0.7s ease 0.7s both' }}>
            {[
              { num: '1,000+', label: 'Sản phẩm AI' },
              { num: '98%',    label: 'Độ chính xác' },
              { num: '24/7',   label: 'Cập nhật live' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{stat.num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: animated AI glass card ── */}
        <div style={{ flex: '1 1 340px', maxWidth: 430, position: 'relative', animation: 'heroSlideIn 0.75s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}>
          {/* Background orbs */}
          <div style={{ position: 'absolute', top: -55, right: -55, width: 230, height: 230, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,93,4,0.2) 0%, transparent 70%)', animation: 'orbHero1 10s ease-in-out infinite', filter: 'blur(10px)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: -35, left: -35, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,93,4,0.17) 0%, transparent 70%)', animation: 'orbHero2 13s ease-in-out infinite', filter: 'blur(10px)', pointerEvents: 'none', zIndex: 0 }} />

          {/* Glassmorphism card */}
          <div style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.92)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.1), 0 8px 24px rgba(232,93,4,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: '24px',
            overflow: 'hidden',
          }}>

            {/* AI analyzing header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 16px', background: 'linear-gradient(135deg, rgba(232,93,4,0.07), rgba(249,115,22,0.04))', borderRadius: 16, border: '1px solid rgba(232,93,4,0.1)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #E85D04, #F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'aiBrainPulse 2.2s ease-in-out infinite' }}>
                <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>✦</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#E85D04' }}>AI đang phân tích hành vi</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Cá nhân hóa theo thời gian thực</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D04', animation: `aiDotPulse 1.4s ease-in-out ${i * 0.28}s infinite` }} />
                ))}
              </div>
            </div>

            {/* Activity signals */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Tín hiệu hành vi</div>
              {activitySignals.map((sig, i) => (
                <div key={sig.label} style={{ marginBottom: 8, animation: `heroFadeUp 0.5s ease ${0.45 + i * 0.15}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 700, color: sig.color }}>{sig.label}:</span> {sig.item}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sig.color }}>{sig.weight}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${sig.color}, ${sig.color}99)`,
                      animation: `progressFill 1.1s ease ${0.65 + i * 0.2}s both`,
                      '--tw': `${sig.weight}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Product previews */}
            {preview.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Gợi ý hàng đầu</div>
                {preview.map((product, index) => (
                  <div
                    key={product._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', marginBottom: index < preview.length - 1 ? 8 : 0,
                      background: 'white', borderRadius: 14,
                      border: '1px solid var(--border-color)',
                      animation: `heroFadeUp 0.5s ease ${0.85 + index * 0.2}s both`,
                    }}
                  >
                    <img
                      src={product.image || 'https://placehold.co/48x48/f1f5f9/a1a1aa?text=P'}
                      alt={product.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </div>
                      <div style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 12, marginTop: 2 }}>
                        {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                      </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #E85D04, #F97316)', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {98 - index * 4}% ✦
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live indicator */}
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-main)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Cập nhật theo thời gian thực</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'liveBlip 1.8s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── SVG Illustrations ── */
const BrainSVG = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="6" fill="#f87171" fillOpacity="0.9"/>
    {[0,60,120,180,240,300].map((deg, i) => {
      const r = 14; const rad = (deg * Math.PI) / 180;
      const x = 18 + r * Math.cos(rad); const y = 18 + r * Math.sin(rad);
      return <g key={i}>
        <line x1="18" y1="18" x2={x} y2={y} stroke="#f87171" strokeWidth="1.5" strokeOpacity="0.5"/>
        <circle cx={x} cy={y} r="3" fill="#fb923c" fillOpacity="0.8"/>
      </g>;
    })}
    <circle cx="18" cy="18" r="16" stroke="#f87171" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" fill="none"/>
  </svg>
);

const MailSVG = () => (
  <svg width="56" height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="54" height="42" rx="8" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="1.5"/>
    <path d="M1 9L28 26L55 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M1 9L18 23" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round"/>
    <path d="M55 9L38 23" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round"/>
  </svg>
);

const ChartSVG = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="18" width="6" height="14" rx="2" fill="#E85D04" fillOpacity="0.7"/>
    <rect x="11" y="10" width="6" height="22" rx="2" fill="#E85D04" fillOpacity="0.9"/>
    <rect x="20" y="14" width="6" height="18" rx="2" fill="#E85D04" fillOpacity="0.6"/>
    <rect x="29" y="6" width="4" height="26" rx="2" fill="#F97316"/>
    <path d="M2 6L32 6" stroke="#EBEBEB" strokeWidth="1" strokeDasharray="3 2"/>
  </svg>
);

/* ── Recommendation products for Card 1 ── */
const REC_PRODUCTS = [
  { name: 'Nike Air Force 1', cat: 'Giày thể thao', match: 96, color: '#F97316', icon: '👟' },
  { name: 'MacBook Air M3',   cat: 'Laptop',        match: 93, color: '#8B5CF6', icon: '💻' },
  { name: 'Áo Polo Premium',  cat: 'Thời trang',    match: 91, color: '#0D9488', icon: '👕' },
  { name: 'AirPods Pro 2',    cat: 'Âm thanh',      match: 88, color: '#3B82F6', icon: '🎧' },
  { name: 'Smart Watch S9',   cat: 'Phụ kiện',      match: 85, color: '#EC4899', icon: '⌚' },
];

/* ── Chart data snapshots for Card 3 ── */
const CUSTOMER_SNAPSHOTS = [
  [{ age: '18-24', gender: 'Nữ', count: 25 }, { age: '18-24', gender: 'Nam', count: 15 }, { age: '25-34', gender: 'Nữ', count: 55 }, { age: '25-34', gender: 'Nam', count: 40 }, { age: '35-44', gender: 'Nữ', count: 20 }, { age: '35-44', gender: 'Nam', count: 35 }, { age: '45-54', gender: 'Nữ', count: 15 }, { age: '45-54', gender: 'Nam', count: 20 }, { age: '55+', gender: 'Nữ', count: 5 }, { age: '55+', gender: 'Nam', count: 10 }],
  [{ age: '18-24', gender: 'Nữ', count: 30 }, { age: '18-24', gender: 'Nam', count: 22 }, { age: '25-34', gender: 'Nữ', count: 48 }, { age: '25-34', gender: 'Nam', count: 52 }, { age: '35-44', gender: 'Nữ', count: 28 }, { age: '35-44', gender: 'Nam', count: 30 }, { age: '45-54', gender: 'Nữ', count: 18 }, { age: '45-54', gender: 'Nam', count: 25 }, { age: '55+', gender: 'Nữ', count: 8 }, { age: '55+', gender: 'Nam', count: 12 }],
  [{ age: '18-24', gender: 'Nữ', count: 42 }, { age: '18-24', gender: 'Nam', count: 18 }, { age: '25-34', gender: 'Nữ', count: 60 }, { age: '25-34', gender: 'Nam', count: 35 }, { age: '35-44', gender: 'Nữ', count: 25 }, { age: '35-44', gender: 'Nam', count: 40 }, { age: '45-54', gender: 'Nữ', count: 12 }, { age: '45-54', gender: 'Nam', count: 18 }, { age: '55+', gender: 'Nữ', count: 6 }, { age: '55+', gender: 'Nam', count: 9 }],
];

const SALES_SNAPSHOTS = [
  [{ month: 'T1', product: 'Giày', sales: 120 }, { month: 'T1', product: 'Áo', sales: 80 }, { month: 'T1', product: 'Balo', sales: 40 }, { month: 'T2', product: 'Giày', sales: 130 }, { month: 'T2', product: 'Áo', sales: 90 }, { month: 'T2', product: 'Balo', sales: 45 }, { month: 'T3', product: 'Giày', sales: 110 }, { month: 'T3', product: 'Áo', sales: 105 }, { month: 'T3', product: 'Balo', sales: 60 }, { month: 'T4', product: 'Giày', sales: 140 }, { month: 'T4', product: 'Áo', sales: 110 }, { month: 'T4', product: 'Balo', sales: 70 }, { month: 'T5', product: 'Giày', sales: 160 }, { month: 'T5', product: 'Áo', sales: 130 }, { month: 'T5', product: 'Balo', sales: 90 }],
  [{ month: 'T3', product: 'Giày', sales: 110 }, { month: 'T3', product: 'Áo', sales: 105 }, { month: 'T3', product: 'Balo', sales: 60 }, { month: 'T4', product: 'Giày', sales: 155 }, { month: 'T4', product: 'Áo', sales: 125 }, { month: 'T4', product: 'Balo', sales: 80 }, { month: 'T5', product: 'Giày', sales: 180 }, { month: 'T5', product: 'Áo', sales: 145 }, { month: 'T5', product: 'Balo', sales: 105 }, { month: 'T6', product: 'Giày', sales: 200 }, { month: 'T6', product: 'Áo', sales: 160 }, { month: 'T6', product: 'Balo', sales: 120 }, { month: 'T7', product: 'Giày', sales: 175 }, { month: 'T7', product: 'Áo', sales: 180 }, { month: 'T7', product: 'Balo', sales: 135 }],
  [{ month: 'T5', product: 'Giày', sales: 175 }, { month: 'T5', product: 'Áo', sales: 130 }, { month: 'T5', product: 'Balo', sales: 90 }, { month: 'T6', product: 'Giày', sales: 210 }, { month: 'T6', product: 'Áo', sales: 170 }, { month: 'T6', product: 'Balo', sales: 125 }, { month: 'T7', product: 'Giày', sales: 195 }, { month: 'T7', product: 'Áo', sales: 195 }, { month: 'T7', product: 'Balo', sales: 145 }, { month: 'T8', product: 'Giày', sales: 230 }, { month: 'T8', product: 'Áo', sales: 210 }, { month: 'T8', product: 'Balo', sales: 160 }, { month: 'T9', product: 'Giày', sales: 215 }, { month: 'T9', product: 'Áo', sales: 220 }, { month: 'T9', product: 'Balo', sales: 175 }],
];

const CHART_STATS = [
  { users: '12.4K', orders: '3.2K', revenue: '285M' },
  { users: '14.1K', orders: '3.8K', revenue: '342M' },
  { users: '16.8K', orders: '4.5K', revenue: '408M' },
];

/* ── Email notification feed for Card 2 ── */
const EMAIL_FEEDS = [
  { avatar: 'MA', color: '#8B5CF6', name: 'Minh Anh', msg: 'Giỏ hàng của bạn đang chờ!', time: 'vừa xong', icon: '🛒' },
  { avatar: 'HL', color: '#0D9488', name: 'Hoàng Long', msg: 'Flash sale 50% hôm nay!', time: '2 phút', icon: '⚡' },
  { avatar: 'TH', color: '#EC4899', name: 'Thị Hương', msg: 'Sản phẩm bạn xem đã về hàng', time: '5 phút', icon: '📦' },
  { avatar: 'VK', color: '#3B82F6', name: 'Văn Khánh', msg: 'AI đề xuất 5 sản phẩm mới', time: '8 phút', icon: '✦' },
];

const cardHover = {
  rest:  { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.10)', transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerItem = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function AIFeaturesSection() {
  const [recIdx, setRecIdx]         = useState(0);
  const [chartSnap, setChartSnap]   = useState(0);
  const [feedIdx, setFeedIdx]       = useState(0);
  const [statsIn, setStatsIn]       = useState(false);
  const [sending, setSending]       = useState(false);
  const statsRef = useRef(null);

  /* Cycling effects */
  useEffect(() => {
    const id = setInterval(() => setRecIdx(i => (i + 1) % REC_PRODUCTS.length), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setChartSnap(s => (s + 1) % 3), 3600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFeedIdx(i => (i + 1) % EMAIL_FEEDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  /* Sending flash every 5s */
  useEffect(() => {
    const id = setInterval(() => {
      setSending(true);
      setTimeout(() => setSending(false), 900);
    }, 4800);
    return () => clearInterval(id);
  }, []);

  /* Stats count-up on scroll into view */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsIn(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const currentRec   = REC_PRODUCTS[recIdx];
  const nextRec      = REC_PRODUCTS[(recIdx + 1) % REC_PRODUCTS.length];
  const currentFeed  = EMAIL_FEEDS[feedIdx];
  const currentStats = CHART_STATS[chartSnap];

  const customerConfig = {
    data: CUSTOMER_SNAPSHOTS[chartSnap],
    xField: 'age', yField: 'count', colorField: 'gender',
    shapeField: 'smooth', smooth: true, height: 110, autoFit: true,
    color: ['#f97316', '#3b82f6'],
    xAxis: { label: { style: { fontSize: 9 } }, line: null, tickLine: null, grid: null },
    yAxis: { label: null, grid: null, line: null },
    areaStyle: { fillOpacity: 0.45 },
    legend: { position: 'top-right', itemName: { style: { fontSize: 9 } } },
    tooltip: { showMarkers: false },
    animation: { appear: { animation: 'wave-in', duration: 1100, easing: 'ease-in-out' }, update: { animation: 'morphing', duration: 700 } },
  };

  const salesConfig = {
    data: SALES_SNAPSHOTS[chartSnap],
    xField: 'month', yField: 'sales', colorField: 'product',
    shapeField: 'smooth', smooth: true, height: 110, autoFit: true,
    color: ['#f97316', '#3b82f6', '#10b981'],
    xAxis: { label: { style: { fontSize: 9 } }, line: null, tickLine: null, grid: null },
    yAxis: { label: null, grid: null, line: null },
    areaStyle: { fillOpacity: 0.5 },
    legend: { position: 'top', layout: 'horizontal', itemName: { style: { fontSize: 9 } } },
    tooltip: { showMarkers: false },
    animation: { appear: { animation: 'wave-in', duration: 1100, easing: 'ease-in-out' }, update: { animation: 'morphing', duration: 700 } },
  };

  return (
    <section style={{ padding: '80px 48px', background: 'white' }}>
      <style>{`
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mailFly   { 0% { transform: translateX(0) translateY(0) scale(1); opacity: 1; } 100% { transform: translateX(60px) translateY(-40px) scale(0.5); opacity: 0; } }
        @keyframes feedSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countUp   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotPulse  { 0%, 100% { opacity: 0.3; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes scanRing  { 0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.4); } 50% { box-shadow: 0 0 0 10px rgba(248,113,113,0); } }
      `}</style>

      {/* Header */}
      <motion.div
        variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
        style={{ textAlign: 'center', marginBottom: 52 }}
      >
        <motion.div variants={staggerItem}>
          <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 16 }}>
            Tính Năng Nổi Bật
          </span>
        </motion.div>
        <motion.h2 variants={staggerItem} style={{ fontSize: 40, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>
          Công Nghệ AI <span className="text-gradient-ai">Thay Đổi Cách Mua Sắm</span>
        </motion.h2>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}
      >

        {/* ── Card 1: AI Recommendation ── */}
        <motion.div variants={staggerItem} whileHover="hover" initial="rest" animate="rest">
          <motion.div
            variants={cardHover}
            style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fff7ed 100%)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 28, padding: 28, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 440 }}
          >
            {/* Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(248,113,113,0.15)', animation: 'scanRing 2.4s ease-in-out infinite' }}>
                <BrainSVG />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)', lineHeight: 1.2 }}>AI Recommendation</div>
                <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600, marginTop: 2 }}>● Live · đang phân tích</div>
              </div>
            </div>

            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: 14, margin: '0 0 20px' }}>
              Kết hợp nội dung và hành vi để gợi ý đúng sản phẩm hơn, đồng thời giải thích vì sao món đó xuất hiện.
            </p>

            {/* Animated recommendation preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Đề xuất cho bạn</div>

              {/* Active rec */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={recIdx}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ background: 'white', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.07)', border: `1.5px solid ${currentRec.color}22` }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${currentRec.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {currentRec.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentRec.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{currentRec.cat}</div>
                  </div>
                  <div style={{ background: `linear-gradient(135deg, ${currentRec.color}, ${currentRec.color}cc)`, color: 'white', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                    {currentRec.match}%
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Upcoming (faded) */}
              <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.55 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {nextRec.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text)' }}>{nextRec.name}</div>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#f87171', animation: `dotPulse 1.2s ease-in-out ${i * 0.3}s infinite` }} />)}
                </div>
              </div>

              {/* Match bar */}
              <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Độ phù hợp</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: currentRec.color }}>{currentRec.match}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    key={recIdx}
                    initial={{ width: '0%' }}
                    animate={{ width: `${currentRec.match}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${currentRec.color}, ${currentRec.color}99)` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Card 2: Auto Marketing ── */}
        <motion.div variants={staggerItem} whileHover="hover" initial="rest" animate="rest">
          <motion.div
            variants={cardHover}
            className="bg-gradient-ai"
            style={{ borderRadius: 28, height: '100%', minHeight: 440, display: 'flex', flexDirection: 'column', padding: 28, boxShadow: '0 12px 36px rgba(249,115,22,0.22)', position: 'relative', overflow: 'hidden' }}
          >
            {/* BG circles */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

            {/* Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', color: 'white', fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 999 }}>
                ✉ Smart Marketing
              </span>
              <motion.div
                animate={sending ? { scale: [1, 1.15, 1], opacity: [1, 0.6, 1] } : {}}
                transition={{ duration: 0.5 }}
                style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: 'white' }}
              >
                {sending ? '📤 Đang gửi...' : '● Live'}
              </motion.div>
            </div>

            {/* Animated mail illustration */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20, height: 80 }}>
              <motion.div
                animate={sending ? { x: [0, 50], y: [0, -30], scale: [1, 0.5], opacity: [1, 0] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeIn' }}
              >
                <MailSVG />
              </motion.div>

              {/* Orbit dots */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                {[0, 72, 144, 216, 288].map((deg, i) => {
                  const r = 44; const rad = (deg * Math.PI) / 180;
                  return (
                    <div key={i} style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', left: `calc(50% + ${r * Math.cos(rad)}px - 4px)`, top: `calc(50% + ${r * Math.sin(rad)}px - 4px)`, animation: `dotPulse 1.6s ease-in-out ${i * 0.28}s infinite` }} />
                  );
                })}
              </div>
            </div>

            {/* Notification feed */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Email vừa gửi</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={feedIdx}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  style={{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.2)', marginBottom: 8 }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: currentFeed.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {currentFeed.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentFeed.msg}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Đến: {currentFeed.name} · {currentFeed.time}</div>
                  </div>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{currentFeed.icon}</span>
                </motion.div>
              </AnimatePresence>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                {[{ label: 'Hôm nay', val: '2,450' }, { label: 'Open rate', val: '68%' }, { label: 'Click', val: '12%' }].map(s => (
                  <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'white' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom label */}
            <div style={{ marginTop: 18 }}>
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Auto Marketing</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                AI tự động viết nội dung cá nhân hóa, nhắc giỏ hàng và giữ nhịp tương tác nhất quán.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Card 3: Business Insights ── */}
        <motion.div variants={staggerItem} whileHover="hover" initial="rest" animate="rest">
          <motion.div
            variants={cardHover}
            ref={statsRef}
            style={{ borderRadius: 28, padding: 28, background: 'white', border: '1px solid var(--color-border)', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 440 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, background: 'rgba(232,93,4,0.08)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChartSVG />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)', lineHeight: 1.2 }}>Business Insights</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500, marginTop: 2 }}>
                  Dữ liệu · <span style={{ color: '#22C55E', fontWeight: 700 }}>Live</span>
                </div>
              </div>
              {/* Snapshot indicator */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: i === chartSnap ? 16 : 6, height: 6, borderRadius: 999, background: i === chartSnap ? 'var(--color-primary)' : 'var(--color-border)', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>

            {/* Count-up KPI stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Người dùng', val: currentStats.users, color: '#8B5CF6' },
                { label: 'Đơn hàng',  val: currentStats.orders, color: '#0D9488' },
                { label: 'Doanh thu', val: currentStats.revenue + 'đ', color: 'var(--color-primary)' },
              ].map((stat, i) => (
                <AnimatePresence mode="wait" key={stat.label}>
                  <motion.div
                    key={`${stat.label}-${chartSnap}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={statsIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                    style={{ background: 'var(--color-bg)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 17, color: stat.color, lineHeight: 1 }}>{stat.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>

            {/* Charts — re-render triggers wave-in animation */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--color-bg)', padding: '12px 14px', borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>Phân Bố Khách Hàng</div>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'white', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--color-border)' }}>Minh họa</span>
                </div>
                <Area key={`demo-${chartSnap}`} {...customerConfig} />
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '12px 14px', borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>Top Bán Chạy</div>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'white', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--color-border)' }}>Minh họa</span>
                </div>
                <Area key={`sales-${chartSnap}`} {...salesConfig} />
              </div>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
}

const CARDS_PER_PAGE = 3;
const SLIDE_INTERVAL = 4000;

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

function TestimonialCard({ item }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: 28,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid var(--color-border)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 15,
        }}>
          {item.initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', lineHeight: 1.3 }}>{item.name}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>{item.role}</div>
        </div>
      </div>
      <p style={{ color: 'var(--color-text)', fontSize: 14, lineHeight: 1.7, flex: 1, fontStyle: 'italic', margin: '0 0 18px' }}>
        &ldquo;{item.text}&rdquo;
      </p>
      <Rate disabled defaultValue={item.stars} style={{ fontSize: 14, color: 'var(--color-primary)' }} />
    </div>
  );
}

function TestimonialsSection() {
  const total = testimonials.length;
  const pageCount = Math.ceil(total / CARDS_PER_PAGE);

  const [page, setPage]       = useState(0);
  const [dir, setDir]         = useState(1);
  const [paused, setPaused]   = useState(false);

  const goTo = useCallback((next) => {
    setDir(next > page ? 1 : -1);
    setPage(next);
  }, [page]);

  const next = useCallback(() => {
    const n = (page + 1) % pageCount;
    setDir(1);
    setPage(n);
  }, [page, pageCount]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  const visible = testimonials.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  return (
    <section
      style={{ padding: '80px 48px', background: 'var(--color-bg)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'rgba(232,93,4,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(232,93,4,0.18)', marginBottom: 16 }}>
          Đánh Giá Thực Tế
        </span>
        <h2 style={{ fontSize: 38, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>
          Trải Nghiệm Từ <span className="text-gradient-teal">Người Dùng</span>
        </h2>
        <p style={{ marginTop: 8, color: 'var(--color-text-muted)', fontSize: 14 }}>
          Đánh giá minh họa từ người dùng bản Beta
        </p>
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {visible.map((item) => (
                <TestimonialCard key={item.name} item={item} />
              ))}
              {/* Pad with empty placeholders if last page has < 3 items */}
              {visible.length < CARDS_PER_PAGE && Array.from({ length: CARDS_PER_PAGE - visible.length }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators + counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 36 }}>
        {/* Prev */}
        <button
          onClick={() => goTo((page - 1 + pageCount) % pageCount)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--color-text-muted)', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          ‹
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === page ? 24 : 8,
                height: 8,
                borderRadius: 999,
                border: 'none',
                background: i === page ? 'var(--color-primary)' : 'var(--color-border)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => goTo((page + 1) % pageCount)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--color-text-muted)', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          ›
        </button>
      </div>

      {/* Auto-play progress bar */}
      {!paused && (
        <div style={{ maxWidth: 200, margin: '16px auto 0', height: 2, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
          <motion.div
            key={page}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
            style={{ height: '100%', background: 'var(--color-primary)', borderRadius: 999 }}
          />
        </div>
      )}
    </section>
  );
}

function CTAAnimatedVisual() {
  const orbitItems = [
    { icon: '👟', label: 'Giày thể thao', score: '98%' },
    { icon: '👕', label: 'Áo Polo Slim', score: '95%' },
    { icon: '🎒', label: 'Balo Laptop', score: '91%' },
  ];
  const ORBIT_R = 118;
  const DURATION = '13s';

  return (
    <div style={{ flex: '1 1 280px', maxWidth: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes ctaHubSpin    { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes ctaHubCounter { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        @keyframes ctaHubGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,93,4,0.5), 0 8px 32px rgba(232,93,4,0.4); }
          50%       { box-shadow: 0 0 0 18px rgba(232,93,4,0.06), 0 8px 32px rgba(232,93,4,0.5); }
        }
        @keyframes ctaRingExpand {
          0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 0.55; }
          100% { transform: translate(-50%,-50%) scale(1.55); opacity: 0; }
        }
        @keyframes ctaDotFloat {
          0%, 100% { transform: translateY(0) scale(1);    opacity: 0.45; }
          50%       { transform: translateY(-11px) scale(1.3); opacity: 1; }
        }
        @keyframes ctaCardIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ position: 'relative', width: 300, height: 300, flexShrink: 0 }}>
        {/* Pulsing expand rings */}
        {[0, 1].map((i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 160, height: 160, borderRadius: '50%',
            border: '2px solid rgba(232,93,4,0.35)',
            animation: `ctaRingExpand 3.2s ease-out ${i * 1.6}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Dashed orbit track */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: ORBIT_R * 2, height: ORBIT_R * 2, borderRadius: '50%',
          border: '1.5px dashed rgba(232,93,4,0.22)',
          transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        }} />

        {/* Central AI hub */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #E85D04, #F97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 26, fontWeight: 900, zIndex: 3,
          animation: 'ctaHubGlow 2.6s ease-in-out infinite',
        }}>✦</div>

        {/* Orbiting product cards */}
        {orbitItems.map((item, i) => {
          const startDeg = i * 120;
          const delay = `-${(i * parseFloat(DURATION)) / orbitItems.length}s`;
          return (
            <div key={item.label} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 0, height: 0,
              transform: `rotate(${startDeg}deg)`,
              animation: `ctaHubSpin ${DURATION} linear infinite`,
              animationDelay: delay,
              zIndex: 2,
            }}>
              <div style={{
                position: 'absolute',
                left: ORBIT_R, top: 0,
                transform: 'translate(-50%,-50%)',
                animation: `ctaHubCounter ${DURATION} linear infinite`,
                animationDelay: delay,
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 14,
                  padding: '8px 14px',
                  boxShadow: '0 6px 22px rgba(0,0,0,0.11)',
                  border: '1px solid rgba(232,93,4,0.2)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap',
                  animation: `ctaCardIn 0.4s ease ${0.1 + i * 0.15}s both`,
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: '#E85D04', fontWeight: 800 }}>{item.score} ✦</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Ambient floating dots */}
        {[
          { top: '12%', left: '16%', dur: '2.4s', delay: '0s' },
          { top: '78%', left: '10%', dur: '2.9s', delay: '0.6s' },
          { top: '82%', left: '74%', dur: '2.2s', delay: '1.1s' },
          { top: '8%',  left: '74%', dur: '3.1s', delay: '0.3s' },
          { top: '50%', left: '5%',  dur: '2.7s', delay: '0.9s' },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', top: d.top, left: d.left,
            width: 7, height: 7, borderRadius: '50%',
            background: 'rgba(232,93,4,0.55)',
            animation: `ctaDotFloat ${d.dur} ease-in-out ${d.delay} infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function CTASection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  return (
    <section>
      <style>{`
        @keyframes ctaBgOrb1 {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.7; }
          50%       { transform: translate(28px,-22px) scale(1.12); opacity: 0.9; }
        }
        @keyframes ctaBgOrb2 {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.55; }
          50%       { transform: translate(-22px,18px) scale(0.88); opacity: 0.75; }
        }
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes prodFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-9px) rotate(1.5deg); }
          66%       { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes prodFadeIn {
          from { opacity: 0; transform: translateY(18px) scale(0.88); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes prodBadge {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(232,93,4,0.4); }
          50%       { transform: scale(1.08); box-shadow: 0 0 0 4px rgba(232,93,4,0);  }
        }
      `}</style>

      <div style={{ margin: '0 48px 80px', borderRadius: 32, background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', padding: '64px 48px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(249,115,22,0.2)' }}>

        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '8%', left: '3%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)', animation: 'ctaBgOrb1 14s ease-in-out infinite', filter: 'blur(24px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '8%', right: '4%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.24) 0%, transparent 70%)', animation: 'ctaBgOrb2 18s ease-in-out infinite', filter: 'blur(32px)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* Left: animated AI visual */}
          <CTAAnimatedVisual />

          {/* Right: CTA content */}
          <div style={{ flex: '1 1 300px', maxWidth: 460, textAlign: 'center', animation: 'ctaFadeUp 0.6s ease 0.2s both' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: 44, fontWeight: 900, margin: '0 0 14px', lineHeight: 1.15 }}>
              {isAuthenticated ? 'Tiếp Tục Trải Nghiệm AI' : 'Sẵn Sàng Mua Sắm Thông Minh?'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, margin: '0 auto 32px', maxWidth: 380, lineHeight: 1.75 }}>
              {isAuthenticated
                ? 'AI đang theo dõi hành vi của bạn để liên tục cải thiện danh sách gợi ý phù hợp nhất.'
                : 'Tạo tài khoản ngay hôm nay để kích hoạt gợi ý cá nhân hóa, feedback thời gian thực và trải nghiệm mua sắm mượt hơn.'}
            </p>
            <Button
              size="large"
              onClick={() => router.push(isAuthenticated ? '/shop' : '/register')}
              className="bg-gradient-ai"
              style={{ border: 'none', color: 'white', borderRadius: 999, fontWeight: 700, height: 54, padding: '0 44px', fontSize: 17, marginBottom: 28, boxShadow: '0 12px 32px rgba(232,93,4,0.28)' }}
            >
              {isAuthenticated ? 'Khám Phá Sản Phẩm →' : 'Bắt Đầu Trải Nghiệm AI'}
            </Button>
            {/* Animated product cards */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: '👟', name: 'Nike Air Max', price: '1.250.000đ', badge: 'HOT',  badgeColor: '#E85D04', dur: '3.2s', delay: '0s'    },
                { icon: '💻', name: 'MacBook Air',  price: '28.990.000đ', badge: 'NEW',  badgeColor: '#0D9488', dur: '2.8s', delay: '0.4s'  },
                { icon: '📱', name: 'iPhone 15',    price: '22.590.000đ', badge: 'SALE', badgeColor: '#7C3AED', dur: '3.5s', delay: '0.9s'  },
                { icon: '⌚', name: 'Smart Watch',  price: '4.990.000đ',  badge: 'HOT',  badgeColor: '#E85D04', dur: '2.6s', delay: '1.3s'  },
              ].map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.80)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 18,
                    padding: '14px 16px',
                    minWidth: 100,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                    textAlign: 'center',
                    animation: `prodFadeIn 0.5s ease ${0.3 + i * 0.12}s both, prodFloat ${item.dur} ease-in-out ${item.delay} infinite`,
                    cursor: 'default',
                  }}
                >
                  {/* Badge */}
                  <div style={{
                    position: 'absolute', top: -8, right: -6,
                    background: item.badgeColor, color: 'white',
                    fontSize: 9, fontWeight: 800, padding: '3px 7px',
                    borderRadius: 999,
                    animation: `prodBadge 2s ease-in-out ${item.delay} infinite`,
                  }}>
                    {item.badge}
                  </div>
                  {/* Emoji */}
                  <div style={{ fontSize: 28, marginBottom: 6, lineHeight: 1 }}>{item.icon}</div>
                  {/* Name */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginBottom: 3, whiteSpace: 'nowrap' }}>{item.name}</div>
                  {/* Price */}
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#E85D04' }}>{item.price}</div>
                </div>
              ))}
            </div>
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

      <FadeInSection>
        <AIFeaturesSection />
      </FadeInSection>

      <FadeInSection>
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
      </FadeInSection>

      <FadeInSection>
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
      </FadeInSection>

      <FadeInSection>
        <TestimonialsSection />
      </FadeInSection>

      <FadeInSection>
        <CTASection />
      </FadeInSection>
    </div>
  );
}
