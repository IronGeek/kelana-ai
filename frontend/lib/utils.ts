import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatRelative } from 'date-fns';
import { countTokens as ct } from 'gpt-tokenizer';
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

export const uuidv7 = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Prepend current Unix timestamp in milliseconds (48 bits)
  const timestamp = Date.now();
  bytes[0] = (timestamp / 0x10000000000) & 0xff;
  bytes[1] = (timestamp / 0x100000000) & 0xff;
  bytes[2] = (timestamp / 0x1000000) & 0xff;
  bytes[3] = (timestamp / 0x10000) & 0xff;
  bytes[4] = (timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  // Enforce Version 7 and Variant 1 rules
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // Set version to 0111 (7)
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Set variant to 10xx

  // Stringify the byte array
  return [...bytes].map((b, i) => {
    let s = b.toString(16).padStart(2, '0');
    if ([3, 5, 7, 9].includes(i)) s += '-';
    return s;
  }).join('');
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
