import { cookies } from "next/headers";
import { getProfile } from "@/services/auth-service";
import { getTrips, tripItemsPerPage } from "@/services/trip-service";

import { Conversation, ConversationSearchResponse } from "@/types/chat";
import { getConversations } from "@/services/chat-service";

import type {  Trip, TripSearchResponse, UserProfile } from "@/types/trip";
import type { SidebarTreeItem } from "@/components/sidebar/tree";

interface InitArgs {
  params?: Promise<{ page?: string, id?: string }>;
  searchParams?: Promise<{ query?: string }>;
}

interface InitResult<T> {
  sidebarOpen: boolean
  sidebarItems: {
    trips: SidebarTreeItem[]
    conversations: SidebarTreeItem[]
  },
  pageIndex: number
  pageQuery: string

  params: { page: string, id: T }
  searchParams: { query: string }
  profile: UserProfile | undefined,
  trips: TripSearchResponse,
  conversations: ConversationSearchResponse
}

export const init = async <T extends string>(args: InitArgs = {}): Promise<InitResult<T>> => {
  const {
    searchParams = Promise.resolve({ query: '' }),
    params = Promise.resolve({ page: '', id: '' })
  } = args;

  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value === "true"

  const profile = await getProfile();
  const [resultParams, resultSearchParams] = await Promise.all([params, searchParams]);
  const resolvedParams = { page: '', id: '', ...resultParams };
  const resolvedSearchParams = { query: '', ...resultSearchParams };

  const pageQuery = resolvedSearchParams.query || '';
  const pageString = resolvedParams.page || '1';
  const pageIndex = Math.max(1, parseInt(pageString, 10));

  const tripsArgs = {
    query: pageQuery,
    page: {
      index: pageIndex,
      size: tripItemsPerPage
    }
  };

  const trips = await getTrips(tripsArgs);
  const tripItems = trips.data?.map((trip: Trip) => ({
    id: trip.id,
    title: `${trip.row_num}. ${trip.destination || trip.id}`,
    url: `/trips/details/${trip.id}`,
    active: trip.id === resolvedParams.id
  })) ?? [];

  const conversations = await getConversations();
  const conversationItems = conversations.data?.map((conv: Conversation) => ({
    id: conv.id,
    title:`${conv.row_num}. ${conv.title || conv.id}`,
    url: `/chat/${conv.id}`,
    active: conv.id === resolvedParams.id
  })) ?? [];

  const sidebarItems = { trips: tripItems, conversations: conversationItems };

  return {
    sidebarOpen, sidebarItems,
    pageIndex, pageQuery,
    params: resolvedParams as InitResult<T>["params"],
    searchParams: resolvedSearchParams,
    profile, trips, conversations
  }
}
