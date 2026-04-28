'use client';

import { motion, AnimatePresence } from 'framer-motion';

function ShimmerCard() {
  return (
    <div className="shimmer-card">
      <div className="shimmer-image" />
      <div className="shimmer-body">
        <div className="shimmer-line shimmer-line-sm shimmer-w-1-3" />
        <div className="shimmer-line shimmer-w-4-5" />
        <div className="shimmer-line shimmer-w-2-3" />
        <div style={{ height: 8 }} />
        <div className="shimmer-line shimmer-line-sm shimmer-w-full" />
        <div className="shimmer-line shimmer-line-sm shimmer-w-4-5" />
        <div style={{ height: 4 }} />
        <div className="shimmer-line shimmer-line-lg shimmer-w-1-3" />
      </div>
    </div>
  );
}

export default function AIProductSkeleton({ count = 4 }) {
  return (
    <AnimatePresence>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 24,
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
          >
            <ShimmerCard />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
