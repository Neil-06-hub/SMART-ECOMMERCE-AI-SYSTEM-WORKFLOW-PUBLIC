'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table, Button, Tag, Modal, Form, Input, InputNumber, Select,
  Switch, DatePicker, message, Space, Typography, Tooltip,
  Tabs, Badge, Dropdown, Empty,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  CheckCircleOutlined, CloseCircleOutlined, TagOutlined,
  MoreOutlined, SearchOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { adminAPI } from '@/lib/api';

const { Option } = Select;
const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

const isExpired = (d) => d.expiresAt && new Date(d.expiresAt) < new Date();

export default function AdminDiscounts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('percent');
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(15);

  useEffect(() => { setTablePage(1); }, [activeTab, search]);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => adminAPI.getDiscounts().then((r) => r.data.discounts),
  });

  // Stats
  const activeCount  = discounts.filter((d) => d.isActive && !isExpired(d)).length;
  const inactiveCount = discounts.filter((d) => !d.isActive && !isExpired(d)).length;
  const expiredCount = discounts.filter((d) => isExpired(d)).length;
  const totalUsed    = discounts.reduce((sum, d) => sum + (d.usedCount ?? 0), 0);

  // Filtered
  const filtered = useMemo(() => {
    let list = discounts;
    if (activeTab === 'active')   list = list.filter((d) => d.isActive && !isExpired(d));
    else if (activeTab === 'inactive') list = list.filter((d) => !d.isActive && !isExpired(d));
    else if (activeTab === 'expired')  list = list.filter((d) => isExpired(d));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.code.toLowerCase().includes(q));
    }
    return list;
  }, [discounts, activeTab, search]);

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createDiscount(data),
    onSuccess: () => { message.success('Tạo mã thành công!'); queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); setIsModalOpen(false); },
    onError: (err) => message.error(err.response?.data?.message || 'Tạo thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateDiscount(id, data),
    onSuccess: () => { message.success('Cập nhật thành công!'); queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); setIsModalOpen(false); },
    onError: (err) => message.error(err.response?.data?.message || 'Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteDiscount(id),
    onSuccess: () => { message.success('Đã xóa mã!'); queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); },
    onError: () => message.error('Xóa thất bại'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleDiscount(id),
    onSuccess: (res) => { message.success(res.data.message); queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); },
  });

  const openCreate = () => {
    setEditing(null);
    setDiscountType('percent');
    form.resetFields();
    form.setFieldsValue({ type: 'percent', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setDiscountType(record.type);
    form.setFieldsValue({ ...record, expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null });
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    const payload = { ...values, expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null };
    if (editing) updateMutation.mutate({ id: editing._id, data: payload });
    else createMutation.mutate(payload);
  };

  const getActionMenu = (record) => ({
    items: [
      { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => openEdit(record) },
      {
        key: 'toggle',
        label: record.isActive ? 'Tắt mã' : 'Bật mã',
        icon: record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
        onClick: () => toggleMutation.mutate(record._id),
      },
      {
        key: 'copy',
        label: 'Sao chép mã',
        icon: <CopyOutlined />,
        onClick: () => { navigator.clipboard.writeText(record.code); message.success('Đã sao chép!'); },
      },
      { type: 'divider' },
      {
        key: 'delete',
        label: 'Xóa mã',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          Modal.confirm({
            title: `Xóa mã "${record.code}"?`,
            okText: 'Xóa',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: () => deleteMutation.mutate(record._id),
          }),
      },
    ],
  });

  const tabItems = [
    { key: 'all',      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Tất cả <Badge count={discounts.length} style={{ background: '#6366f1', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} /></span> },
    { key: 'active',   label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Đang bật <Badge count={activeCount} style={{ background: '#22c55e', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} /></span> },
    { key: 'inactive', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Đã tắt {inactiveCount > 0 && <Badge count={inactiveCount} style={{ background: '#94A3B8', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />}</span> },
    { key: 'expired',  label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Hết hạn {expiredCount > 0 && <Badge count={expiredCount} style={{ background: '#ef4444', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />}</span> },
  ];

  const columns = [
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      width: 180,
      render: (code) => (
        <Space style={{ flexWrap: 'nowrap' }}>
          <Typography.Text strong style={{ fontFamily: 'monospace', fontSize: 15, color: '#0F172A' }}>{code}</Typography.Text>
          <Tooltip title="Sao chép">
            <CopyOutlined
              style={{ color: '#94A3B8', cursor: 'pointer' }}
              onClick={() => { navigator.clipboard.writeText(code); message.success('Đã sao chép!'); }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 160,
      render: (t) => <Tag color={t === 'percent' ? 'blue' : 'orange'}>{t === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}</Tag>,
    },
    {
      title: 'Giá trị',
      width: 190,
      render: (_, r) => (
        <Typography.Text strong style={{ color: '#f97316', whiteSpace: 'nowrap' }}>
          {r.type === 'percent' ? `${r.value}%` : formatPrice(r.value)}
          {r.maxDiscount && r.type === 'percent' && (
            <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: 12 }}> (tối đa {formatPrice(r.maxDiscount)})</span>
          )}
        </Typography.Text>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderAmount',
      width: 150,
      render: (v) => v > 0 ? <span style={{ whiteSpace: 'nowrap' }}>{formatPrice(v)}</span> : <span style={{ color: '#94A3B8' }}>Không giới hạn</span>,
    },
    {
      title: 'Đã dùng',
      width: 110,
      render: (_, r) => (
        <span style={{ color: r.usageLimit > 0 && r.usedCount >= r.usageLimit ? '#ef4444' : '#0F172A', whiteSpace: 'nowrap', fontWeight: 600 }}>
          {r.usedCount} <span style={{ color: '#94A3B8', fontWeight: 400 }}>/ {r.usageLimit === 0 ? '∞' : r.usageLimit}</span>
        </span>
      ),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      width: 130,
      render: (d) => {
        if (!d) return <span style={{ color: '#94A3B8' }}>Không giới hạn</span>;
        const expired = new Date(d) < new Date();
        return <Tag color={expired ? 'red' : 'default'}>{new Date(d).toLocaleDateString('vi-VN')}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      render: (active, record) => {
        if (isExpired(record)) return <Tag color="red" icon={<CloseCircleOutlined />}>Hết hạn</Tag>;
        return (
          <Tag
            style={{ cursor: 'pointer' }}
            color={active ? 'green' : 'default'}
            icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            onClick={() => toggleMutation.mutate(record._id)}
          >
            {active ? 'Đang bật' : 'Đã tắt'}
          </Tag>
        );
      },
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagOutlined style={{ color: '#f97316' }} /> Mã giảm giá
          </h3>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>{discounts.length} mã đang quản lý</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', height: 40, fontWeight: 600 }}
        >
          Tạo mã mới
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Tổng mã',    value: discounts.length, color: '#6366f1', bg: '#F5F3FF' },
          { label: 'Đang bật',   value: activeCount,       color: '#22c55e', bg: '#F0FDF4' },
          { label: 'Hết hạn',   value: expiredCount,      color: '#ef4444', bg: '#FEF2F2' },
          { label: 'Tổng lượt dùng', value: totalUsed,   color: '#f97316', bg: '#FFF7ED' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '16px 20px', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '0 24px', borderBottom: '1px solid #F1F5F9' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" style={{ marginBottom: 0 }} />
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ marginBottom: 12 }}>
            <Input
              placeholder="Tìm theo mã giảm giá..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 1100 }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có mã giảm giá nào" /> }}
            pagination={{
              current: tablePage,
              pageSize: tablePageSize,
              onChange: (page, size) => { setTablePage(page); setTablePageSize(size); },
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '30'],
              showTotal: (t) => `${t} mã giảm giá`,
            }}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={editing ? `Chỉnh sửa mã: ${editing.code}` : 'Tạo mã giảm giá mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Vui lòng nhập mã' }]} normalize={(v) => v?.toUpperCase()}>
            <Input placeholder="VD: SALE10, FREESHIP, SUMMER2026" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input placeholder="Mô tả ngắn..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
              <Select onChange={setDiscountType}>
                <Option value="percent">Phần trăm (%)</Option>
                <Option value="fixed">Số tiền cố định (đ)</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="value"
              label={discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (đ)'}
              rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={discountType === 'percent' ? 100 : undefined}
                formatter={(v) => discountType === 'percent' ? `${v}%` : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/%|,/g, '')}
              />
            </Form.Item>
          </div>
          {discountType === 'percent' && (
            <Form.Item name="maxDiscount" label="Giảm tối đa (đ)" tooltip="Để trống = không giới hạn">
              <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v.replace(/,/g, '')} />
            </Form.Item>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="minOrderAmount" label="Đơn tối thiểu (đ)">
              <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v.replace(/,/g, '')} />
            </Form.Item>
            <Form.Item name="usageLimit" label="Giới hạn sử dụng" tooltip="0 = không giới hạn">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </div>
          <Form.Item name="expiresAt" label="Ngày hết hạn" tooltip="Để trống = không hết hạn">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn" />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ background: '#f97316', borderColor: '#f97316' }}
            >
              {editing ? 'Cập nhật' : 'Tạo mã'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
