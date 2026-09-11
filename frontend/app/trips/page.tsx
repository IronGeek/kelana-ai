import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Sidebar } from "@/components/sidebar";
import { TripView } from '@/components/trip-view';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { init } from '@/lib/init';

type TripsPageProps = {
  searchParams: Promise<{ query?: string, page?: number }>;
};

export default async function TripsPage(args: TripsPageProps) {
  const { sidebarOpen, sidebarItems, trips, profile, pageQuery, pageIndex } = await init(args);

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
          <section className="flex flex-col flex-grow w-full mx-auto p-8">
            <TripView
              className="flex-grow min-h-[calc(100vh-11.375rem)]"
              trips={trips.data}
              search={pageQuery}
              total={trips.total}
              page={pageIndex} />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" navbar={true} />
      </SidebarInset>
    </SidebarProvider>
  )
}
