import { Assistant } from "@/components/assistant";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { init } from "@/lib/init";
import { getProfile } from "@/services/auth-service";

export default async function AssistantPage() {
  const { sidebarOpen, sidebarItems, profile } = await init();

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <Sidebar
        collapsible="icon"
        conversations={sidebarItems.conversations}
        trips={sidebarItems.trips}
      />
      <SidebarInset className="bg-muted">
        <section className="flex flex-col flex-grow bg-muted">
          <Navbar profile={profile} />
          <section className="flex flex-col flex-grow w-full mx-auto max-w-screen-2xl p-4">
            <Assistant
              className="flex-grow min-h-[calc(100vh-5.25rem)] max-h-[calc(100vh-5.25rem)]"
            />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" navbar={true} />
      </SidebarInset>
    </SidebarProvider>
  )
}
