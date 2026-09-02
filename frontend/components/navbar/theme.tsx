"use client"

import { useTheme } from "next-themes"
import { Toggle } from "@/components/ui/toggle"
import { ThemeIcon } from "@/components/icon/theme";
import { useEffect, useState } from "react";

interface ThemeTogglerProps{
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | null
}

const ThemeToggler =({ className, variant }: ThemeTogglerProps) => {
  const [mounted, setMounted] = useState(false);
  const { systemTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true)
  }, []);

  if (!mounted) {
    return (
      <Toggle
        className={className}
        variant={variant as "default" | "outline" | null | undefined}
        pressed={false}
        disabled
      >
        <ThemeIcon className="size-4.5" />
      </Toggle>
    )
  }

  return (
    <Toggle
      className={className}
      variant={variant as "default" | "outline" | null | undefined}
      pressed={systemTheme === 'dark'}
      onClick={() => setTheme((prev) => prev === 'dark' ? 'light': 'dark') }
    >
      <ThemeIcon className="size-4.5" />
    </Toggle>
  )
};

export { ThemeToggler };
export type { ThemeTogglerProps };

