'use client';

import Link from 'next/link';
import { Layout, Input, Button, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;

const footerLinks = {
  'Sản Phẩm': [
    { label: 'Cửa hàng', to: '/shop' },
    { label: 'AI Gợi ý', to: '/ai-suggest' },
    { label: 'Bán chạy', to: '/shop' },
    { label: 'Khuyến mãi', to: '/shop' },
  ],
  'Công Nghệ': [
    { label: 'Google Gemini', to: '/' },
    { label: 'AI Marketing', to: '/' },
    { label: 'Phân tích AI', to: '/' },
    { label: 'Tài liệu API', to: '/' },
  ],
  'Hỗ Trợ': [
    { label: 'Trung tâm trợ giúp', to: '/' },
    { label: 'Liên hệ', to: '/' },
    { label: 'Chính sách', to: '/' },
    { label: 'Điều khoản', to: '/' },
  ],
};

const Footer = () => (
  <AntFooter style={{
    background: 'var(--color-footer-bg, #FFFDF8)',
    borderTop: '1px solid var(--color-border, #E7D9C8)',
    padding: '64px 0 0',
  }}>
    <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 48 }}>

        {/* Brand */}
        <div style={{ maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 17, fontWeight: 700,
              boxShadow: '0 4px 10px rgba(232,93,4,0.22)',
            }}>S</div>
            <span style={{ color: 'var(--color-primary, #E85D04)', fontWeight: 700, fontSize: 18 }}>SmartShop AI</span>
          </div>

          <p style={{ color: 'var(--color-text-muted, #6B7280)', lineHeight: 1.75, marginBottom: 24, fontSize: 14 }}>
            Hệ thống thương mại điện tử thông minh tích hợp Google Gemini AI.
            Cá nhân hóa trải nghiệm mua sắm, tự động hóa Marketing, và phân tích kinh doanh thông minh.
          </p>

          <div>
            <p style={{ color: 'var(--color-text, #111827)', fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Nhận tin AI mới nhất</p>
            <Space.Compact style={{ width: '100%', maxWidth: 360 }}>
              <Input
                placeholder="Email của bạn"
                style={{
                  borderRadius: '8px 0 0 8px',
                  border: '1px solid var(--color-border, #E7D9C8)',
                  background: '#FFFFFF',
                  color: 'var(--color-text, #111827)',
                  height: 40,
                }}
              />
              <Button style={{
                background: 'var(--color-primary, #E85D04)',
                color: 'white',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0 8px 8px 0',
                height: 40,
              }}>
                Đăng ký
              </Button>
            </Space.Compact>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: 'var(--color-text, #111827)', fontWeight: 700, marginBottom: 22, fontSize: 15 }}>{title}</h4>
              {links.map((link) => (
                <div key={link.label} style={{ marginBottom: 12 }}>
                  <Link
                    href={link.to}
                    style={{ color: 'var(--color-text-muted, #6B7280)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.target.style.color = 'var(--color-primary, #E85D04)'; }}
                    onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted, #6B7280)'; }}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--color-border, #E7D9C8)',
        paddingTop: 24, paddingBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ color: 'var(--color-text-muted, #6B7280)', fontSize: 13 }}>
          © 2026 SmartShop AI. Powered by Google Gemini 1.5 Flash
        </span>
        <Space size={18}>
          <FacebookOutlined style={{ fontSize: 19, color: 'var(--color-text-muted, #6B7280)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.target.style.color = 'var(--color-primary, #E85D04)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted, #6B7280)'; }}
          />
          <TwitterOutlined style={{ fontSize: 19, color: 'var(--color-text-muted, #6B7280)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.target.style.color = 'var(--color-primary, #E85D04)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted, #6B7280)'; }}
          />
          <InstagramOutlined style={{ fontSize: 19, color: 'var(--color-text-muted, #6B7280)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.target.style.color = 'var(--color-primary, #E85D04)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--color-text-muted, #6B7280)'; }}
          />
        </Space>
      </div>
    </div>
  </AntFooter>
);

export default Footer;
