'use client';

import { motion } from 'framer-motion';
import { Typography, Button } from 'antd';
import { ThunderboltFilled } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

export default function InsightMilestone({ data, onAction }) {
  if (!data) return null;

  return (
    <motion.div
      className="insight-milestone"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, background: 'var(--mood-accent-soft)', flexShrink: 0,
        }}>
          {data.icon || '💡'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
              {data.title}
            </Text>
            <ThunderboltFilled style={{ color: 'var(--mood-accent)', fontSize: 13 }} />
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
            {data.description}
          </Paragraph>
          {data.cta && onAction && (
            <Button type="link" onClick={onAction} style={{
              padding: 0, marginTop: 8, fontWeight: 700,
              color: 'var(--mood-accent)', fontSize: 13,
            }}>
              {data.cta}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
