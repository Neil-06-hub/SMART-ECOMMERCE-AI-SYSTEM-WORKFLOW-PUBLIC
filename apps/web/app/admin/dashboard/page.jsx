'use client';

import { useState } from 'react';
import { Row, Col, Card, Statistic, Button, Spin, Tag, List, Typography, Alert } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, ShoppingCartOutlined, RiseOutlined, FallOutlined, BulbOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, padding: '0 8px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #f97316, #ea580c)', height: `${(d.revenue / max) * 100}px`, borderRadius: '4px 4px 0 0', minHeight: d.revenue > 0 ? 4 : 0, cursor: 'pointer', transition: 'opacity 0.2s' }} title={`${d.month}: ${d.revenue.toLocaleString('vi-VN')}đ`} />
          <div style={{ fontSize: 8, color: '#999', marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data),
  });

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const { data } = await adminAPI.getAIAnalysis();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const { stats, monthlyRevenue, ordersByStatus } = statsData || {};
  const growthRate = stats?.lastMonthRevenue
    ? (((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(1) : 0;

  const statCards = [
    { title: 'Tổng người dùng', value: stats?.totalUsers, icon: <UserOutlined />, color: '#f97316' },
    { title: 'Sản phẩm active', value: stats?.totalProducts, icon: <ShoppingOutlined />, color: '#52c41a' },
    { title: 'Tổng đơn hàng', value: stats?.totalOrders, icon: <ShoppingCartOutlined />, color: '#fa8c16' },
    { title: 'Tổng doanh thu', value: formatPrice(stats?.totalRevenue), icon: <DollarOutlined />, color: '#eb2f96', isPrice: true },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
        <Button type="primary" icon={<BulbOutlined />} loading={aiLoading} onClick={handleAIAnalysis}
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none' }}>
          Phân tích AI
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((s) => (
          <Col key={s.title} xs={24} sm={12} xl={6}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }}>
              <Statistic title={s.title} value={s.isPrice ? undefined : s.value} formatter={s.isPrice ? () => s.value : undefined}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>} />
            </Card>
          </Col>
        ))}
      </Row>

      {aiAnalysis && (
        <Card style={{ borderRadius: 12, marginBottom: 24, borderLeft: '4px solid #f97316' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BulbOutlined style={{ color: '#f97316', fontSize: 20 }} />
            <Title level={5} style={{ margin: 0 }}>Nhận xét AI về tình hình kinh doanh</Title>
            <Tag color="purple">AI Generated</Tag>
          </div>
          <Paragraph>{aiAnalysis.summary}</Paragraph>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}><Text strong style={{ color: '#52c41a' }}>Điểm mạnh:</Text></div>
              <List size="small" dataSource={aiAnalysis.strengths || []}
                renderItem={(item) => <List.Item style={{ padding: '4px 0' }}>✅ {item}</List.Item>} />
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}><Text strong style={{ color: '#fa8c16' }}>Cải thiện:</Text></div>
              <List size="small" dataSource={aiAnalysis.improvements || []}
                renderItem={(item) => <List.Item style={{ padding: '4px 0' }}>💡 {item}</List.Item>} />
            </Col>
          </Row>
          {aiAnalysis.recommendation && <Alert message={aiAnalysis.recommendation} type="info" showIcon style={{ marginTop: 16 }} />}
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>Doanh thu 12 tháng</Title>
              <div>
                <span style={{ color: growthRate >= 0 ? '#52c41a' : '#f5222d', fontWeight: 700 }}>
                  {growthRate >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(growthRate)}%
                </span>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>so với tháng trước</Text>
              </div>
            </div>
            <BarChart data={monthlyRevenue || []} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Tháng này</Text>
                <div style={{ fontWeight: 700, color: '#f97316' }}>{formatPrice(stats?.thisMonthRevenue)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Tháng trước</Text>
                <div style={{ fontWeight: 700 }}>{formatPrice(stats?.lastMonthRevenue)}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 12 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 16 }}>Trạng thái đơn hàng</Title>
            {ordersByStatus?.map((o) => {
              const labels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
              const colors = { pending: '#fa8c16', confirmed: '#1890ff', shipping: '#13c2c2', delivered: '#52c41a', cancelled: '#f5222d' };
              return (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Tag color={colors[o._id]}>{labels[o._id] || o._id}</Tag>
                  <Text strong>{o.count} đơn</Text>
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
