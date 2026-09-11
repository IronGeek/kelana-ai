import {
  BotMessageSquareIcon,
  PlaneIcon,
  PlusIcon,
} from "lucide-react"
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarLogo } from '@/components/sidebar/logo';
import { SidebarGroup } from '@/components/sidebar/group';
import { SidebarTree, SidebarTreeItem } from "./tree"

import type { ComponentProps } from 'react';
import { NewTripDialog } from "@/components/dialog/new-trip";

interface SidebarProps extends ComponentProps<typeof SidebarBase> {
  conversations?: SidebarTreeItem[]
  trips?: SidebarTreeItem[]
}

export function Sidebar({ conversations, trips, ...props }: SidebarProps) {
  return (
    <SidebarBase collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup label="Trips">
          <SidebarTree
            className="font-bold"
            prefix="/trips"
            title="Trips"
            itemClassName="font-mono text-xs! data-active:bg-primary/80 data-active:hover:bg-primary data-active:text-primary-foreground data-active:hover:text-primary-foreground"
            icon={<PlaneIcon />}
            items={trips}
            actions={
              <NewTripDialog nativeButton={false} trigger={
                <SidebarMenuSubButton className="group/sidebar-action w-fit! cursor-pointer border-1 border-dashed rounded-lg gap-0">
                  <PlusIcon />
                  <span
                    className="
                      max-w-0 opacity-0 overflow-hidden whitespace-nowrap
                      transition-all duration-200 ease-out
                      group-hover/sidebar-action:max-w-xs
                      group-hover/sidebar-action:opacity-100
                      group-hover/sidebar-action:ml-2"
                  >
                    New Trip
                  </span>
                </SidebarMenuSubButton>}
              />
            }
          />
        </SidebarGroup>

        <SidebarGroup label="AI Chat">
          <SidebarTree
            className="font-bold"
            prefix="/chat"
            title="Conversations"
            itemClassName="font-mono text-xs! data-active:bg-primary/80 data-active:hover:bg-primary data-active:text-primary-foreground data-active:hover:text-primary-foreground"
            icon={<BotMessageSquareIcon />}
            items={conversations}
            actions={
              <SidebarMenuSubButton className="group/sidebar-action w-fit! cursor-pointer border-1 border-dashed rounded-lg gap-0">
                <PlusIcon />
                <span
                  className="
                    max-w-0 opacity-0 overflow-hidden whitespace-nowrap
                    transition-all duration-200 ease-out
                    group-hover/sidebar-action:max-w-xs
                    group-hover/sidebar-action:opacity-100
                    group-hover/sidebar-action:ml-2"
                >
                  New Conversation
                </span>
              </SidebarMenuSubButton>
            }
          />
        </SidebarGroup>
        {/* <NavProjects projects={data.projects} /> */}

      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </SidebarBase>
  )
}
