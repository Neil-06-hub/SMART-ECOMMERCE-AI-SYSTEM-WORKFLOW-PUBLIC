'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table, Avatar, Tag, Button, Space, Modal, Form, Input, Select,
  message, Tabs, Badge, Dropdown, Empty,
} from 'antd';
import {
  LockOutlined, UnlockOutlined, SearchOutlined,
  EditOutlined, DeleteOutlined, MoreOutlined,
  CheckCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';

const { Option } = Select;

export default function AdminUsers() {
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(15);

  useEffect(() => { setTablePage(1); }, [activeTab, search]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers().then((r) => r.data.users),
  });

  const total = users.length;
  const activeCount = users.filter((u) => !u.isBlocked).length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  const filteredUsers = useMemo(() => {
    let list = users;
    if (activeTab === 'active') list = list.filter((u) => !u.isBlocked);
    else if (activeTab === 'blocked') list = list.filter((u) => u.isBlocked);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.name ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q) ||
          (u.phone ?? '').includes(q)
      );
    }
    return list;
  }, [users, activeTab, search]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      message.success('Cập nhật tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => {
      message.success('Đã xóa tài khoản!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => message.error(err.response?.data?.message || 'Xóa thất bại'),
  });

  const blockMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleBlockUser(id),
    onSuccess: (res) => {
      message.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => message.error(err.response?.data?.message || 'Thao tác thất bại'),
  });

  const openEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({ name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role });
  };

  const getActionMenu = (record) => ({
    items: [
      { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => openEdit(record) },
      {
        key: 'block',
        label: record.isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
        icon: record.isBlocked ? <UnlockOutlined /> : <LockOutlined />,
        danger: !record.isBlocked,
        onClick: () => blockMutation.mutate(record._id),
      },
      { type: 'divider' },
      {
        key: 'delete',
        label: 'Xóa tài khoản',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () =>
          Modal.confirm({
            title: `Xóa tài khoản "${record.name}"?`,
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: () => deleteMutation.mutate(record._id),
          }),
      },
    ],
  });

  const tabItems = [
    {
      key: 'all',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Tất cả
          <Badge count={total} style={{ background: '#6366f1', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />
        </span>
      ),
    },
    {
      key: 'active',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Hoạt động
          <Badge count={activeCount} style={{ background: '#22c55e', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />
        </span>
      ),
    },
    {
      key: 'blocked',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Đã khóa
          {blockedCount > 0 && <Badge count={blockedCount} style={{ background: '#ef4444', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18 }} />}
        </span>
      ),
    },
  ];

  const columns = [
    {
      title: 'Khách hàng',
      width: 240,
      render: (_, u) => (
        <Space size={10}>
          <Avatar
            src={u.avatar || null}
            size={36}
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', flexShrink: 0 }}
          >
            {!u.avatar && (u.name?.[0] ?? '?').toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{u.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      width: 130,
      render: (p) => p || <span style={{ color: '#94A3B8' }}>—</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      width: 180,
      ellipsis: true,
      render: (a) => a || <span style={{ color: '#94A3B8' }}>—</span>,
    },
    {
      title: 'Sở thích AI',
      dataIndex: 'preferences',
      width: 190,
      render: (tags) =>
        tags?.length ? (
          <Space size={4} wrap>
            {tags.slice(0, 3).map((t) => (
              <Tag key={t} color="orange" style={{ fontSize: 11, margin: 0 }}>{t}</Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: '#94A3B8' }}>—</span>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isBlocked',
      width: 120,
      render: (blocked) =>
        blocked
          ? <Tag color="red" icon={<StopOutlined />}>Đã khóa</Tag>
          : <Tag color="green" icon={<CheckCircleOutlined />}>Hoạt động</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 110,
      render: (d) => <span style={{ color: '#64748B', fontSize: 13 }}>{new Date(d).toLocaleDateString('vi-VN')}</span>,
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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>Quản lý khách hàng</h3>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>{total} tài khoản khách hàng</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Tổng khách hàng', value: total,        color: '#6366f1', bg: '#F5F3FF' },
          { label: 'Đang hoạt động',  value: activeCount,  color: '#22c55e', bg: '#F0FDF4' },
          { label: 'Đã khóa',         value: blockedCount, color: '#ef4444', bg: '#FEF2F2' },
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
              placeholder="Tìm theo tên, email, SĐT..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 1100 }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có khách hàng nào" /> }}
            pagination={{
              current: tablePage,
              pageSize: tablePageSize,
              onChange: (page, size) => { setTablePage(page); setTablePageSize(size); },
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '30'],
              showTotal: (t) => `${t} khách hàng`,
            }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={`Chỉnh sửa: ${editingUser?.name}`}
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => updateMutation.mutate({ id: editingUser._id, data: values })}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò">
            <Select>
              <Option value="customer">Khách hàng</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditingUser(null)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
              style={{ background: '#f97316', borderColor: '#f97316' }}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
