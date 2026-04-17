'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  BulbOutlined,
  DollarOutlined,
  FallOutlined,
  FireOutlined,
  PieChartOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { adminAPI } from '@/lib/api';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const { Paragraph, Text, Title } = Typography;

const Area = dynamic(() => import('@ant-design/charts').then((m) => m.Area), { ssr: false });
const Column = dynamic(() => import('@ant-design/charts').then((m) => m.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/charts').then((m) => m.Pie), { ssr: false });

/* ─── helpers ─────────────────────────────────────────────────────────── */
function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

function formatShortPrice(value) {
  if (!value) return '0đ';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  return `${(value / 1_000).toFixed(0)}K`;
}

function unwrapPayload(payload) {
  if (payload?.data && payload?.success !== undefined) return payload.data;
  return payload;
}

/* ─── skeleton ─────────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div>
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Col key={i} xs={24} sm={12} xl={6}>
            <Card style={{ borderRadius: 20, border: '1px solid #eee' }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={14}><Card style={{ borderRadius: 20 }}><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
        <Col xs={24} xl={10}><Card style={{ borderRadius: 20 }}><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
      </Row>
    </div>
  );
}

/* ─── KPI card ─────────────────────────────────────────────────────────── */
function KpiCard({ title, value, sub, icon, accentColor, delta, deltaLabel, prefix }) {
  const isPositive = delta === null ? null : Number(delta) >= 0;

  return (
    <Card
      bodyStyle={{ padding: 0, overflow: 'hidden' }}
      style={{
        borderRadius: 20,
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      hoverable
    >
      {/* colored top bar */}
      <div style={{ height: 4, background: accentColor, borderRadius: '20px 20px 0 0' }} />

      <div style={{ padding: '20px 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
              {title}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.15, marginBottom: 10 }}>
              {prefix && <span style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', marginRight: 2 }}>{prefix}</span>}
              {value}
            </div>
            {sub && (
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>{sub}</div>
            )}
            {delta !== null && delta !== undefined && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: isPositive ? '#DCFCE7' : '#FEE2E2',
                color: isPositive ? '#15803D' : '#DC2626',
                borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700,
              }}>
                {isPositive ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
                {Math.abs(delta)}% {deltaLabel}
              </div>
            )}
          </div>

          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0, marginLeft: 12,
            background: `${accentColor}18`,
            color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── chart card ────────────────────────────────────────────────────────── */
function ChartCard({ title, extra, children, style }) {
  return (
    <Card
      style={{
        borderRadius: 20,
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        height: '100%',
        ...style,
      }}
      bodyStyle={{ padding: '0 0 20px' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 14px',
        borderBottom: '1px solid #F3F4F6',
      }}>
        <Title level={5} style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{title}</Title>
        {extra}
      </div>
      <div style={{ padding: '16px 20px 0' }}>
        {children}
      </div>
    </Card>
  );
}

/* ─── AI analysis panel ─────────────────────────────────────────────────── */
function AIAnalysisPanel({ analysis }) {
  return (
    <Card
      style={{
        borderRadius: 20,
        border: '1px solid #FED7AA',
        background: 'linear-gradient(135deg, #FFFBF5 0%, #FFF7ED 100%)',
        marginBottom: 24,
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #F97316, #EA580C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BulbOutlined style={{ color: '#fff', fontSize: 16 }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Nhận xét AI về tình hình kinh doanh</div>
          <Tag color={analysis.source === 'gemini' ? 'purple' : 'blue'} style={{ marginTop: 2, borderRadius: 999 }}>
            {analysis.source === 'gemini' ? 'Gemini AI' : analysis.source === 'openrouter' ? 'OpenRouter' : 'Fallback'}
          </Tag>
        </div>
      </div>

      <Paragraph style={{ marginBottom: 16, color: '#374151', lineHeight: 1.7 }}>{analysis.summary}</Paragraph>

      <Row gutter={[14, 14]}>
        <Col xs={24} md={12}>
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontWeight: 700, color: '#15803D', marginBottom: 8, fontSize: 13 }}>Điểm mạnh</div>
            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.65 }}>
              {(analysis.strengths || []).join(' • ') || 'Chưa có nhận xét chi tiết.'}
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontWeight: 700, color: '#D97706', marginBottom: 8, fontSize: 13 }}>Cần cải thiện</div>
            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.65 }}>
              {(analysis.improvements || []).join(' • ') || 'Chưa có nhận xét chi tiết.'}
            </div>
          </div>
        </Col>
      </Row>

      {analysis.recommendation && (
        <div style={{
          marginTop: 14, background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: 14, padding: '12px 16px',
          color: '#1D4ED8', fontSize: 13, lineHeight: 1.65,
        }}>
          <strong>Khuyến nghị:</strong> {analysis.recommendation}
        </div>
      )}
    </Card>
  );
}

/* ─── main page ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { data: rawDashboard, isLoading, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const statsData = unwrapPayload(rawDashboard);
  const { stats, monthlyRevenue, ordersByStatus } = statsData || {};
  const aiCtrByPlacement = statsData?.aiCtrByPlacement || statsData?.analytics?.aiCtrByPlacement || [];
  const rfmSegments = statsData?.rfmSegments || statsData?.marketing?.rfmSegments || [];

  const growthRate = stats?.lastMonthRevenue
    ? (((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(1)
    : null;

  const aov = (stats?.totalRevenue || 0) / Math.max(stats?.totalOrders || 1, 1);

  /* chart configs */
  const revenueChartConfig = useMemo(() => ({
    data: monthlyRevenue || [],
    xField: 'month',
    yField: 'revenue',
    autoFit: true,
    height: 260,
    smooth: true,
    lineStyle: { stroke: '#F97316', lineWidth: 2.5 },
    areaStyle: { fill: 'l(270) 0:#FED7AA40 1:#F9731620', fillOpacity: 1 },
    point: { size: 3.5, shape: 'circle', style: { fill: '#F97316', stroke: '#fff', lineWidth: 2 } },
    axis: {
      y: { labelFormatter: (v) => `${Math.round(Number(v) / 1_000_000)}M` },
      x: { tickLine: false },
    },
    tooltip: {
      items: [{ channel: 'y', formatter: (v) => formatPrice(v) }],
    },
  }), [monthlyRevenue]);

  const orderStatusChartConfig = useMemo(() => ({
    data: (ordersByStatus || []).map((item) => ({ status: item._id, count: item.count })),
    angleField: 'count',
    colorField: 'status',
    innerRadius: 0.65,
    autoFit: true,
    height: 260,
    legend: { color: { position: 'bottom', layout: { justifyContent: 'center' } } },
    label: false,
    scale: {
      color: { range: ['#F59E0B', '#3B82F6', '#14B8A6', '#16A34A', '#EF4444'] },
    },
    annotations: [
      {
        type: 'text',
        style: {
          text: `${(ordersByStatus || []).reduce((s, x) => s + x.count, 0)}`,
          x: '50%', y: '42%',
          textAlign: 'center',
          fontSize: 26,
          fontWeight: 800,
          fill: '#111827',
        },
      },
      {
        type: 'text',
        style: {
          text: 'Đơn hàng',
          x: '50%', y: '56%',
          textAlign: 'center',
          fontSize: 12,
          fill: '#9CA3AF',
        },
      },
    ],
  }), [ordersByStatus]);

  const ctrChartConfig = useMemo(() => ({
    data: aiCtrByPlacement,
    xField: 'placement',
    yField: 'ctr',
    autoFit: true,
    height: 240,
    columnStyle: { radius: [8, 8, 0, 0] },
    color: '#F97316',
    label: {
      position: 'top',
      text: (d) => `${d.ctr}%`,
      style: { fill: '#7C2D12', fontWeight: 700, fontSize: 12 },
    },
    annotations: [
      {
        type: 'lineY',
        yField: 5,
        style: { stroke: '#DC2626', lineDash: [6, 4], lineWidth: 1.5 },
        text: { content: 'Mục tiêu 5%', position: 'right', style: { fill: '#DC2626', fontSize: 11 } },
      },
    ],
    axis: { y: { labelFormatter: (v) => `${v}%` } },
  }), [aiCtrByPlacement]);

  const rfmChartConfig = useMemo(() => ({
    data: rfmSegments,
    angleField: 'users',
    colorField: 'segment',
    innerRadius: 0.62,
    autoFit: true,
    height: 240,
    legend: { color: { position: 'bottom', layout: { justifyContent: 'center' } } },
    label: false,
    scale: {
      color: { range: ['#F97316', '#FB923C', '#2563EB', '#14B8A6', '#8B5CF6', '#E11D48'] },
    },
  }), [rfmSegments]);

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const { data } = await adminAPI.getAIAnalysis();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div style={{ paddingBottom: 8 }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Title level={3} style={{ margin: 0, fontWeight: 900, fontSize: 22 }}>
              Dashboard
            </Title>
            {isFetching && (
              <Tag icon={<SyncOutlined spin />} color="processing" style={{ borderRadius: 999 }}>
                Đang cập nhật
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tổng quan kinh doanh & hiệu suất AI theo thời gian thực
          </Text>
        </div>

        <Button
          type="primary"
          icon={<BulbOutlined />}
          loading={aiLoading}
          onClick={handleAIAnalysis}
          style={{
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            border: 'none',
            borderRadius: 12,
            height: 40,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
          }}
        >
          Phân tích AI
        </Button>
      </div>

      {/* ── KPI cards ── */}
      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Tổng doanh thu"
            value={formatShortPrice(stats?.totalRevenue)}
            sub={formatPrice(stats?.totalRevenue)}
            icon={<DollarOutlined />}
            accentColor="#F97316"
            delta={null}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Đơn hàng"
            value={stats?.totalOrders?.toLocaleString('vi-VN') || '0'}
            sub={`AOV ${formatShortPrice(aov)}`}
            icon={<ShoppingCartOutlined />}
            accentColor="#3B82F6"
            delta={null}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Khách hàng"
            value={stats?.totalUsers?.toLocaleString('vi-VN') || '0'}
            sub="Tài khoản đã đăng ký"
            icon={<TeamOutlined />}
            accentColor="#10B981"
            delta={null}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Tăng trưởng tháng"
            value={growthRate !== null ? `${Math.abs(growthRate)}%` : '—'}
            sub={`Tháng này ${formatShortPrice(stats?.thisMonthRevenue)}`}
            icon={Number(growthRate) >= 0 ? <RiseOutlined /> : <FallOutlined />}
            accentColor="#F59E0B"
            delta={growthRate}
            deltaLabel="so tháng trước"
          />
        </Col>
      </Row>

      {/* ── AI analysis panel ── */}
      {aiAnalysis && <AIAnalysisPanel analysis={aiAnalysis} />}

      {/* ── Revenue + Order status ── */}
      <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
        <Col xs={24} xl={15}>
          <ChartCard
            title="Doanh thu 12 tháng"
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BarChartOutlined style={{ color: '#F97316' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Theo tháng</Text>
              </div>
            }
          >
            {monthlyRevenue?.length > 0 ? (
              <>
                <Area {...revenueChartConfig} />
                <div style={{
                  display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
                  marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
                    <Text style={{ fontSize: 12 }}>
                      Tháng này: <strong style={{ color: '#F97316' }}>{formatPrice(stats?.thisMonthRevenue)}</strong>
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D1D5DB' }} />
                    <Text style={{ fontSize: 12 }}>
                      Tháng trước: <strong>{formatPrice(stats?.lastMonthRevenue)}</strong>
                    </Text>
                  </div>
                </div>
              </>
            ) : (
              <InsightEmptyState compact title="Chưa có dữ liệu doanh thu" description="Biểu đồ sẽ hiện xu hướng 12 tháng khi có dữ liệu." />
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={9}>
          <ChartCard
            title="Trạng thái đơn hàng"
            extra={<PieChartOutlined style={{ color: '#F97316' }} />}
          >
            {ordersByStatus?.length > 0 ? (
              <Pie {...orderStatusChartConfig} />
            ) : (
              <InsightEmptyState compact title="Chưa có dữ liệu" description="Khi có đơn hàng, biểu đồ phân bổ trạng thái sẽ xuất hiện." />
            )}
          </ChartCard>
        </Col>
      </Row>

      {/* ── AI CTR + RFM ── */}
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={12}>
          <ChartCard
            title="AI CTR theo placement"
            extra={
              <Tag color="red" style={{ borderRadius: 999, fontWeight: 700 }}>
                Mục tiêu ≥ 5%
              </Tag>
            }
          >
            {aiCtrByPlacement.length > 0 ? (
              <Column {...ctrChartConfig} />
            ) : (
              <InsightEmptyState
                compact
                title="Chưa có dữ liệu AI CTR"
                description="UI sẵn sàng cho Homepage, PDP, Cart và Search. Biểu đồ hiển thị khi backend cung cấp dữ liệu."
              />
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={12}>
          <ChartCard
            title="Phân khúc RFM khách hàng"
            extra={<FireOutlined style={{ color: '#F97316', fontSize: 16 }} />}
          >
            {rfmSegments.length > 0 ? (
              <Pie {...rfmChartConfig} />
            ) : (
              <InsightEmptyState
                compact
                title="Chưa có dữ liệu phân khúc RFM"
                description="Donut chart sẽ render ngay khi dashboard API trả về danh sách segment."
              />
            )}
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
}
