import Link from 'next/link';
import { ChevronRightIcon, CopyIcon, PlusIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';

import type { ComponentType, ReactNode } from 'react';

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
  active?: boolean
  actions?: ReactNode
  className?: string
  itemClassName?: string
  renderItemAction?: (id: string) => ReactNode
  title: string
  items?: SidebarTreeItem[]
  Icon?: ComponentType<SidebarIconProps>
}

const SidebarTree = ({ active, actions, className, itemClassName,  items, renderItemAction, title, Icon }: SidebarTreeProps) => {
  return (
    <Collapsible
      key={title}
      defaultOpen={active}
      className="group/collapsible"
      render={
        <SidebarMenuItem>
          <CollapsibleTrigger render={
            <SidebarMenuButton className={className} tooltip={title}>
              {Icon && <Icon />}
              <span>{title}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </SidebarMenuButton>
          }>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-1">
              {items?.map((subItem) => (
                <SidebarMenuSubItem className="" key={subItem.id}>
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
