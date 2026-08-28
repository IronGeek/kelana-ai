import { Header } from '@/components/header';
import { TripView } from '@/components/trip-view';
import { getTrips } from '@/services/trip-service';

export default async function TripsPage() {
  return (
    <section className="mx-auto max-w-screen-2xl h-full">
      <Header>Trip History</Header>
      <TripView trips={[]} />
    </section>
  )
}
