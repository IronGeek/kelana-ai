import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";

interface NavbarButtonProps {
  label: string
  Icon: LucideIcon
  active?: boolean
  href?: string
}
const NavbarButton = ({
  active,
  label,
  Icon,
  href = "#",
}: NavbarButtonProps) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        active={active}
        render={
          <Link
            href={href}
            className="flex items-center py-1! rounded-none rounded-l-lg rounded-tr-lg  transition-colors data-active:bg-primary/80 data-active:text-primary-foreground"
          >
            <Icon />
            <span>{label}</span>
          </Link>
        }
      />
    </NavigationMenuItem>
  );
}

export { NavbarButton };
export type { NavbarButtonProps };
