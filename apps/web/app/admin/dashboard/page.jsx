'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowUpOutlined,
  BarChartOutlined,
  BulbOutlined,
  DollarOutlined,
  FallOutlined,
  FireOutlined,
  PieChartOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { adminAPI } from '@/lib/api';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const { Paragraph, Text, Title } = Typography;

const Area = dynamic(() => import('@ant-design/charts').then((m) => m.Area), { ssr: false });
const Column = dynamic(() => import('@ant-design/charts').then((m) => m.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/charts').then((m) => m.Pie), { ssr: false });

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function unwrapPayload(payload) {
  if (payload?.data && payload?.success !== undefined) return payload.data;
  return payload;
}

function DashboardSkeleton() {
  return (
    <Row gutter={[20, 20]}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Col key={index} xs={24} md={12} xl={6}>
          <Card style={{ borderRadius: 24 }}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ))}
      <Col xs={24} xl={14}>
        <Card style={{ borderRadius: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Col>
      <Col xs={24} xl={10}>
        <Card style={{ borderRadius: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Col>
    </Row>
  );
}

function MetricCard({ title, value, icon, accent, suffix, extra }) {
  return (
    <Card
      style={{
        borderRadius: 24,
        border: '1px solid var(--border-color)',
        boxShadow: '0 14px 28px rgba(131, 61, 7, 0.05)',
      }}
      bodyStyle={{ padding: 22 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>{title}</div>
          <Statistic value={value} suffix={suffix} valueStyle={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)' }} />
          {extra ? <div style={{ marginTop: 8 }}>{extra}</div> : null}
        </div>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            background: accent.background,
            color: accent.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { data: rawDashboard, isLoading, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((response) => response.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const statsData = unwrapPayload(rawDashboard);
  const { stats, monthlyRevenue, ordersByStatus } = statsData || {};
  const aiCtrByPlacement = statsData?.aiCtrByPlacement || statsData?.analytics?.aiCtrByPlacement || [];
  const rfmSegments = statsData?.rfmSegments || statsData?.marketing?.rfmSegments || [];

  const growthRate = stats?.lastMonthRevenue
    ? (((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(1)
    : 0;

  const revenueChartConfig = useMemo(() => ({
    data: monthlyRevenue || [],
    xField: 'month',
    yField: 'revenue',
    autoFit: true,
    height: 300,
    smooth: true,
    lineStyle: { stroke: '#E85D04', lineWidth: 3 },
    areaStyle: { fill: 'l(270) 0:#FED7AA 1:#FFF7ED', fillOpacity: 0.9 },
    point: { size: 4, shape: 'circle', style: { fill: '#E85D04', stroke: '#fff', lineWidth: 2 } },
    axis: {
      y: {
        labelFormatter: (value) => `${Math.round(Number(value) / 1000000)}M`,
      },
    },
    tooltip: {
      items: [{ channel: 'y', formatter: (value) => formatPrice(value) }],
    },
  }), [monthlyRevenue]);

  const orderStatusChartConfig = useMemo(() => ({
    data: (ordersByStatus || []).map((item) => ({
      status: item._id,
      count: item.count,
    })),
    angleField: 'count',
    colorField: 'status',
    innerRadius: 0.62,
    autoFit: true,
    height: 300,
    legend: { color: { position: 'bottom' } },
    labels: [
      { text: 'status', style: { fontWeight: 700, fill: '#172033' } },
      { text: 'count', style: { fontSize: 12, fill: '#6B7280' } },
    ],
    scale: {
      color: {
        range: ['#F59E0B', '#3B82F6', '#14B8A6', '#16A34A', '#EF4444'],
      },
    },
  }), [ordersByStatus]);

  const ctrChartConfig = useMemo(() => ({
    data: aiCtrByPlacement,
    xField: 'placement',
    yField: 'ctr',
    autoFit: true,
    height: 300,
    columnStyle: { radius: [10, 10, 0, 0] },
    color: '#E85D04',
    label: {
      position: 'top',
      text: (item) => `${item.ctr}%`,
      style: { fill: '#7C2D12', fontWeight: 700 },
    },
    annotations: [
      {
        type: 'lineY',
        yField: 5,
        style: { stroke: '#DC2626', lineDash: [6, 4], lineWidth: 1.5 },
        text: { content: 'Mục tiêu BG-02: 5%', position: 'right' },
      },
    ],
  }), [aiCtrByPlacement]);

  const rfmChartConfig = useMemo(() => ({
    data: rfmSegments,
    angleField: 'users',
    colorField: 'segment',
    innerRadius: 0.58,
    autoFit: true,
    height: 300,
    legend: { color: { position: 'bottom' } },
    labels: [
      { text: 'segment', style: { fontWeight: 700, fill: '#172033' } },
      { text: 'users', style: { fontSize: 12, fill: '#6B7280' } },
    ],
    scale: {
      color: {
        range: ['#E85D04', '#FB923C', '#2563EB', '#14B8A6', '#8B5CF6', '#E11D48'],
      },
    },
  }), [rfmSegments]);

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const { data } = await adminAPI.getAIAnalysis();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      <div
        style={{
          borderRadius: 28,
          padding: 28,
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
          border: '1px solid var(--border-color)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 760 }}>
            <Tag color="gold" style={{ margin: 0, borderRadius: 999, paddingInline: 14, paddingBlock: 6, fontWeight: 700, marginBottom: 14 }}>
              AI Performance Control Room
            </Tag>
            <Title level={3} style={{ margin: 0, fontWeight: 900 }}>Dashboard AI & Kinh doanh</Title>
            <Paragraph style={{ margin: '8px 0 0', color: 'var(--text-muted)', maxWidth: 640 }}>
              Giao diện tập trung hơn vào bức tranh điều hành: doanh thu, hành vi mua hàng, phân tích AI và trạng thái dữ liệu theo thời gian thực.
            </Paragraph>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {isFetching ? (
              <Tag color="blue" style={{ margin: 0, borderRadius: 999, paddingInline: 14, paddingBlock: 6, fontWeight: 700 }}>
                Đang làm mới dữ liệu
              </Tag>
            ) : null}
            <Button type="primary" icon={<BulbOutlined />} loading={aiLoading} onClick={handleAIAnalysis}>
              Phân tích AI
            </Button>
          </div>
        </div>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Tổng doanh thu"
            value={formatPrice(stats?.totalRevenue)}
            icon={<DollarOutlined />}
            accent={{ background: '#FFF4E8', color: '#E85D04' }}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Đơn hàng"
            value={stats?.totalOrders || 0}
            icon={<ShoppingCartOutlined />}
            accent={{ background: '#EEF6FF', color: '#2563EB' }}
            extra={<Text type="secondary">AOV {formatPrice((stats?.totalRevenue || 0) / Math.max(stats?.totalOrders || 1, 1))}</Text>}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Khách hàng"
            value={stats?.totalUsers || 0}
            icon={<TeamOutlined />}
            accent={{ background: '#ECFDF5', color: '#15803D' }}
          />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <MetricCard
            title="Tăng trưởng tháng"
            value={Math.abs(growthRate)}
            suffix="%"
            icon={Number(growthRate) >= 0 ? <RiseOutlined /> : <FallOutlined />}
            accent={{ background: '#FEF3C7', color: '#D97706' }}
            extra={
              <Text style={{ color: Number(growthRate) >= 0 ? '#15803D' : '#DC2626', fontWeight: 700 }}>
                {Number(growthRate) >= 0 ? 'Tăng so với tháng trước' : 'Giảm so với tháng trước'}
              </Text>
            }
          />
        </Col>
      </Row>

      {aiAnalysis ? (
        <Card style={{ borderRadius: 24, border: '1px solid var(--border-color)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <BulbOutlined style={{ color: '#E85D04', fontSize: 20 }} />
            <Title level={5} style={{ margin: 0 }}>Nhận xét AI về tình hình kinh doanh</Title>
            <Tag color={aiAnalysis.source === 'openrouter' ? 'blue' : aiAnalysis.source === 'gemini' ? 'purple' : 'default'}>
              {aiAnalysis.source === 'openrouter' ? 'OpenRouter' : aiAnalysis.source === 'gemini' ? 'Gemini' : 'Fallback'}
            </Tag>
          </div>

          <Paragraph style={{ marginBottom: 18 }}>{aiAnalysis.summary}</Paragraph>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Alert
                type="success"
                showIcon
                message="Điểm mạnh"
                description={(aiAnalysis.strengths || []).join(' • ') || 'Chưa có nhận xét chi tiết.'}
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                type="warning"
                showIcon
                message="Cần cải thiện"
                description={(aiAnalysis.improvements || []).join(' • ') || 'Chưa có nhận xét chi tiết.'}
              />
            </Col>
          </Row>

          {aiAnalysis.recommendation ? (
            <Alert message={aiAnalysis.recommendation} type="info" showIcon style={{ marginTop: 16 }} />
          ) : null}
        </Card>
      ) : null}

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={14}>
          <Card
            style={{ borderRadius: 24, border: '1px solid var(--border-color)' }}
            title={<span style={{ fontWeight: 800 }}>Doanh thu 12 tháng</span>}
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined style={{ color: '#E85D04' }} />
                <Text type="secondary">Theo tháng</Text>
              </div>
            }
          >
            {monthlyRevenue?.length > 0 ? (
              <>
                <Area {...revenueChartConfig} />
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <Text type="secondary">Tháng này: <Text strong style={{ color: '#E85D04' }}>{formatPrice(stats?.thisMonthRevenue)}</Text></Text>
                  <Text type="secondary">Tháng trước: <Text strong>{formatPrice(stats?.lastMonthRevenue)}</Text></Text>
                </div>
              </>
            ) : (
              <InsightEmptyState compact title="Chưa có dữ liệu doanh thu" description="Biểu đồ sẽ hiện xu hướng 12 tháng khi endpoint dashboard trả đủ dữ liệu." />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            style={{ borderRadius: 24, border: '1px solid var(--border-color)' }}
            title={<span style={{ fontWeight: 800 }}>Trạng thái đơn hàng</span>}
            extra={<PieChartOutlined style={{ color: '#E85D04' }} />}
          >
            {ordersByStatus?.length > 0 ? (
              <Pie {...orderStatusChartConfig} />
            ) : (
              <InsightEmptyState compact title="Chưa có dữ liệu trạng thái đơn" description="Khi có đơn hàng, biểu đồ phân bổ trạng thái sẽ xuất hiện tại đây." />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} xl={12}>
          <Card
            style={{ borderRadius: 24, border: '1px solid var(--border-color)' }}
            title={<span style={{ fontWeight: 800 }}>AI CTR theo placement</span>}
            extra={<Tag color="red">Mục tiêu ≥ 5%</Tag>}
          >
            {aiCtrByPlacement.length > 0 ? (
              <Column {...ctrChartConfig} />
            ) : (
              <InsightEmptyState
                compact
                title="Backend chưa trả AI CTR theo placement"
                description="UI đã sẵn sàng cho Homepage, PDP Similar, Cart FBT và Search. Khi endpoint analytics bổ sung dữ liệu, chart sẽ hiển thị ngay."
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            style={{ borderRadius: 24, border: '1px solid var(--border-color)' }}
            title={<span style={{ fontWeight: 800 }}>RFM Segment</span>}
            extra={<FireOutlined style={{ color: '#E85D04' }} />}
          >
            {rfmSegments.length > 0 ? (
              <Pie {...rfmChartConfig} />
            ) : (
              <InsightEmptyState
                compact
                title="Chưa có dữ liệu phân khúc RFM"
                description="Khu vực này đang ở trạng thái chart-ready. Khi dashboard API trả danh sách segment và số user, giao diện sẽ render donut chart ngay."
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Alert
            showIcon
            type="info"
            message="Ghi chú triển khai"
            description="Do constraint hiện tại không thay đổi backend, dashboard đã được nâng cấp phần hiển thị và giữ empty state minh bạch cho AI CTR / RFM thay vì hiển thị số liệu giả."
          />
        </Col>
      </Row>
    </div>
  );
}
