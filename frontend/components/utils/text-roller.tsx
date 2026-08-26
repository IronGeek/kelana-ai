"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

import type { ReactNode, ElementType } from 'react';

const greetings = [
  { text: "Initializing ...", color: "text-blue-500" },
  { text: "Fetching Data...", color: "text-orange-400" },
  { text: "Rendering...", color: "text-teal-400" },
  { text: "System Ready ", color: "text-sky-500" },
];

interface TextRollerProps<T extends ElementType> {
  as?: T
  className?: string
  prefix?: string
}

const TextRoller = <T extends ElementType = 'div'>({
  as,
  className,
  prefix
}: TextRollerProps<T>) => {
  const Component = as || 'div';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // const interval = setInterval(() => {
    //   setIndex((prev) => (prev + 1) % greetings.length);
    // }, 2000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <Component className={cn('inline-flex flex-row items-end gap-2')}>
      { prefix && <p className="text-foreground">
        {prefix}
      </p> }
      <div className="overflow-hidden h-12 text-center">
        <div
          className="transition-transform duration-700 ease-in-out"
          style={{ transform: `translateY(-${index * 4}rem)` }}
        >
          {greetings.map((g, i) => (
            <p
              key={i}
              className={cn(
                "flex h-12 items-center justify-end",
                g.color,
              )}
            >
              {g.text}
            </p>
          ))}
        </div>
      </div>
    </Component>
  );
};

export { TextRoller };
