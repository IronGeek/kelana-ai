import type { Trip, TripResponse, TripSearchRequest } from '@/types/trip';

import type { UUID } from 'node:crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTrips(search?: TripSearchRequest): Promise<TripResponse> {
  const res = search
    ? await fetch(`${API_URL}/search/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search)
      })
    : await fetch(`${API_URL}/trips`)

  return res.json()
}

export async function getTrip(id: UUID): Promise<Trip> {
  const res = await fetch(`${API_URL}/trips/${id}`)
  return res.json()
}

export async function generateTrip(data: any) {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    body: JSON.stringify(data)
  })
  return res.json()
}
