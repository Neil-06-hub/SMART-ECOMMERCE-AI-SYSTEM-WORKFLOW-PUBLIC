import ClientHome from './client-page';
import { serverApi } from '@/lib/serverApi';

export const metadata = {
  title: 'SmartShop AI - Mua sắm thông minh',
  description: 'Gợi ý sản phẩm thông minh và cá nhân hóa với Google Gemini AI.',
};

export default async function Home() {
  // Lấy dữ liệu sản phẩm nổi bật thông qua cơ chế ISR của Next.js (Cache 1 tiếng)
  const featuredProducts = await serverApi.getFeaturedProducts();

  return (
    <ClientHome initialFeaturedProducts={featuredProducts} />
  );
}
