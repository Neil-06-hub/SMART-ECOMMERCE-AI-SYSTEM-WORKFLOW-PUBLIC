'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

/**
 * Mood definitions — each mood adjusts the visual layer
 * exploring:     slow browsing, varied scroll, default state
 * comparing:     moderate scroll, frequent back-forth, search changes
 * ready_to_buy:  fast scroll to known items, quick add-to-cart signals
 * browsing:      very slow scroll, casual dwell
 */
const MOODS = {
  exploring: {
    key: 'exploring',
    label: '🔍 Khám phá',
    accent: '#E85D04',
    accentSoft: '#FFF4EC',
    glow: 'rgba(232, 93, 4, 0.15)',
    speed: 1,
  },
  comparing: {
    key: 'comparing',
    label: '📐 Đang so sánh',
    accent: '#7C3AED',
    accentSoft: '#F5F3FF',
    glow: 'rgba(124, 58, 237, 0.15)',
    speed: 0.85,
  },
  ready_to_buy: {
    key: 'ready_to_buy',
    label: '🔥 Sẵn sàng mua',
    accent: '#059669',
    accentSoft: '#ECFDF5',
    glow: 'rgba(5, 150, 105, 0.15)',
    speed: 1.3,
  },
  browsing: {
    key: 'browsing',
    label: '☕ Dạo chơi',
    accent: '#0284C7',
    accentSoft: '#F0F9FF',
    glow: 'rgba(2, 132, 199, 0.15)',
    speed: 0.7,
  },
};

const SCROLL_SAMPLE_INTERVAL = 300; // ms between scroll speed samples
const MOOD_UPDATE_INTERVAL = 3000;  // ms between mood recalculations
const HISTORY_SIZE = 20;            // number of scroll samples to keep

const MoodContext = createContext(null);

export function MoodProvider({ children }) {
  const mood = useMoodEngine();

  return (
    <MoodContext.Provider value={mood}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) {
    // Return default mood if not wrapped in provider
    return {
      mood: MOODS.exploring,
      signals: { scrollSpeed: 0, searchCount: 0, cartAdds: 0 },
      recordSearch: () => {},
      recordCartAdd: () => {},
    };
  }
  return ctx;
}

function useMoodEngine() {
  const [mood, setMood] = useState(MOODS.exploring);

  // Signal accumulators (ref to avoid re-renders on every scroll)
  const scrollSpeeds = useRef([]);
  const lastScrollY = useRef(0);
  const searchCount = useRef(0);
  const cartAdds = useRef(0);
  const directionChanges = useRef(0);
  const lastDirection = useRef(0);

  // Apply CSS variables when mood changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--mood-accent', mood.accent);
    root.style.setProperty('--mood-accent-soft', mood.accentSoft);
    root.style.setProperty('--mood-glow', mood.glow);
    root.style.setProperty('--mood-speed', String(mood.speed));
  }, [mood]);

  // Track scroll velocity
  useEffect(() => {
    let lastTime = Date.now();
    let rafId;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTime < SCROLL_SAMPLE_INTERVAL) return;

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      const speed = Math.abs(delta) / ((now - lastTime) / 1000);

      // Track direction changes (indicates comparing behavior)
      const dir = delta > 0 ? 1 : delta < 0 ? -1 : 0;
      if (dir !== 0 && dir !== lastDirection.current) {
        directionChanges.current++;
        lastDirection.current = dir;
      }

      scrollSpeeds.current.push(speed);
      if (scrollSpeeds.current.length > HISTORY_SIZE) {
        scrollSpeeds.current.shift();
      }

      lastScrollY.current = currentY;
      lastTime = now;
    };

    const throttled = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', throttled, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttled);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Periodically recalculate mood
  useEffect(() => {
    const interval = setInterval(() => {
      const speeds = scrollSpeeds.current;
      if (speeds.length < 3) return; // Not enough data

      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const searches = searchCount.current;
      const carts = cartAdds.current;
      const dirChanges = directionChanges.current;

      let newMood;

      if (carts >= 2) {
        // Multiple cart adds → ready to buy
        newMood = MOODS.ready_to_buy;
      } else if (dirChanges >= 4 || searches >= 3) {
        // Lots of direction changes or searches → comparing
        newMood = MOODS.comparing;
      } else if (avgSpeed < 100) {
        // Very slow scroll → casual browsing
        newMood = MOODS.browsing;
      } else {
        newMood = MOODS.exploring;
      }

      setMood((current) => {
        if (current.key !== newMood.key) return newMood;
        return current;
      });

      // Decay signals over time
      directionChanges.current = Math.max(0, directionChanges.current - 1);
      if (searchCount.current > 0) searchCount.current--;
    }, MOOD_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const recordSearch = useCallback(() => {
    searchCount.current++;
  }, []);

  const recordCartAdd = useCallback(() => {
    cartAdds.current++;
  }, []);

  return {
    mood,
    signals: {
      scrollSpeed: scrollSpeeds.current.length > 0
        ? scrollSpeeds.current[scrollSpeeds.current.length - 1]
        : 0,
      searchCount: searchCount.current,
      cartAdds: cartAdds.current,
    },
    recordSearch,
    recordCartAdd,
  };
}

export default useMoodEngine;
export { MOODS };
