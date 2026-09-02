import { Assistant } from "@/components/assistant";
import { Navbar } from "@/components/navbar";
import { getProfile } from "@/services/auth-service";

export default async function AssistantPage() {
  const profile = await getProfile();

  return (
    <section className="flex flex-col flex-grow">
      <Navbar profile={profile} />
      <section className="flex flex-col flex-grow w-full mx-auto max-w-screen-2xl p-4">
        <Assistant
          className="flex-grow min-h-[calc(100vh-5.25rem)] max-h-[calc(100vh-5.25rem)]"
        />
      </section>
    </section>
  )
}
