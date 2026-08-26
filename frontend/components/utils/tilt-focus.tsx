"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

import type { HTMLAttributes, ReactNode } from 'react';

interface TiltFocusProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  angle?: number;
}

const TiltFocus = ({ className, children, direction = 'up', angle = 10, ...props }: TiltFocusProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const getTransform = () => {
    if (isFocused) return "perspective(1000px) rotateX(0deg) rotateY(0deg)";

    switch (direction) {
      case "up":
        return `perspective(1000px) rotateX(${angle}deg) rotateY(0deg)`;
      case "down":
        return `perspective(1000px) rotateX(-${angle}deg) rotateY(0deg)`;
      case "left":
        return `perspective(1000px) rotateX(0deg) rotateY(-${angle}deg)`;
      case "right":
        return `perspective(1000px) rotateX(0deg) rotateY(${angle}deg)`;
      default:
        return "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <div
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform outline-none",
        className
      )}
      style={{
        transform: getTransform(),
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export { TiltFocus };
export type { TiltFocusProps };
