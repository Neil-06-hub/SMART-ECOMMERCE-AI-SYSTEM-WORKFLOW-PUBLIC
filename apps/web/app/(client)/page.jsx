import ClientHome from './client-page';
import { serverApi } from '@/lib/serverApi';

export const metadata = {
  title: 'SmartShop AI - Mua sắm thông minh',
  description: 'Gợi ý sản phẩm thông minh và cá nhân hóa với Google Gemini AI.',
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Homepage shell is rendered on demand; personalized AI cards hydrate on the client after auth state is known.
  const featuredProducts = await serverApi.getFeaturedProducts();

  return (
    <ClientHome initialFeaturedProducts={featuredProducts} />
  );
}
