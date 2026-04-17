import ClientProductDetail from './client-page';
import { serverApi } from '@/lib/serverApi';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await serverApi.getProductById(id);
  if (!data?.product) {
    return { title: 'Không tìm thấy sản phẩm - SmartShop' };
  }
  return {
    title: `${data.product.name} | SmartShop AI`,
    description: data.product.description || 'Mua sắm thông minh với sự hỗ trợ của AI',
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  // ISR: fetch product detail every 300s to keep PDP inventory/content reasonably fresh.
  const productData = await serverApi.getProductById(id);

  return (
    <ClientProductDetail initialProductData={productData} id={id} />
  );
}
