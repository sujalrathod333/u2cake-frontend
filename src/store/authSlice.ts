import { createSlice } from "@reduxjs/toolkit"

import type { User } from "../types/user.types"

const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
}

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },

    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, logout } =
  authSlice.actions

export default authSlice.reducer