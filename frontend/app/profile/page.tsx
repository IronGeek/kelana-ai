
import { ProfileForm } from '@/components/form/profile';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { TripDetail } from '@/components/trip-detail';
import { getProfile } from '@/services/auth-service';

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <section>
      <Navbar profile={profile} />
      <section className="mx-auto max-w-screen-2xl">
        <Header>My Profile</Header>
        <ProfileForm profile={profile!} />
      </section>
    </section>
  );
}
