import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { TripView } from '@/components/trip-view';
import { getProfile } from '@/services/auth-service';
import { getTrips } from '@/services/trip-service';

type TripsPageProps = {
  searchParams: Promise<{ query?: string, page?: number }>;
};

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const profile = await getProfile();
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || '';

  const tripsArgs = {
    search: query
  };

  const trips = query ? await getTrips(tripsArgs) : await getTrips();

  return (
    <section className="flex flex-col flex-grow">
      <Navbar profile={profile} />
      <section className="w-full mx-auto max-w-screen-2xl p-4">
        <Header>Trip History</Header>
        <TripView trips={trips.data} total={trips.total} page={1} />
      </section>
      <Footer className="mx-auto mt-auto" />
    </section>
  )
}
