import { Navbar } from '@/components/navbar';
import { AppSidebar, SidebarProvider } from '@/components/sidebar';

export default function Page() {
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex h-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm md:max-w-2xl flex-col gap-6">
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
