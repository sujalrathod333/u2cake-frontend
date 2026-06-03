import { configureStore } from "@reduxjs/toolkit"

import authReducer from "./authSlice"
import cartReducer from "./cartSlice"
import orderReducer from "./orderSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch