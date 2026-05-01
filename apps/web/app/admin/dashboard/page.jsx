'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Row,
  Segmented,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  CalendarOutlined,
  DollarOutlined,
  FallOutlined,
  FireOutlined,
  HeartFilled,
  PieChartOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { adminAPI } from '@/lib/api';
import InsightEmptyState from '@/components/feedback/InsightEmptyState';

const { Paragraph, Text, Title } = Typography;

const Line = dynamic(() => import('@ant-design/charts').then((m) => m.Line), { ssr: false });
const Column = dynamic(() => import('@ant-design/charts').then((m) => m.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/charts').then((m) => m.Pie), { ssr: false });
const Bar = dynamic(() => import('@ant-design/charts').then((m) => m.Bar), { ssr: false });

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

/* ─── CSS word cloud (replaces @ant-design/charts WordCloud) ────────────── */
const CLOUD_PALETTE = [
  { color: '#F97316', bg: '#FFF7ED' },
  { color: '#3B82F6', bg: '#EFF6FF' },
  { color: '#10B981', bg: '#ECFDF5' },
  { color: '#8B5CF6', bg: '#F5F3FF' },
  { color: '#EF4444', bg: '#FEF2F2' },
  { color: '#06B6D4', bg: '#ECFEFF' },
  { color: '#F59E0B', bg: '#FFFBEB' },
  { color: '#EC4899', bg: '#FDF2F8' },
  { color: '#14B8A6', bg: '#F0FDFA' },
  { color: '#6366F1', bg: '#EEF2FF' },
];

// Shuffle deterministically so layout varies without being fully sorted by size
function interleave(arr) {
  const result = [];
  const mid = Math.ceil(arr.length / 2);
  for (let i = 0; i < mid; i++) {
    result.push(arr[i]);
    if (arr[mid + i]) result.push(arr[mid + i]);
  }
  return result;
}

function CssWordCloud({ keywords }) {
  const top10 = keywords.slice(0, 10);
  const maxW = top10[0]?.weight || 1;
  const minW = top10[top10.length - 1]?.weight || 0;
  const range = maxW - minW || 1;
  const items = interleave(top10);

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap',
      gap: '10px 12px',
      padding: '20px 12px 16px',
      alignItems: 'center', alignContent: 'center',
      justifyContent: 'center', minHeight: 230,
    }}>
      {items.map(({ word, weight }, i) => {
        const norm = (weight - minW) / range;
        const fontSize = Math.round(14 + norm * 34);
        const { color, bg } = CLOUD_PALETTE[i % CLOUD_PALETTE.length];
        const isTop = norm > 0.75;
        const isMid = norm > 0.35;
        return (
          <span
            key={word + i}
            title={`${word} · ${weight} điểm`}
            style={{
              fontSize,
              color,
              background: bg,
              fontWeight: isTop ? 800 : isMid ? 700 : 600,
              lineHeight: 1,
              cursor: 'default',
              letterSpacing: isTop ? '-0.03em' : '-0.01em',
              padding: isTop ? '6px 14px' : isMid ? '5px 11px' : '4px 9px',
              borderRadius: 999,
              border: `1.5px solid ${color}22`,
              boxShadow: isTop ? `0 4px 16px ${color}25` : 'none',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              display: 'inline-block',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = isTop ? `0 4px 16px ${color}25` : 'none';
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
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

/* ─── granularity labels ─────────────────────────────────────────────────── */
const GRANULARITY_OPTIONS = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
  { label: 'Quý', value: 'quarter' },
];

/* ─── main page ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [granularity, setGranularity] = useState('month');

  const { data: rawDashboard, isLoading, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: rawRevenue, isFetching: revFetching } = useQuery({
    queryKey: ['admin-revenue', granularity],
    queryFn: () => adminAPI.getEnhancedRevenue(granularity).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: rawInventory } = useQuery({
    queryKey: ['admin-inventory-trends'],
    queryFn: () => adminAPI.getInventoryTrends().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawWishlist } = useQuery({
    queryKey: ['admin-wishlist-stats'],
    queryFn: () => adminAPI.getWishlistStats().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const statsData = unwrapPayload(rawDashboard);
  const { stats, ordersByStatus } = statsData || {};
  const aiCtrByPlacement = statsData?.aiCtrByPlacement || statsData?.analytics?.aiCtrByPlacement || [];
  const rfmSegments = statsData?.rfmSegments || statsData?.marketing?.rfmSegments || [];

  const revenueData = unwrapPayload(rawRevenue);
  const currentRevenue = revenueData?.current || [];
  const comparisonRevenue = revenueData?.comparison || [];
  const forecastRevenue = revenueData?.forecast || [];
  const revenueAnnotations = revenueData?.annotations || [];

  const inventoryData = unwrapPayload(rawInventory);
  const stockoutRisk = inventoryData?.stockoutRisk || [];
  const trendingKeywords = inventoryData?.trendingKeywords || [];

  const wishlistData = unwrapPayload(rawWishlist);
  const wishlistStats = wishlistData?.wishlistStats || [];

  const growthRate = stats?.lastMonthRevenue
    ? (((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(1)
    : null;

  const aov = (stats?.totalRevenue || 0) / Math.max(stats?.totalOrders || 1, 1);

  /* ── multi-series revenue line chart ── */
  const revenueLineData = useMemo(() => {
    const rows = [];
    currentRevenue.forEach((d) => rows.push({ label: d.label, revenue: d.revenue, series: 'Năm nay' }));
    comparisonRevenue.forEach((d) => rows.push({ label: d.label, revenue: d.revenue, series: 'Năm trước' }));
    forecastRevenue.forEach((d) => rows.push({ label: d.label, revenue: d.revenue, series: 'Dự báo AI' }));
    return rows;
  }, [currentRevenue, comparisonRevenue, forecastRevenue]);

  const revenueLineConfig = useMemo(() => ({
    data: revenueLineData,
    xField: 'label',
    yField: 'revenue',
    seriesField: 'series',
    smooth: true,
    autoFit: true,
    height: 260,
    scale: {
      color: {
        domain: ['Năm nay', 'Năm trước', 'Dự báo AI'],
        range: ['#F97316', '#9CA3AF', '#FB923C'],
      },
    },
    style: (datum) => {
      if (datum.series === 'Năm trước') return { lineDash: [5, 4], opacity: 0.6, lineWidth: 1.8 };
      if (datum.series === 'Dự báo AI') return { lineDash: [6, 3], lineWidth: 2, opacity: 0.85 };
      return { lineWidth: 2.5 };
    },
    point: {
      size: 3,
      style: (datum) => ({
        fill: datum.series === 'Năm nay' ? '#F97316' : datum.series === 'Dự báo AI' ? '#FB923C' : '#9CA3AF',
        stroke: '#fff',
        lineWidth: 1.5,
      }),
    },
    axis: {
      y: { labelFormatter: (v) => `${Math.round(Number(v) / 1_000_000)}M` },
      x: { tickLine: false },
    },
    legend: { color: { position: 'bottom', layout: { justifyContent: 'center' } } },
    tooltip: {
      items: [{ channel: 'y', formatter: (v) => formatPrice(v) }],
    },
  }), [revenueLineData]);

  /* ── order status donut ── */
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

  /* ── AI CTR column ── */
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

  /* ── RFM donut ── */
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

  /* ── wishlist bar chart ── */
  const wishlistBarConfig = useMemo(() => ({
    data: [...wishlistStats].reverse(), // horizontal bar renders bottom-to-top, reverse for desc order
    yField: 'name',
    xField: 'wishlistCount',
    autoFit: true,
    height: 340,
    colorField: 'category',
    label: {
      text: (d) => `${d.wishlistCount} lượt`,
      position: 'right',
      style: { fill: '#374151', fontWeight: 700, fontSize: 12 },
    },
    axis: {
      y: {
        labelFormatter: (v) => (v.length > 24 ? `${v.slice(0, 24)}…` : v),
      },
      x: { title: 'Số lượt yêu thích', titleFill: '#9CA3AF', grid: true },
    },
    scale: {
      color: { range: ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'] },
    },
    tooltip: {
      items: [
        { field: 'name', name: 'Sản phẩm' },
        { field: 'wishlistCount', name: 'Lượt yêu thích' },
        { field: 'category', name: 'Danh mục' },
        { field: 'price', name: 'Giá', formatter: (v) => formatPrice(v) },
      ],
    },
  }), [wishlistStats]);

  /* ── stockout table ── */
  const stockoutColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v) => <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (v) => <Tag style={{ borderRadius: 999, fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center',
      render: (v) => <strong style={{ color: v <= 5 ? '#DC2626' : '#D97706' }}>{v}</strong>,
    },
    {
      title: 'Bán/ngày',
      dataIndex: 'dailyVelocity',
      key: 'dailyVelocity',
      width: 90,
      align: 'center',
      render: (v) => <span style={{ fontSize: 13 }}>{v}</span>,
    },
    {
      title: 'Còn lại',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      width: 90,
      align: 'center',
      render: (v) => (
        <Tag color={v < 7 ? 'red' : v < 14 ? 'orange' : 'gold'} style={{ borderRadius: 999, fontWeight: 700 }}>
          {v} ngày
        </Tag>
      ),
    },
  ];

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

      {/* ── Enhanced Revenue Chart + Order status ── */}
      <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
        <Col xs={24} xl={15}>
          <ChartCard
            title="Phân tích doanh thu"
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {revFetching && <SyncOutlined spin style={{ color: '#F97316', fontSize: 13 }} />}
                <Segmented
                  size="small"
                  options={GRANULARITY_OPTIONS}
                  value={granularity}
                  onChange={setGranularity}
                  style={{ borderRadius: 8 }}
                />
              </div>
            }
          >
            {revenueLineData.length > 0 ? (
              <>
                <Line {...revenueLineConfig} />

                {/* Legend strip */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
                  marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#F97316', borderRadius: 2 }} />
                    <Text style={{ fontSize: 12 }}>
                      Năm nay: <strong style={{ color: '#F97316' }}>{formatPrice(stats?.thisMonthRevenue)}</strong>
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 3, background: '#9CA3AF', borderRadius: 2, opacity: 0.7 }} />
                    <Text style={{ fontSize: 12 }}>Cùng kỳ năm trước</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#FB923C" strokeWidth="2" strokeDasharray="5,3" /></svg>
                    <Text style={{ fontSize: 12 }}>Dự báo AI (hồi quy tuyến tính)</Text>
                  </div>
                </div>

                {/* Event annotations */}
                {revenueAnnotations.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {revenueAnnotations.map((a, i) => (
                      <Tag
                        key={i}
                        icon={<CalendarOutlined />}
                        style={{ borderRadius: 999, fontSize: 11, border: '1px solid #FED7AA', color: '#92400E', background: '#FFF7ED' }}
                      >
                        {a.label}: {a.text}
                      </Tag>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <InsightEmptyState compact title="Chưa có dữ liệu doanh thu" description="Biểu đồ sẽ hiện xu hướng khi có dữ liệu." />
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
      <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
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

      {/* ── Top Wishlisted Products ── */}
      <Row gutter={[18, 18]} style={{ marginBottom: 18 }}>
        <Col xs={24}>
          <ChartCard
            title="Top sản phẩm được yêu thích nhất"
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <HeartFilled style={{ color: '#DC2626', fontSize: 14 }} />
                <Tooltip title="Dữ liệu thực từ danh sách yêu thích của khách hàng">
                  <Tag style={{ borderRadius: 999, fontSize: 11, cursor: 'default' }}>
                    {wishlistStats.length > 0
                      ? `${wishlistStats.reduce((s, p) => s + p.wishlistCount, 0)} lượt tổng`
                      : 'Dữ liệu thực'}
                  </Tag>
                </Tooltip>
              </div>
            }
          >
            {wishlistStats.length > 0 ? (
              <Bar {...wishlistBarConfig} />
            ) : (
              <InsightEmptyState
                compact
                title="Chưa có sản phẩm nào được yêu thích"
                description="Biểu đồ hiển thị top 10 sản phẩm được khách hàng thêm vào wishlist nhiều nhất."
              />
            )}
          </ChartCard>
        </Col>
      </Row>

      {/* ── Hot Trend + Inventory Risk ── */}
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={12}>
          <ChartCard
            title="Xu hướng tìm kiếm (30 ngày)"
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FireOutlined style={{ color: '#F97316' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Từ khoá hot</Text>
              </div>
            }
          >
            {trendingKeywords.length > 0 ? (
              <CssWordCloud keywords={trendingKeywords} />
            ) : (
              <InsightEmptyState
                compact
                title="Chưa có dữ liệu xu hướng"
                description="Word cloud sẽ hiện khi có dữ liệu hành vi người dùng trong 30 ngày qua."
              />
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={12}>
          <ChartCard
            title="Cảnh báo sắp hết hàng (< 30 ngày)"
            extra={
              <Tag
                icon={<WarningOutlined />}
                color={stockoutRisk.some((p) => p.daysLeft < 7) ? 'red' : 'orange'}
                style={{ borderRadius: 999, fontWeight: 700 }}
              >
                {stockoutRisk.length} sản phẩm
              </Tag>
            }
          >
            {stockoutRisk.length > 0 ? (
              <Table
                dataSource={stockoutRisk}
                columns={stockoutColumns}
                rowKey={(r) => String(r.productId)}
                size="small"
                pagination={false}
                scroll={{ y: 230 }}
                rowClassName={(r) =>
                  r.daysLeft < 7 ? 'stockout-critical' : r.daysLeft < 14 ? 'stockout-warning' : ''
                }
                onRow={(r) => ({
                  style: {
                    background: r.daysLeft < 7 ? '#FEF2F2' : r.daysLeft < 14 ? '#FFFBEB' : undefined,
                  },
                })}
              />
            ) : (
              <InsightEmptyState
                compact
                title="Không có sản phẩm sắp hết hàng"
                description="Tất cả sản phẩm đang có tồn kho ổn định trong 30 ngày tới."
              />
            )}
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
}
