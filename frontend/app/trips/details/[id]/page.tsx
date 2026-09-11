
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { TripDetail } from '@/components/trip-detail';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { init } from '@/lib/init';

import { getTrip } from '@/services/trip-service';

import type { UUID } from 'node:crypto';

interface TripDetailsParams {
  params: Promise<{ id: UUID }>;
}

export default async function TripsDetails(args: TripDetailsParams) {
  const { sidebarOpen, sidebarItems, profile, params } = await init(args);

  const trip = await getTrip(params.id);

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
          <section className="flex flex-col flex-grow gap-4 w-full mx-auto p-8">
            {trip ? <TripDetail className="flex-grow" trip={trip.data} /> : null}
          </section>
        </section>
        <Footer className="mx-auto mt-auto" navbar={true} />
      </SidebarInset>
    </SidebarProvider>
  );
}
