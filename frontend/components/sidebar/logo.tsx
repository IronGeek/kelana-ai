import { VolleyballIcon } from 'lucide-react';
import Link from 'next/link';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import type { ComponentProps } from 'react';

type SidebarLogoProps = ComponentProps<typeof SidebarMenu>;

const SidebarLogo = ({ ...props }: SidebarLogoProps) => {
  return (
    <SidebarMenu {...props}>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="p-1 hover:bg-transparent! hover:text-current! group-data-[state=collapsed]:p-1!"
          render={<Link href="/" />}
        >
          <div className="flex items-center gap-1 w-full h-full p-0">
            <VolleyballIcon className="h-6! w-6!" />
            <span className="font-logo text-2xl">KelanaAI</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>)
}

export { SidebarLogo };
export type { SidebarLogoProps };
