'use client';

import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * Bento Grid for featured/AI-prioritized products.
 * Shows up to 5 products in a visually dynamic grid layout.
 * First item gets the "hero" size, next two get "medium", last two "compact".
 */
export default function ProductBentoGrid({ products = [], aiProducts = [] }) {
  // Merge: AI prioritized first, then featured, deduped
  const seen = new Set();
  const merged = [];

  for (const p of [...aiProducts, ...products]) {
    if (!seen.has(p._id) && merged.length < 5) {
      seen.add(p._id);
      merged.push(p);
    }
  }

  if (merged.length < 3) return null;

  const sizeMap = ['hero', 'medium', 'medium', 'compact', 'compact'];

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>✨</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
          Đáng chú ý
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Sản phẩm nổi bật và AI đề xuất
        </span>
      </div>

      <motion.div
        className="bento-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {merged.map((product, index) => (
          <motion.div key={product._id} variants={itemVariants}>
            <ProductCard
              product={product}
              size={sizeMap[index] || 'compact'}
              matchPercent={
                aiProducts.find((p) => p._id === product._id) ? (96 - index * 3) : undefined
              }
              showAIOverlay={!!aiProducts.find((p) => p._id === product._id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
