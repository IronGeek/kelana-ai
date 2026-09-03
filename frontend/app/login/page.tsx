"use client";

import { Footer } from "@/components/footer";
import { LoginForm } from "@/components/form/login"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowAlert(true);
    }
  }, [searchParams]);

  useEffect(() => {
    router.replace('/login');
  }, []);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  return (
    <section className="flex flex-col min-h-svh items-center justify-center bg-muted">
      <section className="flex w-full max-w-sm md:max-w-4xl flex-col gap-6 my-auto">
        {showAlert && (
          <Alert className="relative mb-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <CheckCircle2Icon className="h-4 w-4" />
            <AlertTitle className="font-semibold">
              Registration successful!
            </AlertTitle>
            <AlertDescription>
              Please log in with your new credentials.
            </AlertDescription>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={handleDismiss}
              aria-label="Dismiss alert"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        <LoginForm />
      </section>
      <Footer className="mx-auto mt-6" />
    </section>
  )
}
