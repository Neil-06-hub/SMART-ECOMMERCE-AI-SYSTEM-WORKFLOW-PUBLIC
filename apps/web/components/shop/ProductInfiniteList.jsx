'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Spin, Typography } from 'antd';
import { LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import ProductCarousel from '@/components/shop/ProductCarousel';
import InsightMilestone from '@/components/shop/InsightMilestone';

const { Text } = Typography;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function ProductInfiniteList({
  itemsWithMilestones = [],
  isFetchingNextPage,
  isReachingEnd,
  sentinelRef,
  onMilestoneAction,
}) {
  // Group items by milestones to create carousel sections
  const sections = [];
  let currentGroup = [];
  
  // Logic to determine titles based on milestones
  let hasHitDiscountMilestone = false;

  itemsWithMilestones.forEach((item, index) => {
    if (item.type === 'milestone') {
      if (currentGroup.length > 0) {
        let title = "Tất cả sản phẩm";
        let icon = "🛍️";

        if (!hasHitDiscountMilestone) {
          title = "Sản phẩm giảm giá & Mới về";
          icon = "🏷️";
        } else {
          title = "Gợi ý dành riêng cho bạn";
          icon = "✨";
        }

        sections.push({ 
          type: 'products', 
          data: [...currentGroup], 
          title: title, 
          icon: icon 
        });
        currentGroup = [];
      }
      
      sections.push(item);
      if (item.data.title.includes("giảm giá")) {
        hasHitDiscountMilestone = true;
      }
    } else {
      currentGroup.push(item.data);
    }
  });

  if (currentGroup.length > 0) {
    let title = "Tất cả sản phẩm";
    let icon = "🛍️";
    if (!hasHitDiscountMilestone) {
      title = "Sản phẩm giảm giá & Mới về";
      icon = "🏷️";
    } else {
      title = "Sản phẩm khác";
      icon = "✨";
    }
    sections.push({ type: 'products', data: [...currentGroup], title, icon });
  }

  return (
    <div className="infinite-carousel-container">
      <AnimatePresence mode="popLayout">
        {sections.map((section, idx) => {
          if (section.type === 'milestone') {
            return (
              <motion.div
                key={section.key || `milestone-${idx}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                style={{ marginBottom: 32 }}
              >
                <InsightMilestone
                  data={section.data}
                  onAction={onMilestoneAction}
                />
              </motion.div>
            );
          }

          if (section.type === 'products') {
            return (
              <motion.div
                key={`group-${idx}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                layout
              >
                <ProductCarousel
                  title={section.title}
                  icon={section.icon}
                  products={section.data}
                  // We don't want too many dots if the list grows huge
                  maxDots={10}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </AnimatePresence>

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            padding: '32px 0',
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 20, color: 'var(--mood-accent)' }} />} />
          <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Đang tải thêm sản phẩm...
          </Text>
        </motion.div>
      )}

      {/* End of catalog */}
      {isReachingEnd && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, var(--mood-accent-soft), #FFF)',
            border: '1px solid rgba(232, 93, 4, 0.08)',
            marginTop: 24,
            marginBottom: 40
          }}
        >
          <CheckCircleFilled style={{ fontSize: 28, color: 'var(--mood-accent)', marginBottom: 10 }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)', marginBottom: 6 }}>
            Bạn đã khám phá hết catalog 🎉
          </div>
          <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Hãy thử thay đổi bộ lọc hoặc hỏi AI để khám phá thêm.
          </Text>
        </motion.div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="scroll-sentinel" style={{ height: 100 }} />
    </div>
  );
}
