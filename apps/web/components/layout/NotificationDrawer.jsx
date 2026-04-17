'use client';

import { useState } from 'react';
import { Badge, Button, Empty, Popover, Skeleton, Tag, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BellFilled,
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  GiftOutlined,
  HeartOutlined,
  RobotOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationAPI } from '@/lib/api';

const TYPE_CONFIG = {
  order: { icon: <ShoppingOutlined />, color: '#2563EB', background: '#EFF6FF', label: 'Đơn hàng' },
  wishlist: { icon: <HeartOutlined />, color: '#DC2626', background: '#FEF2F2', label: 'Wishlist' },
  promotion: { icon: <GiftOutlined />, color: '#EA580C', background: '#FFF7ED', label: 'Khuyến mãi' },
  system: { icon: <BellOutlined />, color: '#7C3AED', background: '#F5F3FF', label: 'Hệ thống' },
  new_product: { icon: <AppstoreOutlined />, color: '#059669', background: '#ECFDF5', label: 'Sản phẩm mới' },
  ai: { icon: <RobotOutlined />, color: '#DB2777', background: '#FDF2F8', label: 'AI insight' },
};

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

function NotificationContent({ onClose, data, isLoading }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const readAllMutation = useMutation({
    mutationFn: () => notificationAPI.readAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readOneMutation = useMutation({
    mutationFn: (id) => notificationAPI.readOne(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.deleteOne(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleClick = (notification) => {
    if (!notification.isRead) {
      readOneMutation.mutate(notification._id);
    }

    if (notification.link) {
      onClose();
      router.push(notification.link);
    }
  };

  if (isLoading) {
    return (
      <div style={{ width: 388, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: 12 }}>
            <Skeleton.Avatar active shape="square" size={44} style={{ borderRadius: 14 }} />
            <Skeleton active title={{ width: '72%' }} paragraph={{ rows: 2, width: ['100%', '55%'] }} style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div style={{ width: 388 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có thông báo mới."
          style={{ margin: '18px 0 12px' }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: 388 }}>
      {unreadCount > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            loading={readAllMutation.isPending}
            onClick={() => readAllMutation.mutate()}
            style={{ color: 'var(--text-muted)', fontWeight: 600 }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
        {notifications.map((notification) => {
          const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;

          return (
            <div
              key={notification._id}
              onClick={() => handleClick(notification)}
              role={notification.link ? 'button' : undefined}
              tabIndex={notification.link ? 0 : undefined}
              onKeyDown={(event) => {
                if (notification.link && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  handleClick(notification);
                }
              }}
              style={{
                display: 'flex',
                gap: 12,
                width: '100%',
                textAlign: 'left',
                border: '1px solid var(--border-color)',
                borderRadius: 18,
                padding: 14,
                background: notification.isRead ? 'white' : '#FFFBF5',
                cursor: notification.link ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: config.background,
                  color: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 18,
                }}
              >
                {config.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <Tag color={notification.isRead ? 'default' : 'orange'} style={{ margin: 0, borderRadius: 999 }}>
                    {config.label}
                  </Tag>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(notification.createdAt)}</span>
                </div>

                <div style={{ fontWeight: notification.isRead ? 600 : 800, color: 'var(--text-main)', marginBottom: 4 }}>
                  {notification.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {notification.message}
                </div>
              </div>

              <Tooltip title="Xóa">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending && deleteMutation.variables === notification._id}
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteMutation.mutate(notification._id);
                  }}
                  style={{ color: '#94A3B8', flexShrink: 0 }}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then((response) => response.data),
    enabled: open,
    refetchInterval: open ? 30000 : false,
    staleTime: 20000,
  });

  const unreadCount = data?.unreadCount || 0;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={<NotificationContent onClose={() => setOpen(false)} data={data} isLoading={isLoading} />}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <BellFilled style={{ color: '#EA580C' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Thông báo</span>
          {unreadCount > 0 ? <Badge count={unreadCount} style={{ background: '#DC2626' }} /> : null}
        </div>
      }
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{
        padding: '16px 18px',
        borderRadius: 20,
        boxShadow: '0 24px 48px rgba(15, 23, 42, 0.14)',
        minWidth: 420,
      }}
      overlayStyle={{ paddingTop: 10 }}
    >
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Badge count={unreadCount} style={{ background: '#DC2626' }} offset={[2, -4]}>
          <BellOutlined style={{ fontSize: 26, color: unreadCount > 0 ? '#EA580C' : '#0F172A', transition: 'color 0.2s' }} />
        </Badge>
      </div>
    </Popover>
  );
}
