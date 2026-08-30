import { VolleyballIcon } from "lucide-react"

import { RegisterForm } from "@/components/form/register"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-1 self-center font-medium text-3xl">
            <VolleyballIcon className="size-8" />
            <div className="size-2xl font-logo">KelanaAI</div>
        </a>
        <RegisterForm />
      </div>
    </div>
  )
}
