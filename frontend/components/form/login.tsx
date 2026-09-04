"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link"

import { useState, type ComponentProps, type SubmitEvent } from "react"
import { login } from "@/services/auth-service";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (email && password) {
      login({ email, password }).then(({ success, error }) => {
        if (success) {
          router.replace('/trips');
          router.refresh();
        } else {
          setError(error);
        }
      }).finally(() => {
        setSubmitting(false);
      });
    }
  };

  return (

    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldSet disabled={submitting}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your <strong>KelanaAI</strong> account
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link href="recover-password"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input id="password" type="password" name="password" required />
                </Field>
                {error
                  ?
                  <Field>
                    <FieldError>{error}</FieldError>
                  </Field>
                  : null
                }
                <Field>
                  <Button type="submit">
                    {submitting ? <Spinner data-icon="inline-start" /> : null} Login
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/register">Sign up</Link>
                </FieldDescription>
              </FieldGroup>
            </FieldSet>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/images/trip.webp"
              alt="Black and grey DSLR camera near several photos on brown map"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-2 left-2 text-xs text-muted-foreground">
              Photo by <a className="underline" href="https://unsplash.com/@dariuszsankowski">Dariusz Sankowski</a>{' '}
              on <a className="underline" href="https://unsplash.com/photos/black-and-grey-dslr-camera-near-several-photos-on-brown-map-mj2NwYH3wBA">Unsplash</a>
            </span>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
