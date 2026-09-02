import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

import type { UserProfile } from "@/types/trip";
import { DropdownMenuLabel } from "../ui/dropdown-menu";


interface NavbarAvatarProps {
  profile?: UserProfile
}

const NavbarAvatar = ({ profile }: NavbarAvatarProps) => {
  return profile ? (
    <Avatar className="size-7 rounded-full">
      <AvatarImage src={profile.picture ?? '/avatars/user.webp'} alt={profile.name} />
      <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
      <AvatarBadge className="bg-green-600 dark:bg-green-800"></AvatarBadge>
    </Avatar>
  ): null;
};

interface DropdownAvatarProps {
  profile?: UserProfile
}

const DropdownAvatar = ({ profile }: DropdownAvatarProps) => {
  return profile
    ? (
      <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
        <div className="relative">
          <Avatar className="size-10">
            <AvatarImage src={profile.picture} alt={profile.name} />
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <span className="ring-card absolute right-0 bottom-0 size-2 rounded-full bg-green-600 ring-2" />
        </div>

        <div className="flex flex-col">
          <span className="text-foreground text-lg font-semibold">
            {profile.name}
          </span>
          <span className="text-muted-foreground text-sm">
            {profile.email}
          </span>
        </div>
      </DropdownMenuLabel>
    )
    : null
};

export { NavbarAvatar, DropdownAvatar };
