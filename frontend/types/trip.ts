interface Trip {
  id: string
  destination: string
  days: number
  budget: number
  styles: string[]
  daily_budget: number
  category: string
  recommendation?: string
  pending: boolean
  created_at: string
  updated_at: string
  row_num: number
}

interface TripRequest {
  destination: string
  budget: number
  days: number
  styles: string[]
}

interface TripResponse {
  success: boolean
  data?: Trip
}

interface TripSearchRequest {
  query: string
  filter?: { destination: boolean, style: boolean }
  page?: { index: number, size: number }
}

interface TripSearchResponse {
  data: Trip[]
  total: number
}

type TripStatusResponse = {
  success: boolean
  data?: {
    id: string
    pending: true
    message: string
  } | {
    id: string
    pending: false
    recommendation: string | null
  }
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  email: string
  password: string
}

interface UserProfile {
  name: string
  email: string
  picture?: string
}

export type {
  Trip, TripRequest, TripResponse, TripSearchRequest, TripSearchResponse, TripStatusResponse,
  RegisterRequest, LoginRequest,
  UserProfile
};
