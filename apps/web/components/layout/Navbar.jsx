'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Button, Dropdown, Avatar, Space } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, LogoutOutlined,
  OrderedListOutlined, DashboardOutlined, HeartOutlined,
} from '@ant-design/icons';
import { useAuthStore, useCartStore } from '@/store/useStore';
import WishlistDropdown from './WishlistDrawer';
import NotificationDropdown from './NotificationDrawer';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/shop', label: 'Cửa hàng' },
    { to: '/ai-suggest', label: 'AI Gợi ý' },
    { to: '/about', label: 'Về chúng tôi' },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: <Link href="/profile">Tài khoản</Link> },
    { key: 'orders', icon: <OrderedListOutlined />, label: <Link href="/orders">Đơn hàng</Link> },
    { key: 'wishlist', icon: <HeartOutlined />, label: <Link href="/wishlist">Yêu thích</Link> },
    ...(user?.role === 'admin'
      ? [{ key: 'admin', icon: <DashboardOutlined />, label: <Link href="/admin/dashboard">Quản trị</Link> }]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => { logout(); router.push('/'); },
    },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'white',
      borderBottom: '1px solid #F1F5F9',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{
        height: 76,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44,
                background: 'linear-gradient(135deg, var(--ai-purple), var(--ai-pink))',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 22, fontWeight: 700,
              }}>S</div>
              <span style={{ color: 'var(--brand-teal)', fontWeight: 700, fontSize: 22 }}>SmartShop AI</span>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <Space size={36} style={{ display: 'flex', justifyContent: 'center' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.label}
                href={link.to}
                style={{
                  color: '#0F172A',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 17,
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--ai-purple)' : '2px solid transparent',
                  paddingBottom: 4,
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </Space>

        {/* Right */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Space size={20} align="center">
            <Link href="/cart">
              <Badge count={totalItems} style={{ background: '#F97316' }}>
                <ShoppingCartOutlined style={{ fontSize: 28, color: '#0F172A' }} />
              </Badge>
            </Link>

            {isAuthenticated && <WishlistDropdown />}
            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', borderRadius: 99 }}>
                  <Avatar
                    size={42}
                    src={user?.avatar}
                    icon={!user?.avatar && <UserOutlined />}
                    style={{ background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-teal-light))', color: 'white' }}
                  />
                  <span style={{ color: '#0F172A', fontWeight: 500, fontSize: 16 }}>{user?.name?.split(' ').pop()}</span>
                </div>
              </Dropdown>
            ) : (
              <Space size={10}>
                <UserOutlined style={{ fontSize: 26, color: '#0F172A', cursor: 'pointer' }} />
                <Button
                  onClick={() => router.push('/login')}
                  style={{
                    borderColor: '#0F172A', color: '#0F172A',
                    background: 'transparent', borderRadius: 999,
                    fontWeight: 600, height: 46, padding: '0 26px', fontSize: 16,
                  }}
                >
                  Đăng nhập
                </Button>
              </Space>
            )}
          </Space>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
