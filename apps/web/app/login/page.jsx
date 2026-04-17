'use client';

import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const onFinish = async (values) => {
    try {
      const { data } = await authAPI.login(values);
      setAuth(data.user, data.token);
      message.success('Đăng nhập thành công!');
      router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ShopOutlined style={{ fontSize: 40, color: '#667eea' }} />
          <Title level={3} style={{ margin: '12px 0 4px', color: '#1a1a2e' }}>Chào mừng trở lại!</Title>
          <Text type="secondary">Đăng nhập vào tài khoản của bạn</Text>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -12 }}>
            <Link href="/forgot-password" style={{ color: '#667eea', fontSize: 14 }}>Quên mật khẩu?</Link>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{
              height: 44, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', fontWeight: 600,
            }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text>Chưa có tài khoản? </Text>
          <Link href="/register" style={{ color: '#667eea', fontWeight: 600 }}>Đăng ký ngay</Link>
        </div>
      </Card>
    </div>
  );
}
