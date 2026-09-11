"use client";

import Link from 'next/link';
import { ChevronRightIcon, CopyIcon, PlusIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// TODO: should be a shared type
interface SidebarIconProps {
  size?: number | string;
  className?: string;
}

interface SidebarTreeItem {
  id: string
  title: string
  url: string
  active?: boolean
}

interface SidebarTreeProps {
  prefix?: string
  actions?: ReactNode
  className?: string
  itemClassName?: string
  renderItemAction?: (id: string) => ReactNode
  title: string
  items?: SidebarTreeItem[]
  icon?: ReactNode
}

const SidebarTree = ({ prefix, actions, className, itemClassName,  items, renderItemAction, title, icon }: SidebarTreeProps) => {
  const pathname = usePathname();
  const open = prefix ? pathname.startsWith(prefix) : false;

  return (
    <Collapsible
      key={title}
      defaultOpen={open}
      className="group/collapsible"
      render={
        <SidebarMenuItem>
          <CollapsibleTrigger render={
            <SidebarMenuButton className={className} tooltip={title}>
              {icon}
              <span>{title}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </SidebarMenuButton>
          }>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-1">
              {items?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.id}>
                  <SidebarMenuSubButton isActive={subItem.active} className={itemClassName} render={
                    <Link href={subItem.url}>
                      <span title={subItem.title}>{subItem.title}</span>
                    </Link>
                  }>
                  </SidebarMenuSubButton>
                  {renderItemAction ? renderItemAction(subItem.id) : null }
                </SidebarMenuSubItem>
              ))}
              <SidebarMenuSubItem>
                {actions}
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      }
    >
    </Collapsible>
  )
}

export { SidebarTree };
export type { SidebarTreeProps, SidebarTreeItem };
