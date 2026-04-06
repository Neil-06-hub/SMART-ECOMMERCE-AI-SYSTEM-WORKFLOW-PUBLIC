'use client';

import { useState } from 'react';
import { Popover, Badge, Button, Spin, Empty, Tooltip } from 'antd';
import {
  BellFilled, BellOutlined, ShoppingOutlined, HeartOutlined, GiftOutlined,
  AppstoreOutlined, RobotOutlined, CheckOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationAPI } from '@/lib/api';

const TYPE_CONFIG = {
  order:       { icon: <ShoppingOutlined />, color: '#3B82F6', bg: '#EFF6FF' },
  wishlist:    { icon: <HeartOutlined />,    color: '#EF4444', bg: '#FEF2F2' },
  promotion:   { icon: <GiftOutlined />,     color: '#F97316', bg: '#FFF7ED' },
  system:      { icon: <BellOutlined />,     color: '#8B5CF6', bg: '#F5F3FF' },
  new_product: { icon: <AppstoreOutlined />, color: '#10B981', bg: '#ECFDF5' },
  ai:          { icon: <RobotOutlined />,    color: '#EC4899', bg: '#FDF4FF' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  return `${d} ngày trước`;
};

const NotificationContent = ({ onClose, data, isLoading }) => {
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

  const handleClick = (notif) => {
    if (!notif.isRead) readOneMutation.mutate(notif._id);
    if (notif.link) { onClose(); router.push(notif.link); }
  };

  if (isLoading) {
    return (
      <div style={{ width: 380, display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div style={{ width: 380 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#94A3B8', fontSize: 13 }}>Chưa có thông báo nào</span>}
          style={{ margin: '28px 0' }} />
      </div>
    );
  }

  return (
    <div style={{ width: 380 }}>
      {unreadCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button type="text" size="small" icon={<CheckOutlined />}
            loading={readAllMutation.isPending}
            onClick={() => readAllMutation.mutate()}
            style={{ color: '#64748B', fontSize: 12 }}>
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      )}
      <div style={{ maxHeight: 400, overflowY: 'auto', margin: '0 -4px' }}>
        {notifications.map((notif) => {
          const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
          return (
            <div key={notif._id}
              style={{
                display: 'flex', gap: 12, padding: '10px 4px',
                borderBottom: '1px solid #F1F5F9',
                background: notif.isRead ? 'transparent' : '#FFFBF5',
                borderRadius: 8, marginBottom: 2,
                cursor: notif.link ? 'pointer' : 'default',
                position: 'relative', transition: 'background 0.15s',
              }}
              onClick={() => handleClick(notif)}
            >
              {!notif.isRead && (
                <div style={{ position: 'absolute', top: 14, right: 36, width: 7, height: 7, borderRadius: '50%', background: '#F97316' }} />
              )}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, color: cfg.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: 13, color: '#0F172A', marginBottom: 2, lineHeight: 1.4 }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{timeAgo(notif.createdAt)}</div>
              </div>
              <Tooltip title="Xóa">
                <Button type="text" size="small" icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending && deleteMutation.variables === notif._id}
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(notif._id); }}
                  style={{ color: '#CBD5E1', flexShrink: 0 }} />
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then((r) => r.data),
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <BellFilled style={{ color: '#F97316' }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Thông báo</span>
          {unreadCount > 0 && <Badge count={unreadCount} style={{ background: '#EF4444' }} />}
        </div>
      }
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{ padding: '14px 16px', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 412 }}
      overlayStyle={{ paddingTop: 8 }}
    >
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Badge count={unreadCount} style={{ background: '#EF4444' }} offset={[2, -4]}>
          <BellOutlined style={{ fontSize: 26, color: unreadCount > 0 ? '#F97316' : '#0F172A', transition: 'color 0.2s' }} />
        </Badge>
      </div>
    </Popover>
  );
};

export default NotificationDropdown;
