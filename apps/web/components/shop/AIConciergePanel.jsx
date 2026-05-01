'use client';

import { useState } from 'react';
import { Button, Switch, Typography, message } from 'antd';
import {
  LoginOutlined,
  RobotOutlined,
  ShoppingOutlined,
  ThunderboltFilled,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AIRecCard from '@/components/ai/AIRecCard';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';
import AIProductSkeleton from '@/components/feedback/AIProductSkeleton';

const { Paragraph, Text } = Typography;

const formatPrice = (v) => `${new Intl.NumberFormat('vi-VN').format(v || 0)}đ`;

const panelVariants = {
  hidden: { x: 40, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 26, stiffness: 280 },
  },
  exit: { x: 40, opacity: 0, transition: { duration: 0.2 } },
};

export default function AIConciergePanel({
  aiProducts = [],
  aiSource = 'model',
  aiLoading,
  aiEnabled,
  setAiEnabled,
  isAuthenticated,
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile floating pill */}
      <motion.div
        className="concierge-pill"
        onClick={() => setCollapsed(false)}
        style={{
          background: 'linear-gradient(135deg, var(--mood-accent), #F97316)',
          color: 'white',
        }}
        whileTap={{ scale: 0.95 }}
      >
        <RobotOutlined style={{ fontSize: 16 }} />
        AI • {aiProducts.length} gợi ý
      </motion.div>

      {/* Desktop sidebar */}
      <div
        style={{
          position: 'sticky',
          top: 88,
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: collapsed ? 'none' : 'block',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(232,93,4,0.2) transparent',
        }}
      >
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            borderRadius: 24,
            padding: 20,
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: 10, marginBottom: 18,
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--mood-accent), #F97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 17,
                  boxShadow: '0 4px 14px var(--mood-glow)',
                }}
              >
                <ThunderboltFilled />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                  AI Concierge
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Gợi ý theo hồ sơ của bạn
                </div>
              </div>
            </div>
            <Switch
              checked={aiEnabled}
              onChange={setAiEnabled}
              size="small"
            />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {!aiEnabled ? (
              <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InsightEmptyState
                  compact
                  title="AI đang tạm tắt"
                  description="Bật lại để xem sản phẩm phù hợp cao với nhu cầu của bạn."
                />
              </motion.div>
            ) : !isAuthenticated ? (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InsightEmptyState
                  compact
                  title="Đăng nhập để cá nhân hóa"
                  description="Hệ thống cần lịch sử duyệt để gợi ý chính xác hơn."
                  actionLabel="Đăng nhập"
                  onAction={() => router.push('/login')}
                  icon={<LoginOutlined />}
                  accentColor="#7C3AED"
                  accentBackground="rgba(124, 58, 237, 0.12)"
                />
              </motion.div>
            ) : aiLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIProductSkeleton count={1} />
              </motion.div>
            ) : aiProducts.length > 0 ? (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* Top AI pick */}
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

                {/* Secondary picks */}
                {aiProducts.slice(1, 4).map((product, index) => (
                  <motion.button
                    key={product._id}
                    type="button"
                    onClick={() => router.push(`/products/${product._id}`)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    style={{
                      padding: 14, borderRadius: 16,
                      border: '1px solid var(--color-border)',
                      background: 'rgba(255, 251, 245, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      textAlign: 'left', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{
                      y: -2,
                      boxShadow: '0 8px 24px rgba(232, 93, 4, 0.1)',
                    }}
                  >
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      gap: 10, marginBottom: 6,
                    }}>
                      <Text strong style={{
                        color: 'var(--text-main)', fontSize: 13,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {product.name}
                      </Text>
                      {/* Confidence ring mini */}
                      <ConfidenceBadge score={93 - index * 3} />
                    </div>
                    <div style={{ color: 'var(--mood-accent)', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                      {formatPrice(product.price)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Đồng giá trị, dễ cân nhắc cùng phiên mua sắm.
                    </Text>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InsightEmptyState
                  compact
                  title="Chưa đủ tín hiệu AI"
                  description="Duyệt thêm sản phẩm để hệ thống hiểu rõ gu của bạn."
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA card */}
          <div
            className="glass-panel-dark"
            style={{
              marginTop: 16, padding: 16, borderRadius: 18,
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShoppingOutlined style={{ color: '#FDBA74', fontSize: 16 }} />
              <Text style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>
                Mẹo tăng tỷ lệ chốt
              </Text>
            </div>
            <Paragraph style={{ marginBottom: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
              Thêm sản phẩm vào wishlist hoặc giỏ để AI ranking chính xác hơn.
            </Paragraph>
            <Button
              block
              size="middle"
              onClick={() => {
                if (isAuthenticated) { router.push('/ai-suggest'); return; }
                message.info('Đăng nhập để mở AI Suggest.');
                router.push('/login');
              }}
              style={{ borderRadius: 12, height: 40, fontWeight: 700, fontSize: 13 }}
            >
              Mở AI Suggest
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ConfidenceBadge({ score }) {
  const circumference = 2 * Math.PI * 14;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" className="confidence-ring-bg" />
        <circle
          cx="18" cy="18" r="14"
          className="confidence-ring-fill"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800, color: 'var(--mood-accent)',
      }}>
        {score}
      </span>
    </div>
  );
}
