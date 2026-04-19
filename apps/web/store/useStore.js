'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── AUTH ────────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          // Also set cookie so middleware can read it
          document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          document.cookie = 'auth_token=; path=/; max-age=0';
        }
        useWishlistStore.getState().clearWishlist();
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // _hasHydrated is intentionally excluded — always resets to false on fresh load
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ── CART ─────────────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i._id === product._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i._id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i._id !== productId) });
        } else {
          set({
            items: get().items.map((i) =>
              i._id === productId ? { ...i, quantity } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);

// ── WISHLIST ──────────────────────────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      setItems: (ids) => set({ items: ids.map((id) => id.toString()) }),

      toggle: (productId) => {
        const id = productId.toString();
        const items = get().items;
        if (items.includes(id)) {
          set({ items: items.filter((i) => i !== id) });
        } else {
          set({ items: [...items, id] });
        }
      },

      addItem: (productId) => {
        const id = productId.toString();
        if (!get().items.includes(id)) set({ items: [...get().items, id] });
      },

      removeItem: (productId) => {
        const id = productId.toString();
        set({ items: get().items.filter((i) => i !== id) });
      },

      isWishlisted: (productId) => get().items.includes(productId?.toString()),

      clearWishlist: () => set({ items: [] }),

      get totalItems() {
        return get().items.length;
      },
    }),
    { name: 'wishlist-storage' }
  )
);
