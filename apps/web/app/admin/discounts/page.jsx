'use client';

import { useState } from 'react';
import {
  Table, Button, Tag, Modal, Form, Input, InputNumber, Select,
  Switch, DatePicker, Popconfirm, message, Space, Typography, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  CheckCircleOutlined, CloseCircleOutlined, TagOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { adminAPI } from '@/lib/api';

const { Option } = Select;
const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

export default function AdminDiscounts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('percent');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => adminAPI.getDiscounts().then((r) => r.data.discounts),
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createDiscount(data),
    onSuccess: () => {
      message.success('Tạo mã thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      setIsModalOpen(false);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Tạo thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateDiscount(id, data),
    onSuccess: () => {
      message.success('Cập nhật thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      setIsModalOpen(false);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteDiscount(id),
    onSuccess: () => {
      message.success('Đã xóa mã!');
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    },
    onError: () => message.error('Xóa thất bại'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleDiscount(id),
    onSuccess: (res) => {
      message.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    },
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
    form.setFieldsValue({
      ...record,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
    };
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      render: (code) => (
        <Space>
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
      render: (t) => <Tag color={t === 'percent' ? 'blue' : 'orange'}>{t === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}</Tag>,
    },
    {
      title: 'Giá trị',
      render: (_, r) => (
        <Typography.Text strong style={{ color: '#f97316' }}>
          {r.type === 'percent' ? `${r.value}%` : formatPrice(r.value)}
          {r.maxDiscount && r.type === 'percent' && <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: 12 }}> (tối đa {formatPrice(r.maxDiscount)})</span>}
        </Typography.Text>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderAmount',
      render: (v) => v > 0 ? formatPrice(v) : <span style={{ color: '#94A3B8' }}>Không giới hạn</span>,
    },
    {
      title: 'Đã dùng',
      render: (_, r) => (
        <span style={{ color: r.usageLimit > 0 && r.usedCount >= r.usageLimit ? '#EF4444' : '#0F172A' }}>
          {r.usedCount} / {r.usageLimit === 0 ? '∞' : r.usageLimit}
        </span>
      ),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiresAt',
      render: (d) => {
        if (!d) return <span style={{ color: '#94A3B8' }}>Không giới hạn</span>;
        const expired = new Date(d) < new Date();
        return <Tag color={expired ? 'red' : 'default'}>{new Date(d).toLocaleDateString('vi-VN')}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (active, record) => (
        <Tag
          style={{ cursor: 'pointer' }}
          color={active ? 'green' : 'default'}
          icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          onClick={() => toggleMutation.mutate(record._id)}
        >
          {active ? 'Đang bật' : 'Đã tắt'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa mã giảm giá này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa" cancelText="Hủy" okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}
              loading={deleteMutation.isPending && deleteMutation.variables === record._id} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagOutlined style={{ color: '#f97316' }} /> Mã giảm giá
          </h3>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>{data?.length || 0} mã đang quản lý</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', height: 40, fontWeight: 600 }}>
          Tạo mã mới
        </Button>
      </div>

      <Table
        columns={columns} dataSource={data} rowKey="_id" loading={isLoading}
        style={{ background: 'white', borderRadius: 16 }}
        pagination={{ pageSize: 15, showTotal: (t) => `${t} mã giảm giá` }}
      />

      <Modal
        title={editing ? `Chỉnh sửa mã: ${editing.code}` : 'Tạo mã giảm giá mới'}
        open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
            normalize={(v) => v?.toUpperCase()}>
            <Input placeholder="VD: SALE10, FREESHIP, SUMMER2026" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input placeholder="Mô tả ngắn về mã giảm giá..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
              <Select onChange={setDiscountType}>
                <Option value="percent">Phần trăm (%)</Option>
                <Option value="fixed">Số tiền cố định (đ)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="value" label={discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (đ)'}
              rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
              <InputNumber style={{ width: '100%' }} min={0} max={discountType === 'percent' ? 100 : undefined}
                formatter={(v) => discountType === 'percent' ? `${v}%` : `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/%|,/g, '')} />
            </Form.Item>
          </div>

          {discountType === 'percent' && (
            <Form.Item name="maxDiscount" label="Giảm tối đa (đ)" tooltip="Để trống = không giới hạn">
              <InputNumber style={{ width: '100%' }} min={0}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/,/g, '')} />
            </Form.Item>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="minOrderAmount" label="Đơn tối thiểu (đ)">
              <InputNumber style={{ width: '100%' }} min={0}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/,/g, '')} />
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
            <Button type="primary" htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ background: '#f97316', borderColor: '#f97316' }}>
              {editing ? 'Cập nhật' : 'Tạo mã'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
