import { Footer } from "@/components/footer";
import { LoginForm } from "@/components/form/login"
import { VolleyballIcon } from "lucide-react";
import { Suspense } from "react";

export default async function LoginPage() {
  return (
    <section className="flex flex-col min-h-svh items-center justify-center bg-muted">
      <section className="flex w-full max-w-sm md:max-w-4xl flex-col gap-2 my-auto">
        <a href="/" className="flex items-center gap-1 self-center font-medium text-3xl">
            <VolleyballIcon className="size-8" />
            <div className="size-2xl font-logo">KelanaAI</div>
        </a>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </section>
      <Footer className="mx-auto mt-6" />
    </section>
  )
}
