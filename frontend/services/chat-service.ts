import { getAccessToken } from './auth-service';

import type { UUID } from 'node:crypto';
import type { AskResponse, ChatMessage, Conversation, ConversationSearchResponse } from '@/types/chat';
import { fa } from 'zod/v4/locales';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getConversations(title?: string): Promise<ConversationSearchResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/search/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

  if (res.ok) {
    return res.json();
  }

  console.log(await res.text());
  return { data: [], total: 0 };
}

export async function getConversation(id: UUID): Promise<Conversation> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json()
}

export async function createConversation(
  title?: string | null
): Promise<{ id: string } | null> {
  const token = await getAccessToken();
  const param = title ? { title } : undefined;

  const res = await fetch(`${API_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': `application/json`,
      Authorization: `Bearer ${token}`
    },
    body: param ? JSON.stringify(param) : undefined
  });

  if (res.ok) {
    return res.json();
  }

  return null;
}

export async function updateConversation(
  id: string,
  title?: string
): Promise<{ id: string } | null> {
  const token = await getAccessToken();
  const param = title ? { title } : undefined;

  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': `application/json`,
      Authorization: `Bearer ${token}`
    },
    body: param ? JSON.stringify(param) : undefined
  });

  if (res.ok) {
    return res.json();
  }

  return null;
}

export async function getConversationStatus(
  id: string
): Promise<{
  id: string
  pending: boolean,
  role: string
  content: string
  created_at: string
} | null> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/conversations/${id}/status`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    return res.json()
  }

  return null;
}

export async function sendMessage(
  conversationId: string,
  message: ChatMessage,
  withKb: boolean =  false
): Promise<{ success: true, data: ChatMessage } | { success: false, error?: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': `application/json`,
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...message, with_kb: withKb })
  });

  if (res.ok) {
    return { success: true, data: await res.json() };
  }

  return { success: false };
}

export async function askQuestion(question: string, with_kb: boolean = false): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, with_kb })
  })

  if (response.ok) {
    return response.json();
  }

  return { success: false };
}
