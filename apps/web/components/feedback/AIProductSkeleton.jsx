'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * Magic Skeleton — artistic product-shaped loading states
 * with brand-colored gradient pulses and floating dots.
 */

function MagicDots() {
  const dots = [
    { left: '20%', top: '30%', delay: 0 },
    { left: '60%', top: '50%', delay: 0.4 },
    { left: '40%', top: '70%', delay: 0.8 },
    { left: '75%', top: '25%', delay: 1.2 },
    { left: '30%', top: '55%', delay: 0.6 },
  ];

  return dots.map((dot, i) => (
    <div
      key={i}
      className="magic-skeleton-dot"
      style={{
        left: dot.left,
        top: dot.top,
        animationDelay: `${dot.delay}s`,
      }}
    />
  ));
}

function MagicCard({ index = 0, variant = 'default' }) {
  const isHero = variant === 'hero';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="magic-skeleton-card">
        {/* Image area with floating dots */}
        <div
          className="magic-skeleton-image"
          style={isHero ? { aspectRatio: '3/4' } : undefined}
        >
          <MagicDots />
        </div>

        {/* Body — mimics real ProductCard structure */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Category line */}
          <div
            className="magic-skeleton-line magic-skeleton-line-sm"
            style={{ width: '35%', animationDelay: `${index * 0.1}s` }}
          />

          {/* Product name — 2 lines */}
          <div
            className="magic-skeleton-line"
            style={{ width: '85%', animationDelay: `${index * 0.1 + 0.05}s` }}
          />
          <div
            className="magic-skeleton-line"
            style={{ width: '60%', animationDelay: `${index * 0.1 + 0.1}s` }}
          />

          {/* Spacer */}
          <div style={{ height: 4 }} />

          {/* Rating stars area */}
          <div
            className="magic-skeleton-line magic-skeleton-line-sm"
            style={{ width: '50%', animationDelay: `${index * 0.1 + 0.15}s` }}
          />

          {/* Spacer */}
          <div style={{ height: 6 }} />

          {/* Price + button row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div
              className="magic-skeleton-line magic-skeleton-line-lg"
              style={{ width: '40%', animationDelay: `${index * 0.1 + 0.2}s` }}
            />
            <div
              className="magic-skeleton-line"
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                animationDelay: `${index * 0.1 + 0.25}s`,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Bento skeleton — mimics the BentoGrid layout during loading
 */
function BentoSkeleton() {
  return (
    <div className="bento-grid" style={{ marginBottom: 32 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MagicCard key={i} index={i} variant={i === 0 ? 'hero' : 'default'} />
      ))}
    </div>
  );
}

/**
 * Grid skeleton — standard product grid during loading
 */
function GridSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <MagicCard key={i} index={i} />
      ))}
    </div>
  );
}

export default function AIProductSkeleton({ count = 4, variant = 'grid' }) {
  if (variant === 'bento') return <BentoSkeleton />;

  return (
    <AnimatePresence>
      <GridSkeleton count={count} />
    </AnimatePresence>
  );
}
