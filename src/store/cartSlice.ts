import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../types/order.types";

interface CartState {
  items: CartItem[];
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.cakeId === action.payload.cakeId
      );

      if (existingItem) {
        existingItem.qty = Math.min(
          existingItem.qty + action.payload.qty,
          existingItem.stock
        );
      } else {
        state.items.push(action.payload);
      }

      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );
    },

    updateQty: (
      state,
      action: PayloadAction<{ cakeId: string; qty: number }>
    ) => {
      const item = state.items.find(
        (item) => item.cakeId === action.payload.cakeId
      );

      if (item) {
        if (action.payload.qty <= 0) {
          state.items = state.items.filter(
            (item) => item.cakeId !== action.payload.cakeId
          );
        } else {
          item.qty = Math.min(action.payload.qty, item.stock);
        }
      }

      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.cakeId !== action.payload
      );

      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },

    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.totalPrice = action.payload.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart, setCart } =
  cartSlice.actions;

export default cartSlice.reducer;
