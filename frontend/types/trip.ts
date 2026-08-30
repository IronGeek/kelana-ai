interface Trip {
  id: string
  destination: string
  days: number
  budget: number
  travel_style: string[]
  daily_budget: number
  category: string
  transport: string
  recommendation?: string
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  execution_time?: number
  tracking_id?: string
  processing: boolean
  created_at: string
  updated_at: string
}

interface TripRequest {
  destination: string
  budget: number
  days: number
  travel_style: string[]
}

interface TripResponse {
  success: boolean
  data?: Trip
}

interface TripSearchRequest {
  search: string
  filter?: { destination: boolean, style: boolean }
  page?: { index: number, size: number }
}

interface TripSearchResponse {
  data: Trip[]
  total: number
}

type TripStatusResponse = {
  success: true
  data: {
    id: string
    processing: true
    message: string
  } | {
    id: string
    processing: false
    recommendation: string | null
  }
} | {
  success: false
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
