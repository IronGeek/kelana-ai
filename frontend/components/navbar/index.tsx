"use client";

import Link from "next/link";
import { LogInIcon, VolleyballIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileDropdown } from '@/components/navbar/dropdown/profile';
import { NavbarAvatar } from "@/components/navbar/avatar";
import { cn } from "@/lib/utils";

import type { UserProfile } from "@/types/trip";

interface NavbarProps {
  className?: string
  sidebar?: boolean
  profile?: UserProfile
}

const Navbar = ({ className, sidebar, profile }: NavbarProps) => {
  return (
    <header className={cn("bg-card sticky top-0 z-50 border-b", className)}>
      <div className="mx-auto flex items-center justify-between gap-6 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4">
          {sidebar
            ? <>
              <SidebarTrigger className="[&_svg]:size-5! cursor-pointer" />
              <Separator
                orientation="vertical"
                className="hidden h-4! sm:block self-center!"
              />
            </>
            : null
          }
          <Link className="flex items-center gap-1" href="/">
            <VolleyballIcon className="w-6 h-6" />
            <span className="text-2xl font-logo">KelanaAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          { profile
            ? <ProfileDropdown
                trigger={
                  <Button
                    id="profile-dropdown-trigger-05"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full cursor-pointer"
                    suppressHydrationWarning
                  >
                    <NavbarAvatar profile={profile} />
                  </Button>
                }
                profile={profile}
              />
            : <Link href="/login">
                <Button size="lg" className="cursor-pointer"><LogInIcon /> Login</Button>
              </Link>
          }
        </div>
      </div>
    </header>
  );
};

export { Navbar };
export type { NavbarProps };
