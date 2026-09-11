import { Chat } from "@/components/chat";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getConversation } from "@/services/chat-service";

import type { UUID } from "node:crypto";
import { init } from "@/lib/init";

interface ChatPageParams {
  params: Promise<{ id: UUID }>;
}

export default async function ChatPage(args: ChatPageParams) {
  const { sidebarOpen, sidebarItems, profile, params } = await init<UUID>(args);

  const conversation = await getConversation(params.id);

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <Sidebar
        collapsible="icon"
        conversations={sidebarItems.conversations}
        trips={sidebarItems.trips}
      />
      <SidebarInset className="bg-muted">
        <section className="flex flex-col flex-grow">
          <Navbar profile={profile} sidebar={true} />
          <section className="flex flex-col flex-grow w-full mx-auto p-4">
            <Chat
              className="flex-grow min-h-[calc(100vh-5.25rem)] max-h-[calc(100vh-5.25rem)]"
              conversation={conversation.data}
            />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" navbar={true} />
      </SidebarInset>
    </SidebarProvider>
  )
}
