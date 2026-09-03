
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { TripDetail } from '@/components/trip-detail';
import { getProfile } from '@/services/auth-service';

import { getTrip } from '@/services/trip-service';

import type { UUID } from 'node:crypto';

interface TripDetailsParams {
  params: Promise<{ id: UUID }>;
}

export default async function TripsDetails({ params }: TripDetailsParams) {
  const profile = await getProfile();
  const { id } = await params;
  const trip = await getTrip(id);

  return (
    <section className="flex flex-col min-h-[100vh]">
      <Navbar profile={profile} />
      <section className="w-full mx-auto max-w-screen-2xl p-4">
        <Header>Trip Details</Header>
        {trip ? <TripDetail trip={trip} /> : null}
      </section>
      <Footer className="mx-auto mt-auto" />
    </section>
  );
}
