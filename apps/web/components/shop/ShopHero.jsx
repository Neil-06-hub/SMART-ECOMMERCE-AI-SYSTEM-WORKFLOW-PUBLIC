'use client';

import { motion } from 'framer-motion';
import { Tag, Typography } from 'antd';
import { RobotOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useMood } from '@/hooks/useMoodEngine';

const { Paragraph, Title } = Typography;

export default function ShopHero({
  totalProducts,
  aiCount,
  isLoading,
}) {
  const { mood } = useMood();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        marginBottom: 28,
        borderRadius: 28,
        padding: '36px 32px 32px',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 58%, #F8FAFC 100%)',
        border: '1px solid rgba(231, 217, 200, 0.9)',
        boxShadow: '0 24px 48px rgba(131, 61, 7, 0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${mood.glow}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Tag color="orange" style={{ borderRadius: 999, paddingInline: 14, paddingBlock: 5, fontWeight: 700, fontSize: 12 }}>
            <ThunderboltFilled /> Shopping Concierge
          </Tag>
          <Tag style={{
            borderRadius: 999, paddingInline: 14, paddingBlock: 5,
            fontWeight: 700, fontSize: 12,
            background: mood.accentSoft, border: `1px solid ${mood.accent}22`, color: mood.accent,
          }}>
            <RobotOutlined /> {mood.label}
          </Tag>
        </div>

        {/* Headline */}
        <Title level={1} style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 800 }}>
          Mua sắm thông minh.{' '}
          <span style={{ color: mood.accent }}>AI hiểu bạn.</span>
        </Title>
        <Paragraph style={{ margin: '12px 0 24px', maxWidth: 600, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Hãy trò chuyện với Trợ lý AI ở góc màn hình để nhận gợi ý sản phẩm được cá nhân hóa hoàn toàn theo nhu cầu của bạn.
        </Paragraph>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: mood.accent, boxShadow: `0 0 8px ${mood.glow}` }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{isLoading ? '...' : totalProducts}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>sản phẩm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.3)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{aiCount}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI đề xuất</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
