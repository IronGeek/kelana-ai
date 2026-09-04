import type { Trip, TripRequest, TripResponse, TripSearchRequest, TripSearchResponse, TripStatusResponse } from '@/types/trip';

import type { UUID } from 'node:crypto';
import { getAccessToken } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const tripItemsPerPage = 10;

async function getTrips(search?: TripSearchRequest): Promise<TripSearchResponse> {
  const token = await getAccessToken();
  const param = { page: { size: tripItemsPerPage }, ...search};

  const res = await fetch(`${API_URL}/search/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(param)
    })

  return res.json()
}

async function getTrip(id: UUID): Promise<Trip> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/trips/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json()
}

async function generateTrip(request: TripRequest): Promise<TripResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  })

  if (response.ok) {
    return { success: true, data: await response.json() };
  }

  return { success: false };
}

async function generateRecommendation(tripId: string): Promise<TripStatusResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/trips/${tripId}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })

  if (response.ok) {
    return { success: true, data: await response.json() };
  }

  return { success: false };
}

async function getRecommendationStatus(tripId: string): Promise<TripStatusResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/trips/${tripId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })

  if (response.ok) {
    return { success: true, data: await response.json() };
  }

  return { success: false };
}


export {
  tripItemsPerPage,
  getTrips,
  getTrip,
  generateTrip,
  generateRecommendation,
  getRecommendationStatus
};
