import type { Trip, TripRequest, TripResponse, TripSearchRequest, TripSearchResponse, TripStatusResponse } from '@/types/trip';

import { getAccessToken } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const tripItemsPerPage = 10;

const travelStyles: string[] = [
  'backpacker',
  'budget',
  'cheap',
  'low-cost',
  'luxury',
  'premium',
  'high-end',
  'five-star',
  'family',
  'adult',
  'children',
  'kids',
  'couple',
  'foodie',
  'culinary',
  'restaurant',
  'eat',
  'adventure',
  'hiking',
  'outdoor',
  'active',
] as const;

async function getTrips(search?: TripSearchRequest): Promise<TripSearchResponse> {
  const token = await getAccessToken();
  const param = { page: { index: 1, size: tripItemsPerPage }, ...search};

  const res = await fetch(`${API_URL}/search/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(param)
    })


  const { page, data } = await res.json();

  return { data, total: page.total };
}

async function getTrip(id: string): Promise<TripResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/trips/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    return await res.json();
  }
  return { success: false };
}

async function deleteTrip(id: string): Promise<TripResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/trips/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    return await res.json();
  }

  return { success: false };
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
    return await response.json();
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
    return response.json()
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
    return response.json()
  }

  return { success: false };
}


export {
  tripItemsPerPage,
  travelStyles,
  getTrips,
  getTrip,
  deleteTrip,
  generateTrip,
  generateRecommendation,
  getRecommendationStatus
};
