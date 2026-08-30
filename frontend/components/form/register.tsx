"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react";

import { type ComponentProps, type SubmitEvent } from "react"
import { register } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";

export function RegisterForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name")?.toString() ?? '';
    const email = formData.get("email")?.toString() ?? '';
    const password = formData.get("password")?.toString().trim() ?? '';
    const confirm_password = formData.get("confirm_password");

    if (password.length < 8) {
      setError("Must be at least 8 characters long.");
    } else if (password !== confirm_password) {
      setError("Confirmation password does not match.");
    } else {
      setError(null);

      register({ name, email, password }).then((success) => {
        if (success) {
          router.replace('/login?registered=true');
          router.refresh;
        }
      }).finally(() => {
        setSubmitting(false);
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldSet disabled={submitting}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input id="name" type="text" name="name" placeholder="John Doe" required />
                </Field>
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
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input id="password" type="password" name="password" required />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                      </FieldLabel>
                      <Input id="confirm-password" type="password" name="confirm_password" required />
                    </Field>
                  </Field>
                  {error
                    ? <FieldDescription>{error} </FieldDescription>
                    : null
                  }
                </Field>
                <Field>
                  <Button type="submit" className="cursor-pointer">
                    { submitting ? <Spinner data-icon="inline-start" /> : null } Create Account
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account? <Link href="/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
