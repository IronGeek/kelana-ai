import { cn } from '@/lib/utils';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';

import type { ComponentProps } from 'react';

type SidebarTreeActionProps = useRender.ComponentProps<"button"> & ComponentProps<"button"> & { showOnHover?: boolean };

const SidebarTreeAction = ({
  className,
  render,
  showOnHover = false,
  ...props
}: SidebarTreeActionProps) => {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-1 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground",
          // "peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1
          "after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-sub-item:opacity-100 group-hover/menu-sub-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-action",
      sidebar: "menu-sub-action",
    },
  })
};

export { SidebarTreeAction };
export type { SidebarTreeActionProps };
