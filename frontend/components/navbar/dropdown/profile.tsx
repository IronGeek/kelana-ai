"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon, UserPlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownAvatar } from "@/components/navbar/avatar";
import { logout } from "@/services/auth-service";
import { UserProfile } from "@/types/trip";

import type { ReactElement } from 'react';

interface ProfileDropdownProps {
  trigger: ReactElement
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
  profile: UserProfile | undefined
}

const ProfileDropdown = ({
  trigger,
  defaultOpen,
  align = "end",
  profile
}: ProfileDropdownProps) => {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()

    router.refresh()
    router.replace('/')
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />

      <DropdownMenuContent className="w-80 bg-card" align={align}>
        <DropdownMenuGroup>
          <DropdownAvatar profile={profile} />
          <DropdownMenuSeparator />
          <DropdownMenuItem className="px-4 py-2.5 cursor-pointer gap-3" onClick={() => router.push("/profile")}>
            <UserPlusIcon size={20} className="text-foreground" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="px-4 py-2.5 cursor-pointer gap-3"
          variant="destructive"
          onClick={handleLogout}
        >
          <LogOutIcon size={20} className="text-foreground" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ProfileDropdown };
export type { ProfileDropdownProps };
