import { Chat } from "@/components/chat";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getProfile } from "@/services/auth-service";
import { getConversations } from "@/services/chat-service";

import type { Conversation } from "@/types/chat";

export default async function ChatPage() {
  const profile = await getProfile();
  const conversations = await getConversations();

  const items = conversations.data?.map((conv: Conversation) => ({
    ...conv,
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
            />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" />
      </SidebarInset>
    </SidebarProvider>
  )
}
