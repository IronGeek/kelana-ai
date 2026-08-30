'use server';

import type { RegisterRequest, LoginRequest, UserProfile } from '@/types/trip';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAccessToken(redirectToLogin: boolean = true): Promise<string | undefined> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value;

    if (!token) throw new Error();

    return token;
  } catch {
    if (redirectToLogin) { redirect('/login'); }
  }
}

export async function register(request: RegisterRequest) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  return res.ok;
}

export async function login(request: LoginRequest) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  })

  const result = await res.json();
  if (res.ok) {
    console.log(result);

    const cookieStore = await cookies()
    cookieStore.set('auth_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(result.expires),
      // maxAge: 60 * 60 * 24 // Cookie expires in 1 day (in seconds)
    });

    return { success: true }
  }

  return { success: false, error: result.detail };
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value;

  if (token) {
    cookieStore.set('auth_token', '', {
      path: '/',
      maxAge: 0, // Tells the browser to delete the cookie immediately
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });

    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  return { success: true }
}

export async function getProfile(redirectToLogin: boolean = true): Promise<UserProfile | undefined> {
  const token = await getAccessToken(redirectToLogin);

  const res = await fetch(`${API_URL}/auth/me`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    return await res.json() as UserProfile;
  }

  if (res.status === 401 && redirectToLogin) {
    return redirect('/login');
  }

  return undefined;
}
