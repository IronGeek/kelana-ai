import { Chat } from "@/components/chat";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { init } from "@/lib/init";


export default async function ChatPage() {
  const { sidebarOpen, sidebarItems, profile } = await init();

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
            />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" navbar={true} />
      </SidebarInset>
    </SidebarProvider>
  )
}
