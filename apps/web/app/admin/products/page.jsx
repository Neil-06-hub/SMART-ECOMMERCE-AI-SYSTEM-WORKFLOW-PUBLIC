'use client';

import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch,
  Upload, message, Tag, Image, Space, Tabs, Dropdown, Empty, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, UploadOutlined,
  MoreOutlined, SearchOutlined, EyeOutlined, EyeInvisibleOutlined,
  WarningOutlined, StarOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI, productAPI } from '@/lib/api';

const { Option } = Select;
const { TextArea } = Input;
const formatPrice = (p) => p ? p.toLocaleString('vi-VN') + 'đ' : '—';

const TAB_CONFIG = [
  { key: 'all',    label: 'Tất cả',    isActive: undefined },
  { key: 'active', label: 'Đang bán',  isActive: true      },
  { key: 'hidden', label: 'Đã ẩn',     isActive: false     },
];

export default function AdminProducts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const queryClient = useQueryClient();

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [activeTab, categoryFilter]);

  const tabCfg = TAB_CONFIG.find((t) => t.key === activeTab);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page, activeTab, categoryFilter],
    queryFn: () =>
      adminAPI.getProducts({
        search,
        page,
        limit: 20,
        ...(tabCfg?.isActive !== undefined && { isActive: tabCfg.isActive }),
        ...(categoryFilter && { category: categoryFilter }),
      }).then((r) => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productAPI.getCategories().then((r) => r.data.categories || []),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.products ?? [];
  const totalProducts = data?.pagination?.total ?? 0;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const openCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({ ...product, tags: product.tags?.join(', '), isActive: product.isActive });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Ẩn sản phẩm này?',
      content: 'Sản phẩm sẽ không còn hiện với khách hàng. Bạn có thể khôi phục lại sau.',
      okText: 'Ẩn',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminAPI.deleteProduct(id);
          message.success('Đã ẩn sản phẩm!');
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        } catch {
          message.error('Thao tác thất bại');
        }
      },
    });
  };

  const getActionMenu = (record) => ({
    items: [
      { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => openEdit(record) },
      {
        key: 'toggle',
        label: record.isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm',
        icon: record.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />,
        danger: record.isActive,
        onClick: () => handleDelete(record._id),
      },
    ],
  });

  const tabItems = TAB_CONFIG.map((tab) => ({ key: tab.key, label: tab.label }));

  const columns = [
    {
      title: 'Sản phẩm',
      width: 280,
      render: (_, p) => (
        <Space size={10}>
          <Image
            src={p.image}
            width={44}
            height={44}
            style={{ objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
            preview={false}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
              {p.name}
            </div>
            <div style={{ marginTop: 2 }}>
              <Tag color="orange" style={{ fontSize: 11, margin: 0 }}>{p.category}</Tag>
              {p.featured && <Tag color="gold" icon={<StarOutlined />} style={{ fontSize: 11, margin: '0 0 0 4px' }}>Nổi bật</Tag>}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá bán',
      width: 150,
      render: (_, p) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f97316', whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</div>
          {p.originalPrice > p.price && (
            <div style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
              {formatPrice(p.originalPrice)}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      width: 100,
      render: (s) => {
        if (s === 0) return <Tag color="red">Hết hàng</Tag>;
        if (s <= 5) return (
          <Tooltip title="Sắp hết hàng">
            <Tag color="orange" icon={<WarningOutlined />}>{s}</Tag>
          </Tooltip>
        );
        return <Tag color="green">{s}</Tag>;
      },
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      width: 80,
      render: (s) => <span style={{ fontWeight: 600 }}>{s || 0}</span>,
      sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 110,
      render: (v) =>
        v
          ? <Tag color="green" icon={<EyeOutlined />}>Đang bán</Tag>
          : <Tag color="default" icon={<EyeInvisibleOutlined />}>Đã ẩn</Tag>,
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
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: 20, color: '#0F172A' }}>Quản lý sản phẩm</h3>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>{totalProducts} sản phẩm</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none', height: 40, fontWeight: 600 }}
        >
          Thêm sản phẩm
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Tổng sản phẩm',  value: totalProducts,    color: '#6366f1', bg: '#F5F3FF' },
          { label: 'Danh mục',       value: categories.length, color: '#06b6d4', bg: '#ECFEFF' },
          { label: 'Sắp hết hàng',  value: lowStockCount,     color: '#f97316', bg: '#FFF7ED' },
          { label: 'Hết hàng',      value: outOfStockCount,   color: '#ef4444', bg: '#FEF2F2' },
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
          {/* Filter bar */}
          <Space wrap style={{ marginBottom: 12 }}>
            <Input.Search
              placeholder="Tìm sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={(v) => { setSearch(v); setPage(1); }}
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              allowClear
              onClear={() => { setSearch(''); setPage(1); }}
              style={{ width: 260 }}
            />
            <Select
              placeholder="Lọc theo danh mục"
              value={categoryFilter || undefined}
              onChange={(v) => setCategoryFilter(v ?? '')}
              allowClear
              style={{ width: 200 }}
            >
              {categories.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Space>

          <Table
            columns={columns}
            dataSource={products}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 920 }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có sản phẩm nào" /> }}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalProducts,
              onChange: (p, size) => { setPage(p); setPageSize(size); },
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (t) => `${t} sản phẩm`,
            }}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={680}
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
              listType="picture-card"
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length === 0 && <div><UploadOutlined /><div>Upload</div></div>}
            </Upload>
            {editingProduct?.image && fileList.length === 0 && (
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Ảnh hiện tại: <Image src={editingProduct.image} width={60} style={{ borderRadius: 4 }} />
              </div>
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
                {categories.map((c) => <Option key={c} value={c}>{c}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
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
              <Form.Item name="isActive" label="Đang hiển thị" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: '#f97316', border: 'none' }}
            >
              {editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
