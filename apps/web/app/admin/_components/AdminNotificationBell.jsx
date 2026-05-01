'use client';

import { useMemo, useState } from 'react';
import {
  Badge, Popover, Button, List, Tag, Typography, Divider, Empty, Spin,
} from 'antd';
import {
  BellOutlined, WarningOutlined, ShoppingOutlined, TagOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

const { Text } = Typography;

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

function StockSection({ items, onNavigate }) {
  if (!items.length) return null;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0 4px' }}>
        <WarningOutlined style={{ color: '#ef4444' }} />
        <Text strong style={{ fontSize: 13 }}>Tồn kho cảnh báo</Text>
        <Tag color="red" style={{ marginLeft: 'auto', fontSize: 11 }}>{items.length}</Tag>
      </div>
      <List
        size="small"
        dataSource={items}
        renderItem={(p) => (
          <List.Item
            style={{ padding: '4px 0', cursor: 'pointer' }}
            onClick={onNavigate}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <img
                src={p.image}
                alt={p.name}
                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.category}</div>
              </div>
              {p.stock === 0 ? (
                <Tag color="red" style={{ fontSize: 11, margin: 0 }}>Hết hàng</Tag>
              ) : (
                <Tag color="orange" style={{ fontSize: 11, margin: 0 }}>Còn {p.stock}</Tag>
              )}
            </div>
          </List.Item>
        )}
      />
    </>
  );
}

function OrderSection({ orders, onNavigate }) {
  if (!orders.length) return null;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0 4px' }}>
        <ShoppingOutlined style={{ color: '#f97316' }} />
        <Text strong style={{ fontSize: 13 }}>Đơn hàng chờ xác nhận</Text>
        <Tag color="orange" style={{ marginLeft: 'auto', fontSize: 11 }}>{orders.length}</Tag>
      </div>
      <List
        size="small"
        dataSource={orders}
        renderItem={(o) => (
          <List.Item
            style={{ padding: '4px 0', cursor: 'pointer' }}
            onClick={onNavigate}
          >
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 12 }}>
                  #{o._id.slice(-8).toUpperCase()}
                </Text>
                <Tag color="gold" style={{ fontSize: 11, margin: 0 }}>Chờ xác nhận</Tag>
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                {o.user?.name ?? 'Khách'} · {formatPrice(o.totalAmount)} · {formatDate(o.createdAt)}
              </div>
            </div>
          </List.Item>
        )}
      />
    </>
  );
}

function DiscountSection({ alerts, onNavigate }) {
  if (!alerts.length) return null;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0 4px' }}>
        <TagOutlined style={{ color: '#8b5cf6' }} />
        <Text strong style={{ fontSize: 13 }}>Mã giảm giá cần xử lý</Text>
        <Tag color="purple" style={{ marginLeft: 'auto', fontSize: 11 }}>{alerts.length}</Tag>
      </div>
      <List
        size="small"
        dataSource={alerts}
        renderItem={(d) => {
          const now = new Date();
          const isExpired = d.expiresAt && new Date(d.expiresAt) < now;
          const isExhausted = d.usageLimit > 0 && d.usedCount >= d.usageLimit;
          return (
            <List.Item
              style={{ padding: '4px 0', cursor: 'pointer' }}
              onClick={onNavigate}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 12, fontFamily: 'monospace' }}>{d.code}</Text>
                  {isExpired && <Tag color="red" style={{ fontSize: 11, margin: 0 }}>Hết hạn</Tag>}
                  {!isExpired && isExhausted && <Tag color="volcano" style={{ fontSize: 11, margin: 0 }}>Hết lượt</Tag>}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {isExhausted ? `Đã dùng ${d.usedCount}/${d.usageLimit} lượt` : ''}
                  {isExpired ? `Hết hạn ${formatDate(d.expiresAt)}` : ''}
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </>
  );
}

export default function AdminNotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => adminAPI.getAlerts().then((r) => r.data.data),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  const lowStock = data?.lowStock ?? [];
  const pendingOrders = data?.pendingOrders ?? [];
  const discountAlerts = data?.discountAlerts ?? [];
  const total = data?.total ?? 0;

  const hasAlerts = total > 0;

  const navigate = (path) => {
    setOpen(false);
    router.push(path);
  };

  const content = (
    <div style={{ width: 340, maxHeight: 480, overflowY: 'auto', padding: '0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
        <Text strong style={{ fontSize: 14 }}>Thông báo hệ thống</Text>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          style={{ color: '#94A3B8' }}
        />
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="small" />
        </div>
      )}

      {!isLoading && !hasAlerts && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ fontSize: 13, color: '#94A3B8' }}>Không có cảnh báo nào</span>}
          style={{ padding: '24px 0' }}
        />
      )}

      {!isLoading && hasAlerts && (
        <>
          <StockSection items={lowStock} onNavigate={() => navigate('/admin/products')} />
          {lowStock.length > 0 && pendingOrders.length > 0 && <Divider style={{ margin: '8px 0' }} />}
          <OrderSection orders={pendingOrders} onNavigate={() => navigate('/admin/orders')} />
          {pendingOrders.length > 0 && discountAlerts.length > 0 && <Divider style={{ margin: '8px 0' }} />}
          <DiscountSection alerts={discountAlerts} onNavigate={() => navigate('/admin/discounts')} />
        </>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      overlayStyle={{ paddingTop: 4 }}
      overlayInnerStyle={{ padding: '12px 12px 8px' }}
    >
      <Badge
        count={total}
        overflowCount={99}
        styles={{ indicator: { background: '#ef4444', boxShadow: 'none' } }}
      >
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18, color: hasAlerts ? '#ef4444' : '#64748B' }} />}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Badge>
    </Popover>
  );
}
