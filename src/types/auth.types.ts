import type { User } from "../types/user.types.ts"

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  accessToken: string
  refreshToken?: string
  user?: User
  data?: User
}
