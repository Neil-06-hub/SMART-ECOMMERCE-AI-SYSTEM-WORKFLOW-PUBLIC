'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMood } from '@/hooks/useMoodEngine';

export default function MoodIndicator() {
  const { mood } = useMood();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood.key}
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -4 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 999,
          background: mood.accentSoft,
          border: `1px solid ${mood.accent}22`,
          fontSize: 12,
          fontWeight: 700,
          color: mood.accent,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: mood.accent,
            boxShadow: `0 0 6px ${mood.glow}`,
            animation: 'magic-float 2s ease-in-out infinite',
          }}
        />
        {mood.label}
      </motion.div>
    </AnimatePresence>
  );
}
