---
description: Next.js 15 frontend specialist for the SMART-ECOMMERCE web application. Knows the SSR/ISR/CSR rendering strategy for each page type, TanStack Query hook patterns, Zustand store design, and shadcn/ui component composition.
---

# Next.js Frontend Expert

## When to Use This Skill
- "Build the `[page-name]` page"
- "Create a component for `[feature]`"
- "Add a TanStack Query hook for `[endpoint]`"
- Any task writing to `apps/web/`

## Context to Read First (in order)
1. `docs/MODULE_STRUCTURE.md` §1 (web/ directory structure, page types, rendering strategy table)
2. `docs/API_SPECIFICATIONS.md` §3.x (relevant module API contract for the page being built)
3. `apps/web/lib/api/client.ts` (typed axios client setup — once scaffolded)
4. `apps/web/app/layout.tsx` (root layout patterns — once scaffolded)

---

## Rendering Strategy Decision Table (Non-Negotiable)

| Page | Strategy | Config | Reason |
|---|---|---|---|
| `/` (Homepage) | **SSR** | `dynamic = 'force-dynamic'` | Per-user AI recommendations require per-request rendering |
| `/products/[slug]` (Product Detail) | **ISR** | `revalidate = 300` | Product data changes every 5 min max; SEO-critical |
| `/category/[slug]` | **SSG + ISR** | `revalidate = 3600` | Category data changes rarely; SEO-critical |
| `/search` | **SSR** | `dynamic = 'force-dynamic'` | Dynamic query params; cannot be statically generated |
| `/cart` | **CSR** | `'use client'` | Pure client state; no SEO needed |
| `/checkout` | **CSR** | `'use client'` | Form state; no SEO needed |
| `/account/*` | **CSR** | `'use client'` | Auth-gated; no SEO needed |
| `/admin/*` (all) | **CSR** | `'use client'` | Staff-only; no SEO; real-time data |

---

## Page Component Patterns

### SSR Page (Homepage)
```tsx
// apps/web/app/(shop)/page.tsx
// No 'use client' — this is a React Server Component
import { Suspense } from 'react';
import { ProductGrid } from '@/components/features/catalog/ProductGrid';
import { HeroSection } from '@/components/features/home/HeroSection';

// Force SSR — necessary because AI recommendations are user-specific
export const dynamic = 'force-dynamic';

// generateMetadata for SEO
export async function generateMetadata() {
  return {
    title: 'SmartShop — AI-Powered Shopping',
    description: 'Discover products tailored to your preferences',
    openGraph: { /* ... */ },
  };
}

export default async function HomePage() {
  // Server-side data fetch — no useEffect, no useState
  // Authentication state from server session or cookie
  
  return (
    <main>
      <HeroSection />
      <Suspense fallback={<ProductGrid.Skeleton />}>
        <RecommendedProducts placement="homepage" n={12} />
      </Suspense>
    </main>
  );
}
```

### ISR Page (Product Detail)
```tsx
// apps/web/app/(shop)/products/[slug]/page.tsx
import { notFound } from 'next/navigation';

// Revalidate at most every 5 minutes
export const revalidate = 300;

// Pre-generate top N product pages at build time
export async function generateStaticParams() {
  // Fetch top 100 products for static generation
  const products = await fetchTopProducts(100);
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} | SmartShop`,
    description: product.description.slice(0, 160),
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div>
      <ProductGallery images={product.images} />
      <ProductInfo product={product} />
      <VariantSelector variants={product.variants} />
      {/* Client component for add-to-cart interaction */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```

### CSR Page (Cart)
```tsx
// apps/web/app/(shop)/cart/page.tsx
'use client';

import { useCartQuery } from '@/lib/api/cart/useCartQuery';
import { useCartStore } from '@/lib/stores/cart.store';

export default function CartPage() {
  // TanStack Query for server state (actual cart data from API)
  const { data: cart, isLoading, error } = useCartQuery();
  
  // Zustand for UI state only (drawer open/close, animation state)
  const { isDrawerOpen } = useCartStore();

  if (isLoading) return <CartSkeleton />;
  if (error) return <CartError />;

  return (
    <div>
      {cart?.items.map(item => <CartItem key={item.variantSku} item={item} />)}
      <CartSummary subtotal={cart?.subtotal} total={cart?.total} />
    </div>
  );
}
```

---

## TanStack Query Hook Patterns

**Location:** `apps/web/lib/api/{module}/use{Resource}{Action}.ts`

### Query Hook (GET)
```typescript
// apps/web/lib/api/catalog/useProductQuery.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Product } from '@lib/types/product.type';

// Query key factory — centralized for cache invalidation
export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
  list: (filters: Record<string, unknown>) => ['products', 'list', filters] as const,
};

export function useProductQuery(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      // API client extracts the 'data' field from { success, data, meta } envelope
      const response = await apiClient.get<Product>(`/products/${productId}`);
      return response.data;  // already unwrapped by interceptor
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes — matches ISR revalidate=300
    enabled: !!productId,
  });
}
```

### Mutation Hook (POST/PATCH)
```typescript
// apps/web/lib/api/cart/useAddToCartMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { cartKeys } from './useCartQuery';

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; variantSku: string; qty: number }) => {
      const response = await apiClient.put('/cart/items', payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cart cache after successful mutation
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error: ApiError) => {
      // Handle PRODUCT_OUT_OF_STOCK error
      if (error.code === 'PRODUCT_OUT_OF_STOCK') {
        // Show toast with stock info from error.details
      }
    },
  });
}
```

### Paginated Query Hook
```typescript
export function useProductListQuery(filters: ProductQueryDto) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
        params: filters,
      });
      return response;  // includes { data, meta: { total, page, limit, totalPages } }
    },
    placeholderData: keepPreviousData,  // smooth pagination transitions
  });
}
```

---

## Axios Client Setup

```typescript
// apps/web/lib/api/client.ts
import axios from 'axios';
import type { ApiResponse, PaginatedResponse } from '@lib/types/api-response.type';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  withCredentials: true,  // include HttpOnly cookies for refresh token
  timeout: 10000,
});

// Response interceptor: unwrap { success, data, meta } envelope
apiClient.interceptors.response.use(
  (response) => {
    // Return the unwrapped data field
    return response.data.data;
  },
  async (error) => {
    // Handle token expiry
    if (error.response?.status === 401) {
      const errorCode = error.response.data.error.code;
      if (errorCode === 'AUTH_TOKEN_EXPIRED') {
        // Try refresh
        try {
          await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
          return apiClient.request(error.config);  // retry original request
        } catch {
          // Refresh failed — redirect to login
          window.location.href = '/auth/login';
        }
      }
    }
    // Re-throw with the error code for mutation error handlers
    const apiError = {
      code: error.response?.data?.error?.code,
      message: error.response?.data?.error?.message,
      details: error.response?.data?.error?.details,
      status: error.response?.status,
    };
    return Promise.reject(apiError);
  },
);
```

---

## Zustand Store Design

**Rule:** Zustand is for **UI state only** (modal open/close, drawer state, auth step). Server data lives in TanStack Query cache.

```typescript
// apps/web/lib/stores/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartUIState {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

// Zustand for UI state — NOT for cart item data (that's in TanStack Query)
export const useCartStore = create<CartUIState>((set) => ({
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));

// Auth UI state (multi-step modal)
interface AuthModalState {
  isOpen: boolean;
  step: 'login' | 'register' | 'forgot-password' | '2fa';
  open: (step?: AuthModalState['step']) => void;
  close: () => void;
  setStep: (step: AuthModalState['step']) => void;
}
```

---

## shadcn/ui Component Patterns

```tsx
// Primitive components from components/ui/ (generated by shadcn CLI)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Toast } from '@/components/ui/toast';

// Feature-specific composite components in components/features/
// components/features/catalog/ProductCard.tsx
export function ProductCard({ product }: { product: Product }) {
  const { mutate: addToCart, isPending } = useAddToCartMutation();

  return (
    <Card className="group relative overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
          // Always use next/image — never <img> tag
        />
        {product.comparePrice && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold">{formatVND(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatVND(product.comparePrice)}
            </span>
          )}
        </div>
        <Button
          className="w-full mt-3"
          onClick={() => addToCart({ productId: product.id, variantSku: product.defaultVariantSku, qty: 1 })}
          disabled={isPending}
        >
          {isPending ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Skeleton for loading state
ProductCard.Skeleton = function ProductCardSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
};
```

---

## Admin Page Pattern (CSR + Role Check)

```tsx
// apps/web/app/(admin)/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';  // or custom auth hook
import { redirect } from 'next/navigation';
import { Role } from '@lib/types/role.enum';

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  // Server-side role check is also enforced in Express.js — this is a UX safeguard
  if (status === 'loading') return <DashboardSkeleton />;
  if (!session || !['staff', 'admin'].includes(session.user.role)) {
    redirect('/auth/login');
  }

  return <DashboardContent />;
}
```

---

## Key Constraints

1. **All API calls via typed axios client** — never raw `fetch()` or direct MongoDB/Redis access
2. **Always unwrap `{success, data, meta}` envelope** — the interceptor handles this; hooks receive `data` directly
3. **Zustand = UI state only** — cart item data, product data, order data → TanStack Query
4. **Admin pages** check STAFF/ADMIN role (both client-side UX guard + server-side Express.js enforcement)
5. **Images via `next/image`** always — never `<img>` tag
6. **Currency formatting** — always `formatVND()` helper, never raw numbers in UI
7. **No direct MongoDB/Redis access** from Next.js — always via Express.js `/api/v1/*`

## Final Checklist Before Done
- [ ] Correct rendering strategy applied (SSR/ISR/CSR) per page type table
- [ ] `generateMetadata()` included for SSR/ISR pages (SEO)
- [ ] TanStack Query hooks follow `use{Resource}{Action}.ts` naming
- [ ] `queryClient.invalidateQueries()` called after mutations
- [ ] `next/image` used for all images
- [ ] API response unwrapping handled by client interceptor
- [ ] Skeleton loading states implemented
- [ ] `npm run build` → 0 errors
- [ ] `npm run lint` → 0 warnings
