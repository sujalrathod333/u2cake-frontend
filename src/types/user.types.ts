export type UserRole = "admin" | "user"

export interface Address {
  city?: string
  street?: string
  state?: string
  country?: string
  pincode?: string
}

export interface User {
  _id: string

  name: string
  email: string

  role: UserRole

  phone?: string
  profileImage?: string

  address?: Address

  isVerified: boolean

  createdAt: string
  updatedAt: string
}