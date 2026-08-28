
import { Header } from '@/components/header';
import { TripDetail } from '@/components/trip-detail';

import { getTrip } from '@/services/trip-service';

import type { UUID } from 'node:crypto';

interface TripDetailsParams {
  params: Promise<{ id: UUID }>;
}

export default async function TripsDetails({ params }: TripDetailsParams) {
  const { id } = await params;
  const trip = await getTrip(id);

  return (
    <section className="mx-auto max-w-screen-2xl">
      <Header>Trip Details</Header>
      {trip ? <TripDetail trip={trip} /> : null}
    </section>
  );
}
