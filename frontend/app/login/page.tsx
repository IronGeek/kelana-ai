"use client";

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
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
      </div>
    </div>
  )
}
