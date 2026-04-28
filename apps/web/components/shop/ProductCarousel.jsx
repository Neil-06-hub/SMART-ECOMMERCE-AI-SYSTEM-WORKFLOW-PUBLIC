'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ProductCard from '@/components/product/ProductCard';

export default function ProductCarousel({ 
  title, 
  subtitle, 
  icon, 
  products = [], 
  aiProducts = [],
  matchPercents = []
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (index) => {
    setCurrentIndex(index);
  };

  if (!products.length) return null;

  return (
    <div style={{ marginBottom: 48, position: 'relative' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: 20,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={prev}
            className="carousel-btn"
            aria-label="Previous"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <LeftOutlined />
          </button>
          <button 
            onClick={next}
            className="carousel-btn"
            aria-label="Next"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={containerRef}
        style={{ 
          overflow: 'hidden',
          borderRadius: 20,
          margin: '0 -10px',
          padding: '10px',
          position: 'relative',
          touchAction: 'pan-y' // Prevent vertical scroll interference
        }}
      >
        <motion.div
          drag="x"
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            // Sensitivity adjustment: account for velocity more heavily for a "flick" feel
            const swipeThreshold = 50;
            const swipe = offset.x + velocity.x * 10;
            
            if (swipe < -swipeThreshold && currentIndex < totalPages - 1) {
              next();
            } else if (swipe > swipeThreshold && currentIndex > 0) {
              prev();
            }
          }}
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ 
            type: 'spring', 
            damping: 28, 
            stiffness: 200,
            mass: 1
          }}
          style={{ 
            display: 'flex',
            gap: 20,
            cursor: 'grab'
          }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {products.map((product, index) => {
            const isAI = aiProducts.some(p => p._id === product._id);
            const matchPercent = matchPercents[index] || (isAI ? 95 - index : undefined);
            
            return (
              <div 
                key={product._id} 
                style={{ 
                  flex: `0 0 calc(${100 / itemsPerPage}% - ${(20 * (itemsPerPage - 1)) / itemsPerPage}px)`,
                  minWidth: 0,
                  pointerEvents: 'auto' // Ensure card interactions work
                }}
              >
                <ProductCard 
                  product={product} 
                  size="medium" 
                  matchPercent={matchPercent}
                  showAIOverlay={isAI}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 8, 
          marginTop: 20 
        }}>
          {Array.from({ length: Math.min(totalPages, 15) }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              style={{
                width: i === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === currentIndex ? 'var(--mood-accent)' : 'var(--color-border)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
          {totalPages > 15 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>...</span>}
        </div>
      )}

      <style jsx>{`
        .carousel-btn:hover {
          border-color: var(--mood-accent);
          color: var(--mood-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--mood-glow);
        }
        .carousel-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
