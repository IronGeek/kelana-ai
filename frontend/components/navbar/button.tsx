import type { LucideIcon } from "lucide-react";
import { NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";

interface NavbarButtonProps {
  label: string;
  Icon: LucideIcon;
  href?: string;
}
const NavbarButton = ({
  label,
  Icon,
  href = "#",
}: NavbarButtonProps) => {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        render={
          <a
            href={href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <Icon size={16} />
            <span className="text-sm">{label}</span>
          </a>
        }
      />
    </NavigationMenuItem>
  );
}

export { NavbarButton };
export type { NavbarButtonProps };
