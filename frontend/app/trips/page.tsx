import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { TripView } from '@/components/trip-view';
import { getProfile } from '@/services/auth-service';

export default async function TripsPage() {
  const profile = await getProfile();

  return (
    <section>
      <Navbar profile={profile} />
      <section className="mx-auto max-w-screen-2xl h-full">
        <Header>Trip History</Header>
        <TripView profile={profile} />
      </section>
    </section>
  )
}
