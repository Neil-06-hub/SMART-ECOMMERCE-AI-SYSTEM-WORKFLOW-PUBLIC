'use client';

import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Upload, message, Tag, Popconfirm, Image, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI, productAPI } from '@/lib/api';

const { Option } = Select;
const { TextArea } = Input;

export default function AdminProducts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => adminAPI.getProducts({ search, page, limit: 20 }).then((r) => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productAPI.getCategories().then((r) => r.data.categories || []),
    staleTime: 5 * 60 * 1000,
  });

  const openCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      tags: product.tags?.join(', '),
      isActive: product.isActive,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
      if (fileList[0]?.originFileObj) formData.append('image', fileList[0].originFileObj);

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, formData);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await adminAPI.createProduct(formData);
        message.success('Tạo sản phẩm thành công!');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteProduct(id);
      message.success('Đã ẩn sản phẩm!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (err) {
      message.error('Xóa thất bại');
    }
  };

  const formatPrice = (p) => p ? p.toLocaleString('vi-VN') + 'đ' : '-';

  const columns = [
    { title: 'Ảnh', dataIndex: 'image', render: (img) => <Image src={img} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 6 }} /> },
    { title: 'Tên sản phẩm', dataIndex: 'name', ellipsis: true, width: 200 },
    { title: 'Danh mục', dataIndex: 'category', render: (c) => <Tag color="orange">{c}</Tag> },
    { title: 'Giá', dataIndex: 'price', render: formatPrice },
    { title: 'Tồn kho', dataIndex: 'stock', render: (s) => <Tag color={s > 0 ? 'green' : 'red'}>{s}</Tag> },
    { title: 'Đã bán', dataIndex: 'sold', render: (s) => s || 0 },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Ẩn'}</Tag> },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm title="Ẩn sản phẩm này?" onConfirm={() => handleDelete(record._id)} okText="Ẩn" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />}>Ẩn</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, margin: 0 }}>Quản lý sản phẩm</h3>
        <Space>
          <Input.Search placeholder="Tìm sản phẩm..." onSearch={(v) => { setSearch(v); setPage(1); }} style={{ width: 240 }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none' }}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <Table
        columns={columns} dataSource={data?.products} rowKey="_id"
        loading={isLoading} style={{ background: 'white', borderRadius: 12 }}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.pagination?.total,
          showTotal: (t) => `${t} sản phẩm`,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalOpen} onCancel={() => setIsModalOpen(false)}
        footer={null} width={680}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card" maxCount={1} fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length === 0 && <div><UploadOutlined /><div>Upload</div></div>}
            </Upload>
            {editingProduct?.image && fileList.length === 0 && (
              <div style={{ fontSize: 12, color: '#999' }}>Ảnh hiện tại: <Image src={editingProduct.image} width={60} /></div>
            )}
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="price" label="Giá bán (đ)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0} />
            </Form.Item>
            <Form.Item name="originalPrice" label="Giá gốc (đ)">
              <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0} />
            </Form.Item>
            <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
              <Select placeholder="Chọn danh mục" allowClear>
                {categories.map((c) => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="stock" label="Số lượng tồn kho" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </div>
          <Form.Item name="tags" label="Tags (phân cách bằng dấu phẩy)" tooltip="Dùng cho AI gợi ý sản phẩm">
            <Input placeholder="VD: gaming, laptop, dell, mỏng nhẹ" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="featured" label="Nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>
            {editingProduct && (
              <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}
              style={{ background: '#f97316', border: 'none' }}>
              {editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
