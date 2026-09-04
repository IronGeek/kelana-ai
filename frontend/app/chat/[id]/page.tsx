import { Chat } from "@/components/chat";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getProfile } from "@/services/auth-service";
import { getConversation, getConversations } from "@/services/chat-service";

import type { UUID } from "node:crypto";
import type { Conversation } from "@/types/chat";

interface ChatPageParams {
  params: Promise<{ id: UUID }>;
}

export default async function ChatPage({ params }: ChatPageParams) {
  const profile = await getProfile();
  const conversations = await getConversations();
  const { id } = await params;
  const conversation = await getConversation(id);
  console.log(conversation);

  const items = conversations.data?.map((conv: Conversation) => ({
    ...conv,
    active: conv.id === conversation.id,
    title: conv.title ?? '',
    url: `/chat/${conv.id}`
  })) ?? [];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" items={items} />
      <SidebarInset>
        <section className="flex flex-col flex-grow">
          <Navbar profile={profile} sidebar={true} />
          <section className="flex flex-col flex-grow w-full mx-auto p-4">
            <Chat
              className="flex-grow min-h-[calc(100vh-5.25rem)] max-h-[calc(100vh-5.25rem)]"
              conversation={conversation}
            />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" />
      </SidebarInset>
    </SidebarProvider>
  )
}
