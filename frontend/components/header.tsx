import { cn } from "@/lib/utils";

import type { PropsWithChildren } from "react";

type HeaderProps = PropsWithChildren<{
  className?: string
}>

const Header = ({ className, children }: HeaderProps) => {
  return (
    <div className={cn('w-full py-8 px-4 text-3xl text-shadow-xs font-bold', className)}>{children}</div>
  );
};

export { Header };
