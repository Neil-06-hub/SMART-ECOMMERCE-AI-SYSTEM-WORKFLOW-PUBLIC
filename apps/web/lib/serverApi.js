const BASE_URL = process.env.INTERNAL_API_URL || 'http://localhost:5000/api';

/**
 * Hàm gọi API dùng cho Server Component hỗ trợ ISR/SSR Next.js 15
 * Bắt lỗi để tránh crash Next.js Build khi Backend chưa bật
 */
export async function fetchISR(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      next: { revalidate: 3600 }, // ISR cache 1 hour
      ...options,
    });
    if (!res.ok) {
      console.warn(`[ISR Fetch] API trả về lỗi ${res.status}: ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`[ISR Fetch Error] Không thể kết nối tới backend cho: ${endpoint}`, error.message);
    // Trả về mặc định để không sập trang lúc build, có thể do backend bị tắt
    return null;
  }
}

export const serverApi = {
  getFeaturedProducts: async () => {
    const data = await fetchISR('/products/featured');
    return data?.products || [];
  },
  getProductById: async (id) => {
    const data = await fetchISR(`/products/${id}`, { next: { revalidate: 300 } });
    return data || null;
  },
  getSimilarProducts: async (id) => {
    const data = await fetchISR(`/products/${id}/similar`, { next: { revalidate: 300 } });
    return data?.products || [];
  }
};
