interface Trip {
  id: number
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

interface TripResponse {
  data: Trip[]
  total: number
}

interface TripSearchRequest {
  search: string
  filter?: { destination: boolean, style: boolean }
  page?: { index: number, size: number }
}

export type{ Trip, TripResponse, TripSearchRequest };
