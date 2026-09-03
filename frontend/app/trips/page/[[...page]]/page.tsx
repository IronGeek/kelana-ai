import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { TripView } from '@/components/trip-view';
import { getProfile } from '@/services/auth-service';
import { getTrips, tripItemsPerPage } from '@/services/trip-service';

type TripsPageProps = {
  params: Promise<{ page?: string[] }>;
  searchParams: Promise<{ query?: string }>;
};

export default async function TripsPage({ params, searchParams }: TripsPageProps) {
  const profile = await getProfile();
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);

  const pageArray = resolvedParams.page || [];
  const query = resolvedSearchParams.query || '';

  const pageString = pageArray[0] || '1';
  const currentPage = Math.max(1, parseInt(pageString, 10));

  const tripsArgs = {
    search: query ?? '',
    page: {
      index: currentPage,
      size: tripItemsPerPage
    }
  };

  const trips = await getTrips(tripsArgs);

  return (
    <section className="flex flex-col min-h-[100vh]">
      <Navbar profile={profile} />
      <section className="w-full mx-auto max-w-screen-2xl p-4">
        <Header>Trip History</Header>
        <TripView trips={trips.data} total={trips.total} page={currentPage} />
      </section>
      <Footer className="mx-auto mt-auto" />
    </section>
  )
}
