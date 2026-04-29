'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Table, Tag, Select, Button, Space, Typography, Drawer, Descriptions,
  message, Tabs, Badge, Input, DatePicker, Dropdown, Modal, Avatar, Empty, Tooltip,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, MoreOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, PrinterOutlined,
  CarOutlined, ExportOutlined, CheckOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusConfig = {
  pending:   { color: 'gold',    text: 'Chờ xác nhận' },
  paid:      { color: 'purple',  text: 'Đang xử lý' },
  confirmed: { color: 'blue',    text: 'Chờ lấy hàng' },
  shipping:  { color: 'cyan',    text: 'Đang giao' },
  delivered: { color: 'green',   text: 'Đã giao' },
  cancelled: { color: 'red',     text: 'Đã hủy' },
};

const paymentConfig = {
  pending: { color: 'orange', text: 'Chưa thanh toán' },
  paid:    { color: 'green',  text: 'Đã thanh toán' },
  failed:  { color: 'red',    text: 'Thất bại' },
};

const NEXT_STATE = {
  pending:   'confirmed',
  paid:      'confirmed',
  confirmed: 'shipping',
  shipping:  'delivered',
};

const ALLOWED_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled', 'paid'],
  paid:      ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping:  ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const TAB_CONFIG = [
  { key: 'all',       label: 'Tất cả',       statuses: null                },
  { key: 'pending',   label: 'Chờ xác nhận', statuses: ['pending', 'paid'] },
  { key: 'ready',     label: 'Chờ lấy hàng', statuses: ['confirmed']       },
  { key: 'shipping',  label: 'Đang giao',    statuses: ['shipping']        },
  { key: 'delivered', label: 'Đã giao',      statuses: ['delivered']       },
  { key: 'cancelled', label: 'Đã hủy',       statuses: ['cancelled']       },
  { key: 'returned',  label: 'Trả hàng',     statuses: []                  },
];

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

function exportCSV(orders) {
  const rows = [
    ['Mã đơn', 'Khách hàng', 'Phone', 'Tổng tiền', 'TT Đơn hàng', 'TT Thanh toán', 'Ngày tạo'],
    ...orders.map((o) => [
      o._id.slice(-8).toUpperCase(),
      o.user?.name ?? '',
      o.shippingAddress?.phone ?? '',
      o.totalAmount,
      statusConfig[o.orderStatus]?.text ?? o.orderStatus,
      paymentConfig[o.paymentStatus]?.text ?? o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString('vi-VN'),
    ]),
  ];
  const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = `orders_${Date.now()}.csv`;
  a.click();
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const printRef = useRef(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerStatus, setDrawerStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: [],
    paymentMethod: null,
    paymentStatus: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminAPI.getOrders({ limit: 500 }).then((r) => r.data),
  });

  const allOrders = data?.orders ?? [];

  // Reset page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRowKeys([]);
  }, [activeTab, filters]);

  // Sync drawer select with actual order status
  useEffect(() => {
    if (selectedOrder) setDrawerStatus(selectedOrder.orderStatus);
  }, [selectedOrder]);

  // Badge counts (before search/date filters, just by status)
  const tabCounts = useMemo(() => {
    const counts = {};
    TAB_CONFIG.forEach((tab) => {
      if (!tab.statuses) {
        counts[tab.key] = allOrders.length;
      } else {
        counts[tab.key] = allOrders.filter((o) => tab.statuses.includes(o.orderStatus)).length;
      }
    });
    return counts;
  }, [allOrders]);

  // Filtered orders for current tab + all filters
  const filteredOrders = useMemo(() => {
    const tabCfg = TAB_CONFIG.find((t) => t.key === activeTab);
    let list = !tabCfg?.statuses
      ? allOrders
      : allOrders.filter((o) => tabCfg.statuses.includes(o.orderStatus));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o._id.slice(-8).toLowerCase().includes(q) ||
          (o.user?.name ?? '').toLowerCase().includes(q) ||
          (o.shippingAddress?.phone ?? '').includes(q)
      );
    }
    if (filters.dateRange.length === 2) {
      list = list.filter((o) => {
        const d = dayjs(o.createdAt);
        return (
          d.isAfter(filters.dateRange[0].startOf('day').subtract(1, 'ms')) &&
          d.isBefore(filters.dateRange[1].endOf('day').add(1, 'ms'))
        );
      });
    }
    if (filters.paymentMethod)
      list = list.filter((o) => o.paymentMethod === filters.paymentMethod);
    if (filters.paymentStatus)
      list = list.filter((o) => o.paymentStatus === filters.paymentStatus);

    return list;
  }, [allOrders, activeTab, filters]);

  const hasActiveFilter =
    filters.search || filters.dateRange.length || filters.paymentMethod || filters.paymentStatus;

  const handleStatusUpdate = async (orderId, orderStatus, paymentStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { orderStatus, paymentStatus });
      message.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
    } catch (e) {
      if (orderStatus) setDrawerStatus(selectedOrder?.orderStatus);
      message.error(e?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleQuickConfirm = async (record) => {
    const next = NEXT_STATE[record.orderStatus];
    if (!next) return;
    try {
      await adminAPI.updateOrderStatus(record._id, { orderStatus: next });
      message.success(`Đã chuyển → ${statusConfig[next]?.text}`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    } catch (e) {
      message.error(e?.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleCancel = (record) => {
    Modal.confirm({
      title: `Hủy đơn #${record._id.slice(-8).toUpperCase()}?`,
      content: 'Thao tác này không thể hoàn tác. Tồn kho sẽ được hoàn trả nếu đơn đã xác nhận.',
      okText: 'Hủy đơn',
      okButtonProps: { danger: true },
      cancelText: 'Không',
      onOk: () => handleStatusUpdate(record._id, 'cancelled'),
    });
  };

  const handleBulkConfirm = async () => {
    const targets = filteredOrders.filter(
      (o) => selectedRowKeys.includes(o._id) && ['pending', 'paid'].includes(o.orderStatus)
    );
    if (!targets.length) {
      message.warning('Không có đơn nào ở trạng thái có thể xác nhận');
      return;
    }
    try {
      await Promise.all(targets.map((o) => adminAPI.updateOrderStatus(o._id, { orderStatus: 'confirmed' })));
      message.success(`Đã xác nhận ${targets.length} đơn hàng`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedRowKeys([]);
    } catch {
      message.error('Có lỗi xảy ra khi xác nhận hàng loạt');
    }
  };

  const handleBulkCancel = () => {
    const targets = filteredOrders.filter(
      (o) => selectedRowKeys.includes(o._id) && !['delivered', 'cancelled'].includes(o.orderStatus)
    );
    if (!targets.length) {
      message.warning('Không có đơn nào có thể hủy');
      return;
    }
    Modal.confirm({
      title: `Hủy ${targets.length} đơn hàng?`,
      content: 'Thao tác này không thể hoàn tác.',
      okText: 'Xác nhận hủy',
      okButtonProps: { danger: true },
      cancelText: 'Không',
      onOk: async () => {
        try {
          await Promise.all(targets.map((o) => adminAPI.updateOrderStatus(o._id, { orderStatus: 'cancelled' })));
          message.success(`Đã hủy ${targets.length} đơn hàng`);
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          setSelectedRowKeys([]);
        } catch {
          message.error('Có lỗi xảy ra khi hủy hàng loạt');
        }
      },
    });
  };

  const handlePrint = (record) => {
    setSelectedOrder(record);
    setTimeout(() => window.print(), 300);
  };

  const getActionMenu = (record) => {
    const next = NEXT_STATE[record.orderStatus];
    const canCancel = !['delivered', 'cancelled'].includes(record.orderStatus);
    return {
      items: [
        {
          key: 'view',
          label: 'Xem chi tiết',
          icon: <EyeOutlined />,
          onClick: () => setSelectedOrder(record),
        },
        next && {
          key: 'quick',
          label: `Xác nhận → ${statusConfig[next]?.text}`,
          icon: <CheckOutlined />,
          onClick: () => handleQuickConfirm(record),
        },
        {
          key: 'print',
          label: 'In hóa đơn',
          icon: <PrinterOutlined />,
          onClick: () => handlePrint(record),
        },
        canCancel && {
          key: 'cancel',
          label: 'Hủy đơn',
          icon: <CloseCircleOutlined />,
          danger: true,
          onClick: () => handleCancel(record),
        },
      ].filter(Boolean),
    };
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      width: 130,
      render: (id) => (
        <Typography.Text copyable code style={{ fontSize: 12 }}>
          {id.slice(-8).toUpperCase()}
        </Typography.Text>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      width: 200,
      render: (u, record) => (
        <Space size={8}>
          <Avatar size={32} style={{ background: '#6366f1', flexShrink: 0 }}>
            {(u?.name ?? '?')[0].toUpperCase()}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u?.name ?? '—'}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: '16px' }}>
              {record.shippingAddress?.phone ?? u?.email ?? ''}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      width: 130,
      align: 'right',
      render: (p) => (
        <span style={{ fontWeight: 600, color: '#f97316', whiteSpace: 'nowrap' }}>
          {formatPrice(p)}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'TT Đơn hàng',
      dataIndex: 'orderStatus',
      width: 145,
      render: (s) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.text ?? s}</Tag>,
    },
    {
      title: 'TT Thanh toán',
      dataIndex: 'paymentStatus',
      width: 145,
      render: (s) => <Tag color={paymentConfig[s]?.color}>{paymentConfig[s]?.text ?? s}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 110,
      render: (d) => (
        <span style={{ whiteSpace: 'nowrap', color: '#64748B', fontSize: 13 }}>
          {new Date(d).toLocaleDateString('vi-VN')}
        </span>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: '',
      width: 48,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} size="small" />
        </Dropdown>
      ),
    },
  ];

  const tabItems = TAB_CONFIG.map((tab) => ({
    key: tab.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {tab.label}
        {tabCounts[tab.key] > 0 && (
          <Badge
            count={tabCounts[tab.key]}
            style={{ background: tab.key === 'cancelled' ? '#ef4444' : tab.key === 'delivered' ? '#22c55e' : '#6366f1', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }}
          />
        )}
      </span>
    ),
  }));

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span style={{ color: '#94A3B8' }}>
          Không có đơn hàng nào
          {filters.search ? ` cho "${filters.search}"` : ''}
        </span>
      }
    />
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>Quản lý đơn hàng</h3>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>
          Tổng {allOrders.length} đơn hàng
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Tabs */}
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
          {/* Filter Bar */}
          <Space wrap style={{ marginBottom: 12, width: '100%' }}>
            <Input
              placeholder="Tìm theo mã đơn, tên KH, SĐT..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              allowClear
              style={{ width: 260 }}
            />
            <RangePicker
              value={filters.dateRange.length ? filters.dateRange : null}
              onChange={(dates) => setFilters((f) => ({ ...f, dateRange: dates ?? [] }))}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 240 }}
            />
            <Select
              placeholder="Phương thức TT"
              value={filters.paymentMethod}
              onChange={(v) => setFilters((f) => ({ ...f, paymentMethod: v }))}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="COD">COD</Option>
              <Option value="banking">Banking</Option>
              <Option value="momo">MoMo</Option>
            </Select>
            <Select
              placeholder="Trạng thái TT"
              value={filters.paymentStatus}
              onChange={(v) => setFilters((f) => ({ ...f, paymentStatus: v }))}
              allowClear
              style={{ width: 160 }}
            >
              <Option value="pending">Chưa thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="failed">Thất bại</Option>
            </Select>
            {hasActiveFilter && (
              <Tooltip title="Xóa bộ lọc">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => setFilters({ search: '', dateRange: [], paymentMethod: null, paymentStatus: null })}
                >
                  Reset
                </Button>
              </Tooltip>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <Button
                icon={<ExportOutlined />}
                onClick={() => exportCSV(filteredOrders)}
                disabled={!filteredOrders.length}
              >
                Xuất CSV
              </Button>
            </div>
          </Space>

          {/* Bulk Action Bar */}
          {selectedRowKeys.length > 0 && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#1D4ED8', fontSize: 14 }}>
                <CheckCircleOutlined style={{ marginRight: 6 }} />
                {selectedRowKeys.length} đơn đã chọn
              </span>
              <Space>
                <Button size="small" icon={<ExportOutlined />} onClick={() => exportCSV(filteredOrders.filter((o) => selectedRowKeys.includes(o._id)))}>
                  Xuất CSV
                </Button>
                <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={handleBulkConfirm}>
                  Xác nhận hàng loạt
                </Button>
                <Button size="small" danger icon={<CloseCircleOutlined />} onClick={handleBulkCancel}>
                  Hủy hàng loạt
                </Button>
                <Button size="small" onClick={() => setSelectedRowKeys([])}>
                  Bỏ chọn
                </Button>
              </Space>
            </div>
          )}

          {/* Table */}
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              preserveSelectedRowKeys: true,
            }}
            columns={columns}
            dataSource={filteredOrders}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 980 }}
            locale={{ emptyText }}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredOrders.length,
              onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `${total} đơn hàng`,
            }}
          />
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={
          <Space>
            <span>Chi tiết đơn</span>
            <Typography.Text code style={{ fontSize: 13 }}>
              #{selectedOrder?._id.slice(-8).toUpperCase()}
            </Typography.Text>
          </Space>
        }
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        width={540}
      >
        {selectedOrder && (
          <div ref={printRef}>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Khách hàng">{selectedOrder.user?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.user?.email}</Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedOrder.shippingAddress?.fullName} — {selectedOrder.shippingAddress?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Typography.Text strong style={{ color: '#f97316', fontSize: 16 }}>
                  {formatPrice(selectedOrder.totalAmount)}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginBottom: 8 }}>Sản phẩm</Typography.Title>
            {selectedOrder.items?.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: 10, marginBottom: 8, padding: 8, background: '#F8FAFC', borderRadius: 6 }}>
                <img src={item.image} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} alt={item.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>x{item.quantity} × {formatPrice(item.price)}</div>
                </div>
              </div>
            ))}

            <Typography.Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Cập nhật trạng thái</Typography.Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                value={drawerStatus}
                style={{ width: '100%' }}
                onChange={(v) => {
                  setDrawerStatus(v);
                  handleStatusUpdate(selectedOrder._id, v, undefined);
                }}
              >
                {[selectedOrder.orderStatus, ...(ALLOWED_TRANSITIONS[selectedOrder.orderStatus] ?? [])]
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .map((v) => (
                    <Option key={v} value={v} disabled={v === selectedOrder.orderStatus}>
                      {statusConfig[v]?.text ?? v}
                    </Option>
                  ))}
              </Select>
              <Select
                defaultValue={selectedOrder.paymentStatus}
                style={{ width: '100%' }}
                onChange={(v) => handleStatusUpdate(selectedOrder._id, undefined, v)}
              >
                <Option value="pending">Chưa thanh toán</Option>
                <Option value="paid">Đã thanh toán</Option>
                <Option value="failed">Thất bại</Option>
              </Select>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body > * { display: none !important; }
          .ant-drawer { display: block !important; position: static !important; }
          .ant-drawer-mask { display: none !important; }
          .ant-drawer-content-wrapper { box-shadow: none !important; width: 100% !important; }
          .ant-drawer-header-title button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
