'use client';

import { useState } from 'react';
import { Table, Avatar, Tag, Typography, Button, Space, Modal, Form, Input, Select, Popconfirm, message } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';

const { Option } = Select;

export default function AdminUsers() {
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers().then((r) => r.data.users),
  });

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

  const handleEditSubmit = (values) => {
    updateMutation.mutate({ id: editingUser._id, data: values });
  };

  const columns = [
    {
      title: 'Khách hàng',
      width: 220,
      render: (_, u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar src={u.avatar} icon={!u.avatar && <UserOutlined />}
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
            <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      width: 130,
      render: (p) => <span style={{ whiteSpace: 'nowrap' }}>{p || '-'}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      width: 160,
      ellipsis: true,
      render: (a) => a || '-',
    },
    {
      title: 'Sở thích (AI)',
      dataIndex: 'preferences',
      width: 170,
      render: (tags) => tags?.length
        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tags.slice(0, 3).map((t) => <Tag key={t} color="orange" style={{ fontSize: 11, margin: 0 }}>{t}</Tag>)}
          </div>
        : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isBlocked',
      width: 120,
      render: (blocked) => blocked
        ? <Tag color="red" icon={<LockOutlined />}>Đã khóa</Tag>
        : <Tag color="green" icon={<UnlockOutlined />}>Hoạt động</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 110,
      render: (d) => <span style={{ whiteSpace: 'nowrap' }}>{new Date(d).toLocaleDateString('vi-VN')}</span>,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Thao tác',
      width: 190,
      render: (_, record) => (
        <Space size={4} style={{ flexWrap: 'nowrap' }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm
            title={record.isBlocked ? 'Mở khóa tài khoản này?' : 'Khóa tài khoản này?'}
            description={record.isBlocked ? 'Người dùng sẽ đăng nhập lại được.' : 'Người dùng sẽ không thể đăng nhập.'}
            onConfirm={() => blockMutation.mutate(record._id)}
            okText="Xác nhận" cancelText="Hủy"
            okType={record.isBlocked ? 'primary' : 'danger'}
          >
            <Button
              size="small"
              icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
              danger={!record.isBlocked}
              style={record.isBlocked ? { color: '#10B981', borderColor: '#10B981' } : {}}
              loading={blockMutation.isPending && blockMutation.variables === record._id}
            >
              {record.isBlocked ? 'Mở khóa' : 'Khóa'}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa tài khoản này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa" cancelText="Hủy" okType="danger"
          >
            <Button
              size="small" danger icon={<DeleteOutlined />}
              loading={deleteMutation.isPending && deleteMutation.variables === record._id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>
          Quản lý khách hàng
        </h3>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>{data?.length || 0} tài khoản</p>
      </div>

      <Table
        columns={columns} dataSource={data} rowKey="_id"
        loading={isLoading} style={{ background: 'white', borderRadius: 12 }}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 15, showTotal: (t) => `${t} khách hàng` }}
      />

      <Modal
        title={`Chỉnh sửa: ${editingUser?.name}`}
        open={!!editingUser} onCancel={() => setEditingUser(null)} footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: 16 }}>
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
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}
              style={{ background: '#f97316', borderColor: '#f97316' }}>
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
