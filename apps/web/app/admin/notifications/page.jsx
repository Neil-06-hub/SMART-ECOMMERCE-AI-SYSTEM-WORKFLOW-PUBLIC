'use client';

import { useState } from 'react';
import {
  Table, Tag, Button, Space, Typography, Tabs, Badge,
  Empty, Tooltip, Spin,
} from 'antd';
import {
  BellOutlined, WarningOutlined, ShoppingOutlined, TagOutlined,
  ReloadOutlined, ArrowRightOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

const { Title, Text } = Typography;

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (d) =>
  new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

// ─── Low Stock Table ─────────────────────────────────────────────────────────
function LowStockTable({ data, onViewAll }) {
  const columns = [
    {
      title: 'Sản phẩm',
      width: 300,
      render: (_, p) => (
        <Space size={10}>
          <img
            src={p.image}
            alt={p.name}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
            <Tag color="blue" style={{ fontSize: 11, marginTop: 2 }}>{p.category}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      width: 130,
      sorter: (a, b) => a.stock - b.stock,
      defaultSortOrder: 'ascend',
      render: (s) =>
        s === 0 ? (
          <Tag color="red" icon={<ExclamationCircleOutlined />}>Hết hàng</Tag>
        ) : (
          <Tag color="orange" icon={<WarningOutlined />}>Còn {s} sản phẩm</Tag>
        ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'stock',
      width: 120,
      render: (s) =>
        s === 0 ? (
          <Text type="danger" strong>Nghiêm trọng</Text>
        ) : s <= 3 ? (
          <Text style={{ color: '#f97316' }} strong>Rất thấp</Text>
        ) : (
          <Text style={{ color: '#eab308' }} strong>Thấp</Text>
        ),
    },
    {
      title: '',
      width: 120,
      render: () => (
        <Button size="small" onClick={onViewAll} icon={<ArrowRightOutlined />}>
          Quản lý
        </Button>
      ),
    },
  ];

  if (!data.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: '#22c55e' }}>Tất cả sản phẩm đều đủ hàng</span>}
        style={{ padding: 40 }}
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="_id"
      size="middle"
      pagination={{ pageSize: 10, showTotal: (t) => `${t} sản phẩm` }}
      rowClassName={(r) => r.stock === 0 ? 'row-danger' : ''}
    />
  );
}

// ─── Pending Orders Table ────────────────────────────────────────────────────
function PendingOrdersTable({ data, onViewAll }) {
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      width: 120,
      render: (id) => (
        <Text code style={{ fontSize: 12 }}>#{id.slice(-8).toUpperCase()}</Text>
      ),
    },
    {
      title: 'Khách hàng',
      width: 180,
      render: (_, o) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{o.user?.name ?? 'Khách vãng lai'}</div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>{o.user?.email ?? ''}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      width: 140,
      render: (p) => <Text strong style={{ color: '#f97316' }}>{formatPrice(p)}</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      width: 80,
      render: (items) => (
        <Tag>{items?.length ?? 0} sản phẩm</Tag>
      ),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'createdAt',
      width: 150,
      render: (d) => <Text style={{ fontSize: 13, color: '#64748B' }}>{formatDate(d)}</Text>,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Trạng thái',
      width: 130,
      render: () => <Tag color="gold">Chờ xác nhận</Tag>,
    },
    {
      title: '',
      width: 110,
      render: () => (
        <Button size="small" type="primary" onClick={onViewAll} icon={<ArrowRightOutlined />}
          style={{ background: '#f97316', border: 'none' }}>
          Xử lý
        </Button>
      ),
    },
  ];

  if (!data.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: '#22c55e' }}>Không có đơn hàng nào chờ xác nhận</span>}
        style={{ padding: 40 }}
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="_id"
      size="middle"
      pagination={{ pageSize: 10, showTotal: (t) => `${t} đơn hàng` }}
    />
  );
}

// ─── Discount Alerts Table ───────────────────────────────────────────────────
function DiscountAlertsTable({ data, onViewAll }) {
  const now = new Date();

  const columns = [
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      width: 150,
      render: (code) => (
        <Text code strong style={{ fontSize: 13, letterSpacing: 1 }}>{code}</Text>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 100,
      render: (t, d) => (
        <Tag color={t === 'percent' ? 'blue' : 'green'}>
          {t === 'percent' ? `${d.value}%` : `${d.value.toLocaleString('vi-VN')}đ`}
        </Tag>
      ),
    },
    {
      title: 'Lượt dùng',
      width: 130,
      render: (_, d) => (
        <span>
          <Text strong>{d.usedCount}</Text>
          <Text type="secondary"> / {d.usageLimit === 0 ? '∞' : d.usageLimit}</Text>
        </span>
      ),
    },
    {
      title: 'Hết hạn lúc',
      dataIndex: 'expiresAt',
      width: 160,
      render: (d) =>
        d ? (
          <Text style={{ color: new Date(d) < now ? '#ef4444' : '#64748B', fontSize: 13 }}>
            {formatDate(d)}
          </Text>
        ) : (
          <Text type="secondary">Không giới hạn</Text>
        ),
    },
    {
      title: 'Vấn đề',
      width: 140,
      render: (_, d) => {
        const expired = d.expiresAt && new Date(d.expiresAt) < now;
        const exhausted = d.usageLimit > 0 && d.usedCount >= d.usageLimit;
        return (
          <Space size={4} wrap>
            {expired && <Tag color="red">Hết hạn</Tag>}
            {exhausted && <Tag color="volcano">Hết lượt sử dụng</Tag>}
          </Space>
        );
      },
    },
    {
      title: '',
      width: 110,
      render: () => (
        <Button size="small" onClick={onViewAll} icon={<ArrowRightOutlined />}>
          Xem mã
        </Button>
      ),
    },
  ];

  if (!data.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: '#22c55e' }}>Tất cả mã giảm giá đang hoạt động tốt</span>}
        style={{ padding: 40 }}
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="_id"
      size="middle"
      pagination={{ pageSize: 10, showTotal: (t) => `${t} mã` }}
    />
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => adminAPI.getAlerts().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  const lowStock = data?.lowStock ?? [];
  const pendingOrders = data?.pendingOrders ?? [];
  const discountAlerts = data?.discountAlerts ?? [];
  const total = data?.total ?? 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    refetch();
  };

  const statCards = [
    {
      label: 'Tổng cảnh báo',
      value: total,
      color: total > 0 ? '#ef4444' : '#22c55e',
      bg: total > 0 ? '#FEF2F2' : '#F0FDF4',
      icon: <BellOutlined />,
    },
    {
      label: 'Tồn kho thấp',
      value: lowStock.length,
      color: lowStock.length > 0 ? '#f97316' : '#22c55e',
      bg: lowStock.length > 0 ? '#FFF7ED' : '#F0FDF4',
      icon: <WarningOutlined />,
    },
    {
      label: 'Đơn chờ xác nhận',
      value: pendingOrders.length,
      color: pendingOrders.length > 0 ? '#eab308' : '#22c55e',
      bg: pendingOrders.length > 0 ? '#FEFCE8' : '#F0FDF4',
      icon: <ShoppingOutlined />,
    },
    {
      label: 'Mã giảm giá cần xử lý',
      value: discountAlerts.length,
      color: discountAlerts.length > 0 ? '#8b5cf6' : '#22c55e',
      bg: discountAlerts.length > 0 ? '#F5F3FF' : '#F0FDF4',
      icon: <TagOutlined />,
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <Space size={6}>
          Tất cả
          {total > 0 && (
            <Badge count={total} style={{ background: '#ef4444', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />
          )}
        </Space>
      ),
    },
    {
      key: 'stock',
      label: (
        <Space size={6}>
          <WarningOutlined />Tồn kho thấp
          {lowStock.length > 0 && (
            <Badge count={lowStock.length} style={{ background: '#f97316', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />
          )}
        </Space>
      ),
    },
    {
      key: 'orders',
      label: (
        <Space size={6}>
          <ShoppingOutlined />Đơn hàng mới
          {pendingOrders.length > 0 && (
            <Badge count={pendingOrders.length} style={{ background: '#eab308', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />
          )}
        </Space>
      ),
    },
    {
      key: 'discounts',
      label: (
        <Space size={6}>
          <TagOutlined />Mã giảm giá
          {discountAlerts.length > 0 && (
            <Badge count={discountAlerts.length} style={{ background: '#8b5cf6', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>
            Thông báo hệ thống
          </h3>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>
            Tổn kho, đơn hàng chờ và mã giảm giá cần xử lý
          </p>
        </div>
        <Tooltip title="Làm mới dữ liệu">
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={handleRefresh}
            loading={isFetching}
          >
            Làm mới
          </Button>
        </Tooltip>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: 12,
              padding: '16px 20px',
              borderLeft: `4px solid ${s.color}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: s.color, fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '0 24px', borderBottom: '1px solid #F1F5F9' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* All tab: show all 3 sections */}
              {activeTab === 'all' && (
                <>
                  {total === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span style={{ color: '#22c55e', fontWeight: 500 }}>Hệ thống đang hoạt động tốt — không có cảnh báo nào</span>}
                      style={{ padding: 60 }}
                    />
                  ) : (
                    <>
                      {lowStock.length > 0 && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <WarningOutlined style={{ color: '#f97316', fontSize: 16 }} />
                            <span style={{ fontWeight: 600, fontSize: 15, color: '#0F172A' }}>Tồn kho thấp</span>
                            <Tag color="orange">{lowStock.length} sản phẩm</Tag>
                          </div>
                          <LowStockTable data={lowStock} onViewAll={() => router.push('/admin/products')} />
                        </>
                      )}

                      {pendingOrders.length > 0 && (
                        <div style={{ marginTop: lowStock.length > 0 ? 32 : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <ShoppingOutlined style={{ color: '#eab308', fontSize: 16 }} />
                            <span style={{ fontWeight: 600, fontSize: 15, color: '#0F172A' }}>Đơn hàng chờ xác nhận</span>
                            <Tag color="gold">{pendingOrders.length} đơn</Tag>
                          </div>
                          <PendingOrdersTable data={pendingOrders} onViewAll={() => router.push('/admin/orders')} />
                        </div>
                      )}

                      {discountAlerts.length > 0 && (
                        <div style={{ marginTop: (lowStock.length > 0 || pendingOrders.length > 0) ? 32 : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <TagOutlined style={{ color: '#8b5cf6', fontSize: 16 }} />
                            <span style={{ fontWeight: 600, fontSize: 15, color: '#0F172A' }}>Mã giảm giá cần xử lý</span>
                            <Tag color="purple">{discountAlerts.length} mã</Tag>
                          </div>
                          <DiscountAlertsTable data={discountAlerts} onViewAll={() => router.push('/admin/discounts')} />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === 'stock' && (
                <LowStockTable data={lowStock} onViewAll={() => router.push('/admin/products')} />
              )}
              {activeTab === 'orders' && (
                <PendingOrdersTable data={pendingOrders} onViewAll={() => router.push('/admin/orders')} />
              )}
              {activeTab === 'discounts' && (
                <DiscountAlertsTable data={discountAlerts} onViewAll={() => router.push('/admin/discounts')} />
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .row-danger td {
          background: #FFF5F5 !important;
        }
      `}</style>
    </div>
  );
}
