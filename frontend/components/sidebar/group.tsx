import {
  SidebarGroup as SidebarGroupBase,
  SidebarGroupLabel,
  SidebarMenu
} from '@/components/ui/sidebar';

import type { ComponentProps, ReactNode } from 'react';

interface SidebarGroupProps extends ComponentProps<typeof SidebarGroupBase> {
  label: ReactNode
}

const SidebarGroup = ({ children, label, ...props }: SidebarGroupProps) => {
  return (
    <SidebarGroupBase {...props}>
      <SidebarGroupLabel className="text-sm!">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {children}
      </SidebarMenu>
    </SidebarGroupBase>
  )
}

export { SidebarGroup };
export type { SidebarGroupProps };
