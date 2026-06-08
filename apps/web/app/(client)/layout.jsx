'use client';

import { Layout } from 'antd';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ai/ChatbotWidget';

const { Content } = Layout;

export default function ClientLayout({ children }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Content style={{ marginTop: 64 }}>
        {children}
      </Content>
      <Footer />
      <ChatbotWidget />
    </Layout>
  );
}
