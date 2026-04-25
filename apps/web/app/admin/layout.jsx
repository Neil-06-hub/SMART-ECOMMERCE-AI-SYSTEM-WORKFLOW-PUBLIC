'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, OrderedListOutlined,
  TeamOutlined, NotificationOutlined, LogoutOutlined, UserOutlined,
  ShopOutlined, TagOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useStore';
import { useQueryClient } from '@tanstack/react-query';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: <Link href="/admin/dashboard">Dashboard</Link> },
  { key: '/admin/products', icon: <AppstoreOutlined />, label: <Link href="/admin/products">Sản phẩm</Link> },
  { key: '/admin/orders', icon: <OrderedListOutlined />, label: <Link href="/admin/orders">Đơn hàng</Link> },
  { key: '/admin/users', icon: <TeamOutlined />, label: <Link href="/admin/users">Khách hàng</Link> },
  { key: '/admin/discounts', icon: <TagOutlined />, label: <Link href="/admin/discounts">Mã giảm giá</Link> },
  { key: '/admin/marketing', icon: <NotificationOutlined />, label: <Link href="/admin/marketing">Marketing AI</Link> },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { token: { colorBgContainer } } = theme.useToken();

  // Wait for Zustand persist rehydration before checking auth —
  // otherwise the store starts with isAuthenticated=false and redirects on every F5.
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'admin') { router.push('/'); }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated) return null;

  const userMenu = {
    items: [
      { key: 'home', icon: <ShopOutlined />, label: <Link href="/">Về trang chủ</Link> },
      {
        key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true,
        onClick: () => { logout(); queryClient.clear(); router.push('/login'); },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} style={{ background: '#1a1a2e' }} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
          <ShopOutlined style={{ color: 'white', fontSize: 20 }} />
          {!collapsed && <span style={{ color: 'white', fontWeight: 700, fontSize: 16, marginLeft: 8 }}>Admin Panel</span>}
        </div>
        <Menu
          theme="dark" mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ background: '#1a1a2e', borderRight: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={user?.avatar} icon={!user?.avatar && <UserOutlined />}
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }} />
              <span style={{ fontWeight: 500 }}>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', background: '#F8FAFC', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
