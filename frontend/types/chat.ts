import type { ComponentType } from 'react';

type ChatSource = {
  title: string
  document_id: string
  location: string
  metadata: Record<string, string>
  score: number
};

interface ChatUserMessage {
  id: string
  role: "user"
  content: string
  created_at?: string
  error?: string
}

interface ChatAssistantMessage {
  id: string
  role: "assistant"
  content: string
  created_at?: string
  sources?: ChatSource[]
  error?: string
}

interface ChatSeparatorMessage {
  id: string
  role: 'separator'
  content?: string
}

interface ChatStatusMessage {
  id: string
  role: 'status'
  Icon: ComponentType,
  content?: string
}
type ChatMessage = ChatUserMessage | ChatAssistantMessage | ChatSeparatorMessage | ChatStatusMessage ;

type ChatResponse<T extends ChatMessage> = {
  success: true,
  data: T
} | {
  success: false
  error?: string
  created_at?: string
}

interface Conversation {
  id: string,
  title?: string
  updated_at?: string
  created_at?: string
  messages?: ChatMessage[]
}

interface ConversationSearchRequest {
  title: string;
  page?: { index: number, size: number }
}

interface ConversationSearchResponse {
  data: Conversation[]
  total: number
}

type AskResponse = {
  success: true,
  data: {
    question: string
    answer: string
    sources: ChatSource[]
  }
} | {
  success: false
  error?: string
}

export type {
  AskResponse, ChatSource,ChatResponse,ChatMessage,
  ChatUserMessage, ChatAssistantMessage, ChatSeparatorMessage, ChatStatusMessage,
  Conversation, ConversationSearchRequest, ConversationSearchResponse,
}
