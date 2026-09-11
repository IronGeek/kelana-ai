import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatRelative } from 'date-fns';
import { countTokens as ct } from 'gpt-tokenizer';
import { encode, uuidv7 } from "@/lib/short-uuid";

import type { ChatMessage } from "gpt-tokenizer/functionCalling";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffle<T>(array: T[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !deepEqual(a[key], b[key])
    ) {
      return false;
    }
  }

  return true;
}

export const getInitials = (name: string) => {
  if (!name) { return ''; }

  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0].toUpperCase())
    .join('');
};

export const countTokens = <T extends Partial<ChatMessage>>(str: string | readonly T[]): number => {
  return (typeof str === 'string')
    ? ct(str)
    : str.reduce((acc, s) => acc + (s.content ? ct(s.content) : 0), 0);
};

export const formatDate = (d?: Date | string, base: Date = new Date()): string => {
  if (!d) return '';

  const date = d instanceof Date ? d : new Date(d);
  const str = formatRelative(date, base);
  if (!str) return '';

  return str;
}

export const delay = async (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => { resolve(); }, 1000);
  });
};
