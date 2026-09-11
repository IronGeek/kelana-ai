import { getAccessToken } from './auth-service';

import type { UUID } from 'node:crypto';
import type { AskResponse, ChatMessage, Conversation, ConversationResponse, ConversationSearchResponse, ConversationStatusResponse } from '@/types/chat';
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


  const { page, data } = await res.json();
  return { data, total: page.total };
}

export async function getConversation(id: UUID): Promise<ConversationResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    return res.json()
  }

  return { success: false };
}

export async function createConversation(
  title?: string | null
): Promise<ConversationResponse> {
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

  return { success: false };
}

export async function updateConversation(
  id: string,
  title?: string
): Promise<{ id: string } | null> {
  const token = await getAccessToken();
  const param = title ? { title } : undefined;

  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: 'PATCH',
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
): Promise<ConversationStatusResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/conversations/${id}/status`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    return res.json()
  }

  return { success: false };
}

export async function deleteConversation(id: string): Promise<ConversationResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    return await res.json();
  }

  return { success: false };
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
    return res.json();
  }

  return { success: false };
}

export async function askQuestion(question: string, with_kb: boolean = false): Promise<AskResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/kb/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ question, with_kb })
  })

  if (res.ok) {
    return res.json();
  }

  return { success: false };
}
