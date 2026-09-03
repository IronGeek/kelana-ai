import { VolleyballIcon } from "lucide-react"

import { RegisterForm } from "@/components/form/register"
import { Footer } from "@/components/footer"

export default function SignupPage() {
  return (
    <section className="flex flex-col min-h-svh items-center justify-center bg-muted">
      <section className="flex w-full max-w-sm flex-col gap-6 my-auto">
        <a href="/" className="flex items-center gap-1 self-center font-medium text-3xl">
            <VolleyballIcon className="size-8" />
            <div className="size-2xl font-logo">KelanaAI</div>
        </a>
        <RegisterForm />
      </section>
      <Footer className="mx-auto mt-6" />
    </section>
  )
}
