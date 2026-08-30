import type { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type DropdownIcon = LucideIcon;

type DropdownSeparator = {
  className?: string,
  label: '---',
  Icon?: undefined,
  destructive?: undefined
};

type DropdownItem = DropdownSeparator | {
  className?: string
  label: string
  Icon?: DropdownIcon
  destructive?: boolean
};

type DropdownGroup = DropdownItem | {
  label?: ReactNode;
  itemClass?: string
  separator?: boolean
  items?: DropdownItem[];
};

interface DropdownLanguageItem {
  label: string
  icon: string
  value: string
}

type MenuItem = {
  textColor: string;
  bgColor: string;
  Icon: DropdownIcon;
  title: string;
  desc: string;
  time: string;
};

export type { DropdownIcon, DropdownItem, DropdownGroup, DropdownSeparator, DropdownLanguageItem }
