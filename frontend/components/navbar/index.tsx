"use client";

import Link from "next/link";
import { BotMessageSquareIcon, LogInIcon, PersonStandingIcon, PlaneIcon, VolleyballIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileDropdown } from '@/components/navbar/dropdown/profile';
import { NavbarAvatar } from "@/components/navbar/avatar";
import { cn } from "@/lib/utils";

import type { UserProfile } from "@/types/trip";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { NavbarButton } from "@/components/navbar/button";
import { ThemeToggler } from "@/components/navbar/theme";
import { useParams, usePathname } from "next/navigation";

interface NavbarProps {
  className?: string
  sidebar?: boolean
  profile?: UserProfile
}

const Navbar = ({ className, sidebar, profile }: NavbarProps) => {
  const pathname = usePathname();
  console.log()
  return (
    <header className={cn("bg-card sticky top-0 z-50 border-b h-12", className)}>
      <div className="h-full mx-auto flex items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {sidebar
            ? <>
              <SidebarTrigger className="cursor-pointer" />
              <Separator
                orientation="vertical"
                className="h-4 sm:block !self-center"
              />
            </>
            : null
          }
          <NavigationMenu>
            {profile
              ? <NavigationMenuList className="gap-2">
                <NavbarButton
                  active={/^\/trips\/?/.test(pathname)}
                  label="Trips"
                  Icon={PlaneIcon}
                  href="/trips"
                />
                <NavbarButton
                  active={/^\/chat\/?/.test(pathname)}
                  label="Chat"
                  Icon={BotMessageSquareIcon}
                  href="/chat"
                />
                <NavbarButton
                  active={/^\/assistant\/?/.test(pathname)}
                  label="Assistant"
                  Icon={PersonStandingIcon}
                  href="/assistant"
                />
              </NavigationMenuList>
              : null}
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggler variant="ghost" className="cursor-pointer" />
          {profile
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
