
import { Footer } from '@/components/footer';
import { ProfileForm } from '@/components/form/profile';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { init } from '@/lib/init';

export default async function ProfilePage() {
  const { sidebarOpen, sidebarItems, profile } = await init();

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
          <section className="w-full mx-auto max-w-screen-2xl p-4">
            <Header>My Profile</Header>
            <ProfileForm profile={profile!} />
          </section>
        </section>
        <Footer className="mx-auto mt-auto" navbar={true} />
      </SidebarInset>
    </SidebarProvider>
  );
}
