# Smart Ecommerce AI System UI/UX Proposal

Date: 2026-04-15

## Notes

- This proposal follows the current frontend runtime in `apps/web`:
  - Next.js 15 App Router
  - React 18
  - Ant Design 5
  - TanStack Query v5
  - Zustand
- The live app is still JavaScript-first. To avoid introducing a TypeScript build requirement, the TypeScript samples below are stored in this document instead of being mounted directly into `apps/web`.
- The current as-built backend returns `success` plus feature-specific keys such as `products`, `stats`, `monthlyRevenue`, and `ordersByStatus`. The samples below are tolerant to the documented envelope `{ success, data, meta }` and the current implementation.
- The current `Product` model does not expose a dedicated `variants[]` field yet. PDP recommendations below therefore use a "variant-ready" UI pattern that can render from `variants` when available, and degrade to `specs`/stock chips without changing backend logic.

## UI/UX Roadmap

### Homepage

- Reframe the AI block as a personalized module, not a generic product grid:
  - Header copy: `Danh rieng cho ban`
  - Secondary line: explain why the list exists, for example recent category affinity or price preference
  - Add a subtle trust strip: `Cap nhat tu hanh vi gan day`, `AI ca nhan hoa`, `Nguon: model/fallback`
- Split the recommendation card into 3 information layers:
  - Product utility: image, price, rating, stock
  - Personal relevance: confidence score, short reason, reason chips
  - Action layer: `Xem nhanh`, `Them gio`, `Luu`
- Increase perceived intelligence with progressive disclosure:
  - Show one short reason by default
  - Expand into 2-3 chips on hover or tap
  - Show source badge when fallback is used instead of hiding it
- For SSR homepage strategy:
  - Keep hero and featured sections server-rendered
  - Hydrate only the personalized AI island after auth is known
  - Use skeleton cards with stable height to avoid layout shift

### PDP

- Rebuild the product info column into purchase decisions, not content blocks:
  - Price block
  - Variant block
  - Availability/shipping block
  - Sticky CTA block
- Variant layout recommendation:
  - Use segmented color swatches for `Color`
  - Use pill buttons for `Size`
  - Use a compact stock hint next to the active option, not a separate paragraph
  - Keep disabled variants visible but muted to preserve choice awareness
- If backend still has no `variants[]`:
  - Map `specs` into grouped option chips when keys are recognizable (`Mau`, `Kich thuoc`, `Chat lieu`)
  - Otherwise show `Thong so noi bat` in a two-column spec list
- Similar products block should become more AI-explanatory:
  - Title by intent: `San pham tuong tu ve phong cach`
  - Each card gets one reason chip such as `Cung tam gia`, `Cung danh muc`, `Duoc xem cung nhau`
  - Keep max 4 items to reduce comparison fatigue
- Maintain ISR for PDP:
  - Page shell and product content via ISR
  - Any personalized AI reason text can be client-hydrated without invalidating ISR

### Admin Dashboard

- Replace flat charts with an executive layout:
  - Row 1: KPI cards for revenue, orders, AI CTR, AI-attributed revenue
  - Row 2: AI CTR by placement and monthly revenue trend
  - Row 3: RFM segment distribution and insight panel
- Chart design direction:
  - Use a restrained warm palette to match the storefront brand
  - Prefer fewer data series with stronger labeling
  - Show `delta vs previous period` in headers instead of overloading tooltips
- AI performance chart:
  - `Column` chart for CTR by placement
  - Threshold annotation at 5% to tie back to BG-02
  - Separate chip for `fallback share` when recommendations degraded
- RFM visualization:
  - `Pie`/donut for segment distribution
  - Use business-readable labels: Champions, Loyal, At Risk, Lost
  - Clicking a segment should drive a right-side list or filter state
- Empty handling matters for admin credibility:
  - Empty chart state should explain whether data is unavailable, not computed, or below threshold volume

### Loading and Feedback

- Standardize AI loading states around 3 reusable patterns:
  - `AIRecommendationSkeleton` for card grids
  - `ChartCardSkeleton` for analytics
  - `InsightEmptyState` for no-data or fallback mode
- Each empty state should answer one of three questions:
  - No data yet
  - User action required
  - AI unavailable, using fallback
- Use optimistic micro-feedback:
  - Button loading only on the clicked card
  - Preserve previous results while refetching
  - Fade-in new recommendation set instead of hard swap

## Theme Configuration

Suggested `ConfigProvider` setup for a modern Vietnamese-first commerce UI:

```tsx
'use client';

import { App as AntApp, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

export const appTheme = {
  algorithm: [theme.defaultAlgorithm],
  token: {
    colorPrimary: '#E85D04',
    colorSuccess: '#15803D',
    colorWarning: '#D97706',
    colorInfo: '#2563EB',
    colorError: '#DC2626',
    colorTextBase: '#172033',
    colorBgBase: '#FFFDF8',
    colorBorder: '#E7D9C8',
    colorSplit: '#EFE4D7',
    borderRadius: 14,
    borderRadiusLG: 20,
    borderRadiusSM: 10,
    fontFamily: '"Be Vietnam Pro", "Segoe UI", sans-serif',
    boxShadowSecondary: '0 18px 40px rgba(131, 61, 7, 0.08)',
    controlHeight: 42,
  },
  components: {
    Layout: {
      bodyBg: '#FFFDF8',
      headerBg: 'rgba(255, 253, 248, 0.88)',
      siderBg: '#1D1A16',
    },
    Card: {
      borderRadiusLG: 20,
      boxShadowTertiary: '0 14px 32px rgba(131, 61, 7, 0.06)',
    },
    Button: {
      borderRadius: 999,
      primaryShadow: '0 10px 24px rgba(232, 93, 4, 0.24)',
    },
    Input: {
      borderRadius: 14,
      activeBorderColor: '#E85D04',
    },
    InputNumber: {
      borderRadius: 14,
      activeBorderColor: '#E85D04',
    },
    Tag: {
      borderRadiusSM: 999,
      defaultBg: '#FFF7ED',
      defaultColor: '#9A3412',
    },
    Skeleton: {
      gradientFromColor: 'rgba(245, 158, 11, 0.08)',
      gradientToColor: 'rgba(232, 93, 4, 0.18)',
    },
  },
} as const;

export function AppProviders({ children }: React.PropsWithChildren) {
  return (
    <ConfigProvider locale={viVN} theme={appTheme}>
      <AntApp
        message={{ maxCount: 3, duration: 2.2 }}
        notification={{ placement: 'topRight', duration: 3.2 }}
      >
        {children}
      </AntApp>
    </ConfigProvider>
  );
}
```

## Component Code

### `AIRecCard.tsx`

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Rate,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  EyeOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';

const { Paragraph, Text, Title } = Typography;

export type AIReason = {
  id: string;
  label: string;
};

export type AIRecProduct = {
  _id: string;
  name: string;
  category?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  numReviews?: number;
  stock?: number;
  ai?: {
    badge?: string;
    confidence?: number;
    reasonTitle?: string;
    reasons?: AIReason[];
    source?: 'model' | 'cache' | 'fallback';
  };
};

type AIRecCardProps = {
  product?: AIRecProduct;
  loading?: boolean;
  onAddToCart?: (product: AIRecProduct) => void;
  onQuickView?: (product: AIRecProduct) => void;
};

const formatVnd = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} d`;

const sourceColorMap: Record<NonNullable<AIRecProduct['ai']>['source'], string> = {
  model: 'gold',
  cache: 'blue',
  fallback: 'default',
};

export function AIRecCard({
  product,
  loading,
  onAddToCart,
  onQuickView,
}: AIRecCardProps) {
  if (loading) {
    return (
      <Card className="h-full rounded-[24px] border border-[var(--border-color)]">
        <Skeleton.Image active className="!h-[240px] !w-full !rounded-[18px]" />
        <Skeleton active paragraph={{ rows: 4 }} className="mt-5" />
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="h-full rounded-[24px] border border-dashed border-[var(--border-color)]">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="AI chua co du lieu phu hop cho o nay"
        />
      </Card>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const reasons = product.ai?.reasons?.slice(0, 3) ?? [];
  const confidence = product.ai?.confidence ?? 0;
  const reasonTitle = product.ai?.reasonTitle ?? 'AI danh gia san pham nay hop voi ban';
  const source = product.ai?.source ?? 'model';

  return (
    <Card
      hoverable
      className="group h-full overflow-hidden rounded-[24px] border border-[var(--border-color)] bg-white"
      bodyStyle={{ padding: 18 }}
      cover={
        <div className="relative overflow-hidden bg-[var(--brand-amber-soft)]">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <Tag color="gold" className="!m-0 !px-3 !py-1 !font-semibold">
              <RobotOutlined className="mr-1" />
              {product.ai?.badge ?? 'Danh rieng cho ban'}
            </Tag>
            {discount > 0 ? (
              <Tag color="red" className="!m-0 !px-3 !py-1 !font-semibold">
                -{discount}%
              </Tag>
            ) : null}
          </div>

          <div className="absolute right-4 top-4 z-10">
            <Tooltip title={source === 'fallback' ? 'Dang dung goi y du phong' : 'Nguon goi y AI'}>
              <Tag color={sourceColorMap[source]} className="!m-0 !px-3 !py-1 !font-medium">
                {source.toUpperCase()}
              </Tag>
            </Tooltip>
          </div>

          <Link href={`/products/${product._id}`} className="block">
            <div className="relative aspect-[4/4.4] overflow-hidden">
              <Image
                src={product.image || 'https://placehold.co/800x900/F7F3EE/9A8B7A?text=Product'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </Link>
        </div>
      }
    >
      <Space direction="vertical" size={10} className="w-full">
        <div className="flex items-center justify-between gap-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {product.category || 'San pham'}
          </Text>
          <Text className="rounded-full bg-[#FFF4E8] px-2.5 py-1 text-[12px] font-semibold text-[#9A3412]">
            <ThunderboltFilled className="mr-1" />
            {confidence}% phu hop
          </Text>
        </div>

        <Link href={`/products/${product._id}`}>
          <Title level={5} className="!mb-0 !text-[18px] !font-extrabold !leading-[1.4]">
            {product.name}
          </Title>
        </Link>

        <div className="rounded-2xl border border-[#F4E2CF] bg-[#FFF9F2] p-3">
          <div className="mb-2 flex items-center gap-2">
            <Avatar size={24} className="bg-[linear-gradient(135deg,#F97316,#FB923C)]">
              <RobotOutlined />
            </Avatar>
            <Text className="text-[13px] font-semibold text-[#7C2D12]">{reasonTitle}</Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {reasons.length > 0 ? (
              reasons.map((reason) => (
                <Tag key={reason.id} className="!m-0 !rounded-full !px-3 !py-1">
                  {reason.label}
                </Tag>
              ))
            ) : (
              <Text type="secondary">Dang cap nhat ly do goi y</Text>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Rate disabled allowHalf value={product.rating || 0} className="!text-[14px]" />
          <Text type="secondary">({product.numReviews || 0})</Text>
        </div>

        <div className="flex items-end justify-between gap-4 pt-1">
          <div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="text-[13px] text-[var(--text-muted)] line-through">
                {formatVnd(product.originalPrice)}
              </div>
            ) : null}
            <div className="text-[24px] font-extrabold leading-none text-[var(--brand-teal)]">
              {formatVnd(product.price)}
            </div>
          </div>

          <Text className={product.stock === 0 ? 'text-red-600' : 'text-[var(--text-muted)]'}>
            {product.stock === 0 ? 'Het hang' : `Con ${product.stock ?? '-'} san pham`}
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            icon={<EyeOutlined />}
            size="large"
            onClick={() => onQuickView?.(product)}
          >
            Xem nhanh
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="large"
            disabled={product.stock === 0}
            onClick={() => onAddToCart?.(product)}
          >
            Them gio
          </Button>
        </div>

        {source === 'fallback' ? (
          <Paragraph className="!mb-0 rounded-2xl border border-dashed border-[#E7D9C8] bg-[#FFFCF7] px-3 py-2 text-[12px] text-[var(--text-muted)]">
            He thong dang hien thi goi y du phong de giu trai nghiem lien tuc.
          </Paragraph>
        ) : null}
      </Space>
    </Card>
  );
}
```

### `AdminAIDashboardPage.tsx`

```tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowUpOutlined,
  FireOutlined,
  PieChartOutlined,
  RiseOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { adminAPI } from '@/lib/api';

const { Paragraph, Text, Title } = Typography;

const Area = dynamic(() => import('@ant-design/charts').then((m) => m.Area), { ssr: false });
const Column = dynamic(() => import('@ant-design/charts').then((m) => m.Column), { ssr: false });
const Pie = dynamic(() => import('@ant-design/charts').then((m) => m.Pie), { ssr: false });

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  meta?: { requestId?: string; source?: string };
};

type DashboardPayload = {
  stats?: {
    totalRevenue?: number;
    thisMonthRevenue?: number;
    totalOrders?: number;
    aiCtr?: number;
    aiRevenue?: number;
  };
  monthlyRevenue?: Array<{ month: string; revenue: number }>;
  analytics?: {
    aiCtrByPlacement?: Array<{ placement: string; ctr: number; impressions?: number }>;
  };
  marketing?: {
    rfmSegments?: Array<{ segment: string; users: number }>;
  };
};

const formatVnd = (value = 0) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} d`;

function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in (payload as Record<string, unknown>) &&
    'data' in (payload as Record<string, unknown>)
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

function ChartSkeleton() {
  return (
    <Card className="rounded-[24px]">
      <Skeleton active title paragraph={{ rows: 8 }} />
    </Card>
  );
}

export default function AdminAIDashboardPage() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-dashboard-pro'],
    queryFn: async () => {
      const response = await adminAPI.getDashboard();
      return unwrapEnvelope<DashboardPayload>(response.data);
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const stats = data?.stats ?? {};
  const revenueTrend = data?.monthlyRevenue ?? [];
  const ctrByPlacement = data?.analytics?.aiCtrByPlacement ?? [];
  const rfmSegments = data?.marketing?.rfmSegments ?? [];

  const ctrChartConfig = useMemo(
    () => ({
      data: ctrByPlacement,
      xField: 'placement',
      yField: 'ctr',
      height: 280,
      columnStyle: { radius: [10, 10, 0, 0], fill: 'url(#ctr-gradient)' },
      label: {
        position: 'top',
        text: (d: { ctr: number }) => `${d.ctr.toFixed(1)}%`,
        style: { fill: '#7C2D12', fontWeight: 700 },
      },
      axis: {
        x: { labelAutoRotate: false },
        y: {
          title: 'CTR (%)',
          gridLineDash: [4, 4],
        },
      },
      annotations: [
        {
          type: 'lineY',
          yField: 5,
          style: { stroke: '#DC2626', lineDash: [6, 4], lineWidth: 1.5 },
          text: { content: 'Muc tieu BG-02: 5%', position: 'right' },
        },
      ],
    }),
    [ctrByPlacement]
  );

  const revenueChartConfig = useMemo(
    () => ({
      data: revenueTrend,
      xField: 'month',
      yField: 'revenue',
      height: 280,
      smooth: true,
      areaStyle: { fill: 'l(270) 0:#FED7AA 1:#FFF7ED' },
      lineStyle: { stroke: '#E85D04', lineWidth: 3 },
      point: { size: 4, shape: 'circle', style: { fill: '#E85D04' } },
      axis: {
        y: {
          labelFormatter: (value: number) => `${Math.round(Number(value) / 1_000_000)}M`,
        },
      },
      tooltip: {
        items: [{ channel: 'y', formatter: (value: number) => formatVnd(value) }],
      },
    }),
    [revenueTrend]
  );

  const rfmChartConfig = useMemo(
    () => ({
      data: rfmSegments,
      angleField: 'users',
      colorField: 'segment',
      innerRadius: 0.62,
      height: 300,
      legend: { color: { position: 'bottom', rowPadding: 6 } },
      labels: [
        {
          text: 'segment',
          style: { fontWeight: 700, fill: '#172033' },
        },
        {
          text: (d: { users: number }) => `${d.users}`,
          style: { fontSize: 12, fill: '#6B7280' },
        },
      ],
      tooltip: {
        items: [
          {
            channel: 'y',
            formatter: (value: number) =>
              `${value} nguoi dung`,
          },
        ],
      },
      scale: {
        color: {
          range: ['#E85D04', '#FB923C', '#2563EB', '#14B8A6', '#8B5CF6', '#E11D48'],
        },
      },
    }),
    [rfmSegments]
  );

  if (isLoading) {
    return (
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <ChartSkeleton />
        </Col>
        <Col xs={24} xl={12}>
          <ChartSkeleton />
        </Col>
        <Col xs={24} xl={12}>
          <ChartSkeleton />
        </Col>
      </Row>
    );
  }

  return (
    <Space direction="vertical" size={20} className="w-full">
      <div className="rounded-[28px] border border-[var(--border-color)] bg-[linear-gradient(135deg,#FFF7ED,#FFFFFF)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Tag color="gold" className="!mb-3 !rounded-full !px-4 !py-1">
              <RobotOutlined className="mr-1" />
              AI Performance Control Room
            </Tag>
            <Title level={2} className="!mb-1 !mt-0">
              Dashboard AI va hanh vi khach hang
            </Title>
            <Paragraph className="!mb-0 !max-w-3xl text-[var(--text-muted)]">
              Theo doi hieu qua goi y AI, doanh thu va phan bo RFM trong mot bo cuc
              goc nhin kinh doanh hon.
            </Paragraph>
          </div>

          {isFetching ? (
            <Tag color="blue" className="!rounded-full !px-4 !py-1">
              Dang lam moi du lieu
            </Tag>
          ) : null}
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="rounded-[24px]">
            <Statistic
              title="Tong doanh thu"
              value={formatVnd(stats.totalRevenue)}
              prefix={<RiseOutlined className="text-[var(--brand-teal)]" />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="rounded-[24px]">
            <Statistic title="Don hang" value={stats.totalOrders || 0} prefix={<FireOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="rounded-[24px]">
            <Statistic
              title="AI CTR"
              value={stats.aiCtr || 0}
              precision={1}
              suffix="%"
              prefix={<ArrowUpOutlined className="text-green-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="rounded-[24px]">
            <Statistic
              title="AI-attributed Revenue"
              value={formatVnd(stats.aiRevenue)}
              prefix={<PieChartOutlined className="text-amber-600" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={14}>
          <Card
            title="Doanh thu 12 thang"
            extra={<Text type="secondary">Theo xu huong de doc tren man hinh admin</Text>}
            className="rounded-[24px]"
          >
            {revenueTrend.length > 0 ? <Area {...revenueChartConfig} /> : <Empty description="Chua co du lieu doanh thu" />}
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            title="AI CTR theo placement"
            extra={<Tag color="red">Muc tieu >= 5%</Tag>}
            className="rounded-[24px]"
          >
            {ctrByPlacement.length > 0 ? (
              <Column {...ctrChartConfig} />
            ) : (
              <Empty description="Endpoint chua tra ve AI CTR theo placement" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={10}>
          <Card title="RFM Segment" className="rounded-[24px]">
            {rfmSegments.length > 0 ? (
              <Pie {...rfmChartConfig} />
            ) : (
              <Empty description="Chua co phan bo segment tu endpoint dashboard" />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card title="Insight xu ly" className="rounded-[24px]">
            <Space direction="vertical" size={14} className="w-full">
              <Alert
                showIcon
                type="info"
                message="Neu chart CTR rong, giu nguyen layout nhung hien ro do la chua co du lieu thay vi de trang."
              />
              <Alert
                showIcon
                type="success"
                message="RFM nen duoc dung lam filter phia sau bieu do de admin click vao mot segment va xem tap user tuong ung."
              />
              <Alert
                showIcon
                type="warning"
                message="Khi AI fallback tang, hien them tag trong header dashboard de tranh nham lan giua giam CTR va loi he thong."
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
```

## UX Tricks

1. Explain one reason, not the whole model.
   - Show a single human-readable cause such as `Vi ban vua xem do cong nghe tam gia 1-2 trieu`.
   - This increases trust more than showing raw scores.

2. Preserve continuity during refetch.
   - Keep the previous AI cards visible.
   - Overlay a subtle `Dang cap nhat cho ban` shimmer instead of blanking the block.
   - Users interpret this as a living assistant, not a reloading page.

3. Use contextual memory in micro-copy.
   - Examples:
     - Homepage: `Dua tren muc gia ban hay xem`
     - PDP: `Khach mua san pham nay cung xem`
     - Cart: `Ghep cung gio hang nay`
   - The same recommendation engine feels smarter when the copy reflects page intent.
