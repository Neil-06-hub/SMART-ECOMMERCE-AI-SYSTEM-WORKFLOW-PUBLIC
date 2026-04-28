'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Button } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

// Mock AI recommendations
const MOCK_RECOMMENDATIONS = [
  {
    _id: 'rec1',
    name: 'Dây đeo Silicon cao cấp',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'Phụ kiện'
  },
  {
    _id: 'rec2',
    name: 'Cường lực chống vân tay',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1585333127302-d2921223495b?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'Bảo vệ'
  },
  {
    _id: 'rec3',
    name: 'Túi đựng chống sốc',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?q=80&w=200&h=200&auto=format&fit=crop',
    category: 'Phụ kiện'
  }
];

export default function AIAddons({ onAdd }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <ThunderboltOutlined style={{ color: 'var(--color-ai-light)', fontSize: 20 }} />
        <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          AI Suggestion: Phụ kiện hoàn hảo cho bạn
        </Title>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          padding: '4px 4px 16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="no-scrollbar"
      >
        {MOCK_RECOMMENDATIONS.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            style={{
              flex: '0 0 240px',
              background: 'white',
              borderRadius: 20,
              padding: 12,
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              gap: 12,
              alignItems: 'center'
            }}
          >
            <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {formatPrice(item.price)}
              </Text>
              <Button 
                type="text" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={() => onAdd(item)}
                style={{ 
                  padding: 0, 
                  height: 'auto', 
                  fontSize: 12, 
                  color: 'var(--color-primary)', 
                  fontWeight: 600,
                  marginTop: 4
                }}
              >
                Add fast
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
