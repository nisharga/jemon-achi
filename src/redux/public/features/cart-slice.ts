import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import type { Product_data } from '@/lib/data';

export interface CartLine {
    id: string;
    product: Product_data;
    variantId: string;
    selectedSize?: number | string;
    selectedColor?: string;
    quantity: number;
    addedAt: number;
    priceSnapshot?: number;
}

export interface CartState {
    items: CartLine[];
    isOpen: boolean;
    isHydrated: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false,
    isHydrated: false
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (
            state,
            {
                payload
            }: PayloadAction<{
                product: Product_data;
                variantId: string;
                selectedSize?: number | string;
                selectedColor?: string;
                quantity?: number;
                priceSnapshot?: number;
            }>
        ) => {
            const qty = payload.quantity ?? 1;

            // We identify a unique row by SKU + Variant ID + Size + Color
            const existing = state?.items?.find(
                (i) =>
                    i.product.sku === payload.product.sku &&
                    i.variantId === payload.variantId &&
                    i.selectedSize === payload.selectedSize &&
                    i.selectedColor === payload.selectedColor
            );

            if (existing) {
                // Enforce the max limit of 5
                existing.quantity = Math.min(5, existing.quantity + qty);
            } else {
                state.items.push({
                    id: nanoid(),
                    addedAt: Date.now(),
                    product: payload.product,
                    variantId: payload.variantId,
                    selectedSize: payload.selectedSize,
                    selectedColor: payload.selectedColor,
                    quantity: qty,
                    priceSnapshot: payload.priceSnapshot
                });
            }
        },

        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        },

        updateQty: (
            state,
            { payload }: PayloadAction<{ id: string; quantity: number }>
        ) => {
            const row = state?.items?.find((i) => i.id === payload.id);
            if (row) row.quantity = Math.max(1, Math.min(5, payload.quantity));
        },

        removeItem: (state, { payload }: PayloadAction<string>) => {
            state.items = state.items.filter((i) => i.id !== payload);
        },

        clearCart: (state) => {
            state.items = [];
        },
        setHydrated: (state, { payload }: PayloadAction<boolean>) => {
            state.isHydrated = payload;
        }
    }
});

export const {
    addToCart,
    openCart,
    closeCart,
    updateQty,
    removeItem,
    clearCart,
    setHydrated
} = cartSlice.actions;

// ================= SELECTORS =================

// 1. Get all items
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

// 2. Calculate total quantity (Used for your totalItems/Badge)
export const selectCartCount = (state: { cart: CartState }) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0);

// 3. Calculate subtotal
export const selectCartSubtotal = (state: { cart: CartState }) =>
    state.cart.items.reduce(
        (sum, item) =>
            sum +
            (item.priceSnapshot || item.product.priceDiscount || 0) *
                item.quantity,
        0
    );

// 4. UI State selectors
export const selectIsCartOpen = (state: { cart: CartState }) =>
    state.cart.isOpen;
export const selectIsHydrated = (state: { cart: CartState }) =>
    state.cart.isHydrated;

export default cartSlice.reducer;
