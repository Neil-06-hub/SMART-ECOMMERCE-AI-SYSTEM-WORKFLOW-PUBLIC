'use client';

import { cloneElement, isValidElement } from 'react';
import { Button, Empty } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

export default function InsightEmptyState({
  title = 'Chưa có dữ liệu phù hợp',
  description = 'Hệ thống sẽ hiển thị nội dung tại đây khi dữ liệu sẵn sàng.',
  actionLabel,
  onAction,
  compact = false,
  icon = <RobotOutlined />,
  accentColor = 'var(--brand-teal)',
  accentBackground = 'rgba(249, 115, 22, 0.1)',
}) {
  const resolvedIcon = isValidElement(icon)
    ? cloneElement(icon, { style: { fontSize: 24, ...(icon.props?.style || {}) } })
    : <RobotOutlined style={{ fontSize: 24 }} />;

  return (
    <div
      style={{
        borderRadius: compact ? 18 : 24,
        padding: compact ? '28px 20px' : '40px 28px',
        border: '1px dashed var(--border-color)',
        background: 'linear-gradient(180deg, #FFFDF8 0%, #FFF7ED 100%)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          margin: '0 auto 14px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: accentBackground,
          color: accentColor,
          fontSize: 24,
        }}
      >
        {resolvedIcon}
      </div>

      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>{title}</div>
            <div style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>{description}</div>
          </div>
        }
      />

      {actionLabel && onAction ? (
        <Button type="primary" onClick={onAction} style={{ marginTop: 8 }}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
