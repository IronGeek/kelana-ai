
import { Footer } from '@/components/footer';
import { ProfileForm } from '@/components/form/profile';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { TripDetail } from '@/components/trip-detail';
import { getProfile } from '@/services/auth-service';

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <section className="flex flex-col flex-grow">
      <Navbar profile={profile} />
      <section className="w-full mx-auto max-w-screen-2xl p-4">
        <Header>My Profile</Header>
        <ProfileForm profile={profile!} />
      </section>
      <Footer className="mx-auto mt-auto" />
    </section>
  );
}
