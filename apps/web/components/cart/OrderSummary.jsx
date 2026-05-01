'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Progress, Typography, Space } from 'antd';
import { 
  ArrowRightOutlined, 
  ThunderboltFilled, 
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const mountedRef = React.useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();
    let frameId;

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      
      if (mountedRef.current) {
        setDisplayValue(current);
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);

    return () => {
      mountedRef.current = false;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value]);

  return <span>{formatPrice(displayValue)}</span>;
}

export default function OrderSummary({ 
  subtotal, 
  shippingFee, 
  total, 
  itemCount, 
  onCheckout,
  freeShippingThreshold 
}) {
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);

  return (
    <div className="order-summary-container" style={{ position: 'sticky', top: 100 }}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel"
        style={{
          padding: 24,
          borderRadius: 28,
          border: '1px solid rgba(232, 93, 4, 0.1)',
          boxShadow: 'var(--shadow-lg)',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Space size={10} style={{ marginBottom: 24 }}>
          <div 
            className="bg-gradient-ai" 
            style={{ width: 12, height: 32, borderRadius: 999 }} 
          />
          <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Tóm tắt đơn hàng
          </Title>
        </Space>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>Tạm tính ({itemCount} sản phẩm)</Text>
            <Text strong style={{ fontSize: 16 }}>
              <AnimatedNumber value={subtotal} />
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary" style={{ fontSize: 15 }}>Phí giao hàng</Text>
            <Text strong style={{ 
              fontSize: 16, 
              color: shippingFee === 0 ? '#10b981' : 'var(--color-text)' 
            }}>
              {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
            </Text>
          </div>
        </div>

        {/* Free Shipping Progress */}
        <div 
          style={{ 
            background: 'rgba(232, 93, 4, 0.03)', 
            padding: 16, 
            borderRadius: 20, 
            marginBottom: 24,
            border: '1px solid rgba(232, 93, 4, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ThunderboltFilled style={{ color: 'var(--color-primary)' }} />
            <Text strong style={{ fontSize: 13, color: '#9a3412' }}>ƯU ĐÃI GIAO HÀNG</Text>
          </div>
          <Paragraph style={{ fontSize: 13, marginBottom: 12, color: '#9a3412' }}>
            {remaining > 0 
              ? `Mua thêm ${formatPrice(remaining)} để được FREESHIP` 
              : 'Chúc mừng! Bạn đã được miễn phí giao hàng.'}
          </Paragraph>
          <div style={{ position: 'relative', height: 6, background: 'rgba(232, 93, 4, 0.1)', borderRadius: 10, overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-ai-light))',
                borderRadius: 10
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>TỔNG THANH TOÁN</Text>
          <div style={{ 
            fontSize: 36, 
            fontWeight: 800, 
            color: 'var(--color-primary)', 
            letterSpacing: '-0.03em',
            marginTop: 4,
            lineHeight: 1
          }}>
            <AnimatedNumber value={total} />
          </div>
          <Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Đã bao gồm VAT</Text>
        </div>

        <Button
          type="primary"
          block
          size="large"
          onClick={onCheckout}
          style={{ 
            height: 60, 
            borderRadius: 18, 
            fontSize: 17, 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          Thanh toán ngay <ArrowRightOutlined />
        </Button>

        {/* AI Decision Support Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 20,
            padding: '12px 16px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start'
          }}
        >
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 10, 
            background: 'rgba(255,255,255,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ThunderboltOutlined style={{ color: '#fb923c', fontSize: 16 }} />
          </div>
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500, display: 'block' }}>
              Gemini AI Suggestion
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              Bạn đang chọn những sản phẩm tốt nhất cho sức khỏe. Đơn hàng này tiết kiệm {formatPrice(35000)} so với mua lẻ.
            </Text>
          </div>
        </motion.div>
      </motion.div>

      {/* Trust badges */}
      <div style={{ 
        marginTop: 16, 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 20,
        opacity: 0.6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <SafetyCertificateOutlined /> Bảo mật
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <InfoCircleOutlined /> Đổi trả 7 ngày
        </div>
      </div>
    </div>
  );
}
