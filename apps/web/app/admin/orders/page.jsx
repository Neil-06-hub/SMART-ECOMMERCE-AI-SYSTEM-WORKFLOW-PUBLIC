'use client';

import { useState } from 'react';
import { Table, Tag, Select, Button, Space, Typography, Drawer, Descriptions, message, Tabs, Badge } from 'antd';
import { EyeOutlined, ClockCircleOutlined, CarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';

const { Option } = Select;

const statusConfig = {
  pending:   { color: 'orange', text: 'Chờ xác nhận' },
  confirmed: { color: 'blue',   text: 'Đã xác nhận' },
  shipping:  { color: 'cyan',   text: 'Đang giao hàng' },
  delivered: { color: 'green',  text: 'Đã giao hàng' },
  cancelled: { color: 'red',    text: 'Đã hủy' },
};

const paymentConfig = {
  pending: { color: 'orange', text: 'Chưa thanh toán' },
  paid:    { color: 'green',  text: 'Đã thanh toán' },
  failed:  { color: 'red',    text: 'Thất bại' },
};

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

function OrderTable({ orders, loading, onView }) {
  const columns = [
    {
      title: 'Mã đơn', dataIndex: '_id',
      render: (id) => <Typography.Text copyable code>{id.slice(-8).toUpperCase()}</Typography.Text>,
    },
    {
      title: 'Khách hàng', dataIndex: 'user',
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600 }}>{u?.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{u?.email}</div>
        </div>
      ),
    },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: formatPrice, sorter: (a, b) => a.totalAmount - b.totalAmount },
    { title: 'TT Đơn hàng', dataIndex: 'orderStatus', render: (s) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.text || s}</Tag> },
    { title: 'TT Thanh toán', dataIndex: 'paymentStatus', render: (s) => <Tag color={paymentConfig[s]?.color}>{paymentConfig[s]?.text || s}</Tag> },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt',
      render: (d) => new Date(d).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => onView(record)}>Xem</Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns} dataSource={orders} rowKey="_id" loading={loading}
      style={{ background: 'white', borderRadius: 12 }}
      pagination={{ pageSize: 12, showTotal: (t) => `${t} đơn hàng` }}
    />
  );
}

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminAPI.getOrders({}).then((r) => r.data),
  });

  const allOrders = data?.orders || [];

  const tabGroups = [
    {
      key: 'pending',
      icon: <ClockCircleOutlined />,
      label: 'Chờ xử lý',
      orders: allOrders.filter((o) => ['pending', 'confirmed'].includes(o.orderStatus)),
      color: '#f97316',
    },
    {
      key: 'shipping',
      icon: <CarOutlined />,
      label: 'Đang giao hàng',
      orders: allOrders.filter((o) => o.orderStatus === 'shipping'),
      color: '#06B6D4',
    },
    {
      key: 'history',
      icon: <CheckCircleOutlined />,
      label: 'Lịch sử',
      orders: allOrders.filter((o) => ['delivered', 'cancelled'].includes(o.orderStatus)),
      color: '#10B981',
    },
  ];

  const handleStatusUpdate = async (orderId, orderStatus, paymentStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { orderStatus, paymentStatus });
      message.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
    } catch {
      message.error('Cập nhật thất bại');
    }
  };

  const tabItems = tabGroups.map((tab) => ({
    key: tab.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {tab.icon}
        {tab.label}
        <Badge count={tab.orders.length} style={{ background: tab.color, fontSize: 11 }} />
      </span>
    ),
    children: <OrderTable orders={tab.orders} loading={isLoading} onView={setSelectedOrder} />,
  }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>Quản lý đơn hàng</h3>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Tổng {allOrders.length} đơn hàng</p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: '0 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs defaultActiveKey="pending" items={tabItems} size="large" style={{ paddingTop: 8 }} />
      </div>

      <Drawer
        title={`Chi tiết đơn #${selectedOrder?._id.slice(-8).toUpperCase()}`}
        open={!!selectedOrder} onClose={() => setSelectedOrder(null)} width={520}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Khách hàng">{selectedOrder.user?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.user?.email}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.shippingAddress?.fullName} - {selectedOrder.shippingAddress?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="">
                {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Typography.Text strong style={{ color: '#f97316', fontSize: 16 }}>
                  {formatPrice(selectedOrder.totalAmount)}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 20 }}>
              <Typography.Title level={5}>Sản phẩm</Typography.Title>
              {selectedOrder.items?.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: 10, marginBottom: 8, padding: 8, background: '#fafafa', borderRadius: 6 }}>
                  <img src={item.image} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>x{item.quantity} × {formatPrice(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>

            <Typography.Title level={5}>Cập nhật trạng thái</Typography.Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select defaultValue={selectedOrder.orderStatus} style={{ width: '100%' }}
                onChange={(v) => handleStatusUpdate(selectedOrder._id, v, undefined)}>
                <Option value="pending">Chờ xác nhận</Option>
                <Option value="confirmed">Đã xác nhận</Option>
                <Option value="shipping">Đang giao hàng</Option>
                <Option value="delivered">Đã giao hàng</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
              <Select defaultValue={selectedOrder.paymentStatus} style={{ width: '100%' }}
                onChange={(v) => handleStatusUpdate(selectedOrder._id, undefined, v)}>
                <Option value="pending">Chưa thanh toán</Option>
                <Option value="paid">Đã thanh toán</Option>
                <Option value="failed">Thất bại</Option>
              </Select>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}
