'use client';

import { useState, useMemo, useEffect } from 'react';
import { Table, Button, Tag, Typography, message, Tabs, Badge, Input, DatePicker, Space, Empty } from 'antd';
import {
  MailOutlined, ThunderboltOutlined, CalendarOutlined,
  ShoppingCartOutlined, NotificationOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { adminAPI } from '@/lib/api';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const typeConfig = {
  welcome:       { color: 'green',  text: 'Chào mừng',  icon: <MailOutlined /> },
  cart_abandoned:{ color: 'orange', text: 'Giỏ hàng',   icon: <ShoppingCartOutlined /> },
  newsletter:    { color: 'blue',   text: 'Newsletter',  icon: <NotificationOutlined /> },
  promotion:     { color: 'red',    text: 'Khuyến mãi', icon: <ThunderboltOutlined /> },
};

const campaignCards = [
  {
    type: 'cart_abandoned',
    title: 'Giỏ hàng bỏ quên',
    desc: 'Gửi email nhắc nhở kèm mã giảm giá cho khách đã bỏ quên giỏ hàng trên 24 giờ.',
    icon: <ShoppingCartOutlined style={{ fontSize: 28 }} />,
    color: '#f97316',
    bg: '#FFF7ED',
    trigger: 'Mỗi giờ (tự động) + Thủ công',
  },
  {
    type: 'newsletter',
    title: 'Newsletter tuần',
    desc: 'Gửi email giới thiệu top 3 sản phẩm bán chạy nhất đến toàn bộ khách hàng.',
    icon: <NotificationOutlined style={{ fontSize: 28 }} />,
    color: '#6366f1',
    bg: '#F5F3FF',
    trigger: 'Thứ Hai 9:00 AM (tự động) + Thủ công',
  },
];

export default function AdminMarketing() {
  const [triggerLoading, setTriggerLoading] = useState({});
  const [logTab, setLogTab] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const queryClient = useQueryClient();

  const logType = logTab === 'all' ? '' : logTab;

  useEffect(() => { setLogPage(1); }, [logTab, search, dateRange]);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['marketing-logs', logType, logPage, logPageSize],
    queryFn: () => adminAPI.getMarketingLogs({ type: logType, page: logPage, limit: logPageSize }).then((r) => r.data),
  });

  const logs = logsData?.logs ?? [];

  // Client-side search + date filter on loaded page
  const filteredLogs = useMemo(() => {
    let list = logs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          (l.recipientName ?? '').toLowerCase().includes(q) ||
          (l.recipient ?? '').toLowerCase().includes(q)
      );
    }
    if (dateRange.length === 2) {
      list = list.filter((l) => {
        const d = dayjs(l.createdAt);
        return (
          d.isAfter(dateRange[0].startOf('day').subtract(1, 'ms')) &&
          d.isBefore(dateRange[1].endOf('day').add(1, 'ms'))
        );
      });
    }
    return list;
  }, [logs, search, dateRange]);

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount  = logs.filter((l) => l.status === 'failed').length;
  const total        = logsData?.pagination?.total ?? 0;

  const handleTrigger = async (campaignType) => {
    setTriggerLoading((p) => ({ ...p, [campaignType]: true }));
    try {
      const { data } = await adminAPI.triggerMarketing(campaignType);
      message.success(data.message || 'Chiến dịch đã được kích hoạt!');
      queryClient.invalidateQueries({ queryKey: ['marketing-logs'] });
    } catch (err) {
      message.error(err.response?.data?.message || 'Kích hoạt thất bại');
    } finally {
      setTriggerLoading((p) => ({ ...p, [campaignType]: false }));
    }
  };

  const tabItems = [
    { key: 'all',           label: 'Tất cả' },
    { key: 'welcome',       label: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MailOutlined /> Chào mừng</span> },
    { key: 'cart_abandoned',label: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ShoppingCartOutlined /> Giỏ hàng</span> },
    { key: 'newsletter',    label: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><NotificationOutlined /> Newsletter</span> },
  ];

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 130,
      render: (t) => (
        <Tag color={typeConfig[t]?.color} icon={typeConfig[t]?.icon}>
          {typeConfig[t]?.text || t}
        </Tag>
      ),
    },
    {
      title: 'Người nhận',
      width: 210,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.recipientName || '—'}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.recipient}
          </div>
        </div>
      ),
    },
    { title: 'Tiêu đề', dataIndex: 'subject', ellipsis: true, width: 220 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (s) => (
        <Tag
          color={s === 'success' ? 'green' : s === 'failed' ? 'red' : 'orange'}
          icon={s === 'success' ? <CheckCircleOutlined /> : s === 'failed' ? <CloseCircleOutlined /> : null}
        >
          {s === 'success' ? 'Thành công' : s === 'failed' ? 'Thất bại' : 'Đang xử lý'}
        </Tag>
      ),
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'discountCode',
      width: 130,
      render: (c) => c ? <Tag color="gold">{c}</Tag> : <span style={{ color: '#94A3B8' }}>—</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      width: 160,
      render: (d) => <span style={{ whiteSpace: 'nowrap', color: '#64748B', fontSize: 13 }}>{new Date(d).toLocaleString('vi-VN')}</span>,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>Marketing AI</h3>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Trung tâm chiến dịch email tự động</p>
      </div>

      {/* Campaign Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {campaignCards.map((c) => (
          <div key={c.type} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `4px solid ${c.color}` }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 10, lineHeight: '1.5' }}>{c.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <CalendarOutlined style={{ color: '#94A3B8', fontSize: 12 }} />
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>{c.trigger}</Text>
                </div>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  loading={triggerLoading[c.type]}
                  onClick={() => handleTrigger(c.type)}
                  style={{ background: c.color, borderColor: c.color, fontWeight: 600 }}
                >
                  Kích hoạt ngay
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome card */}
      <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #22c55e', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MailOutlined style={{ color: '#22c55e', fontSize: 20 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Email chào mừng</div>
          <div style={{ fontSize: 13, color: '#64748B' }}>Tự động gửi khi có khách hàng mới đăng ký. Bao gồm mã WELCOME10 do AI tạo ra.</div>
        </div>
        <Tag color="green" style={{ flexShrink: 0 }}>Tự động 100%</Tag>
      </div>

      {/* Logs Section */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderBottom: '1px solid #F1F5F9' }}>
          {[
            { label: 'Tổng đã gửi',   value: total,        color: '#6366f1' },
            { label: 'Thành công',    value: successCount, color: '#22c55e' },
            { label: 'Thất bại',      value: failedCount,  color: '#ef4444' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '16px 24px', borderRight: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid #F1F5F9' }}>
          <Tabs activeKey={logTab} onChange={setLogTab} items={tabItems} size="large" style={{ marginBottom: 0 }} />
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {/* Filters */}
          <Space wrap style={{ marginBottom: 12 }}>
            <Input
              placeholder="Tìm theo tên, email người nhận..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
            <RangePicker
              value={dateRange.length ? dateRange : null}
              onChange={(dates) => setDateRange(dates ?? [])}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 240 }}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 960 }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử gửi email" /> }}
            pagination={{
              current: logPage,
              pageSize: logPageSize,
              total: logsData?.pagination?.total,
              onChange: (page, size) => { setLogPage(page); setLogPageSize(size); },
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (t) => `${t} email`,
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '8px 16px', background: '#F8FAFC', borderRadius: 6 }}>
                  <Text strong>Nội dung: </Text>
                  <Text>{record.content}</Text>
                  {record.errorMessage && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="danger">Lỗi: {record.errorMessage}</Text>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
