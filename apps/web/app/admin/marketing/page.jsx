'use client';

import { useState } from 'react';
import { Table, Button, Tag, Card, Row, Col, Typography, message } from 'antd';
import {
  MailOutlined, ThunderboltOutlined, CalendarOutlined,
  ShoppingCartOutlined, NotificationOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';

const { Title, Text, Paragraph } = Typography;

const campaignCards = [
  {
    type: 'cart_abandoned',
    title: 'Giỏ hàng bỏ quên',
    desc: 'Gửi email nhắc nhở kèm mã giảm giá cho khách hàng đã bỏ quên giỏ hàng trên 24 giờ',
    icon: <ShoppingCartOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    color: '#fa8c16',
    trigger: 'Mỗi giờ (tự động) + Thủ công',
  },
  {
    type: 'newsletter',
    title: 'Newsletter tuần',
    desc: 'Gửi email giới thiệu top 3 sản phẩm bán chạy nhất đến toàn bộ khách hàng',
    icon: <NotificationOutlined style={{ fontSize: 32, color: '#667eea' }} />,
    color: '#667eea',
    trigger: 'Thứ Hai 9:00 AM (tự động) + Thủ công',
  },
];

const typeConfig = {
  welcome: { color: 'green', text: 'Chào mừng', icon: <MailOutlined /> },
  cart_abandoned: { color: 'orange', text: 'Giỏ hàng', icon: <ShoppingCartOutlined /> },
  newsletter: { color: 'blue', text: 'Newsletter', icon: <NotificationOutlined /> },
  promotion: { color: 'red', text: 'Khuyến mãi', icon: <ThunderboltOutlined /> },
};

export default function AdminMarketing() {
  const [triggerLoading, setTriggerLoading] = useState({});
  const [logFilter, setLogFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['marketing-logs', logFilter],
    queryFn: () => adminAPI.getMarketingLogs({ type: logFilter }).then((r) => r.data),
  });

  const handleTrigger = async (campaignType) => {
    setTriggerLoading((p) => ({ ...p, [campaignType]: true }));
    try {
      const { data } = await adminAPI.triggerMarketing(campaignType);
      message.success(data.message || 'Chiến dịch đã được kích hoạt thành công!');
      queryClient.invalidateQueries({ queryKey: ['marketing-logs'] });
    } catch (err) {
      message.error(err.response?.data?.message || 'Kích hoạt chiến dịch thất bại');
    } finally {
      setTriggerLoading((p) => ({ ...p, [campaignType]: false }));
    }
  };

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      render: (t) => (
        <Tag color={typeConfig[t]?.color} icon={typeConfig[t]?.icon}>
          {typeConfig[t]?.text || t}
        </Tag>
      ),
    },
    {
      title: 'Người nhận',
      width: 200,
      render: (_, r) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.recipientName || '-'}</div>
          <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.recipient}</div>
        </div>
      ),
    },
    { title: 'Tiêu đề', dataIndex: 'subject', ellipsis: true, width: 200 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (s) => (
        <Tag color={s === 'success' ? 'green' : s === 'failed' ? 'red' : 'orange'}
          icon={s === 'success' ? <CheckCircleOutlined /> : s === 'failed' ? <CloseCircleOutlined /> : null}>
          {s === 'success' ? 'Thành công' : s === 'failed' ? 'Thất bại' : 'Đang xử lý'}
        </Tag>
      ),
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'discountCode',
      width: 130,
      render: (c) => c ? <Tag color="gold">{c}</Tag> : '-',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 160,
      render: (d) => <span style={{ whiteSpace: 'nowrap' }}>{new Date(d).toLocaleString('vi-VN')}</span>,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Marketing AI - Trung tâm chiến dịch</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {campaignCards.map((c) => (
          <Col key={c.type} xs={24} md={12}>
            <Card style={{ borderRadius: 12, borderTop: `4px solid ${c.color}` }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: 0 }}>{c.title}</Title>
                  <Paragraph type="secondary" style={{ margin: '8px 0' }}>{c.desc}</Paragraph>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <CalendarOutlined style={{ color: '#999' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>{c.trigger}</Text>
                  </div>
                  <Button
                    type="primary" icon={<ThunderboltOutlined />}
                    loading={triggerLoading[c.type]}
                    onClick={() => handleTrigger(c.type)}
                    style={{ background: c.color, borderColor: c.color }}
                  >
                    Kích hoạt ngay
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12, marginBottom: 24, borderLeft: '4px solid #52c41a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MailOutlined style={{ color: '#52c41a', fontSize: 24 }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>Email chào mừng</Title>
            <Text type="secondary">Tự động gửi khi có khách hàng mới đăng ký. Bao gồm mã giảm giá WELCOME10 do AI tạo ra.</Text>
          </div>
          <Tag color="green" style={{ marginLeft: 'auto' }}>Tự động 100%</Tag>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>Lịch sử gửi email ({logsData?.pagination?.total || 0})</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'welcome', 'cart_abandoned', 'newsletter'].map((t) => (
            <Button key={t} size="small" type={logFilter === t ? 'primary' : 'default'}
              onClick={() => setLogFilter(t)}
              style={logFilter === t ? { background: '#667eea', borderColor: '#667eea' } : {}}>
              {t === '' ? 'Tất cả' : typeConfig[t]?.text}
            </Button>
          ))}
        </div>
      </div>

      <Table
        columns={columns} dataSource={logsData?.logs} rowKey="_id"
        loading={isLoading} style={{ background: 'white', borderRadius: 12 }}
        scroll={{ x: 940 }}
        pagination={{ pageSize: 10, total: logsData?.pagination?.total }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '8px 16px' }}>
              <Text strong>Nội dung: </Text>
              <Paragraph style={{ margin: '4px 0' }}>{record.content}</Paragraph>
              {record.errorMessage && <Text type="danger">Lỗi: {record.errorMessage}</Text>}
            </div>
          ),
        }}
      />
    </div>
  );
}
