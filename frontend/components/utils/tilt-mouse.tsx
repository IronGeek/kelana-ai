"use client";

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

import type { HTMLAttributes, ReactNode } from 'react';

interface TiltMouseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: number; // Semakin kecil angka, semakin miring (default: 15)
  className?: string;
}

const TiltMouse = ({ children, intensity = 15, className, ...props }: TiltMouseProps) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const box = cardRef.current.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;

    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const rotateX = -(y - centerY) / intensity;
    const rotateY = (x - centerX) / intensity;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "transition-transform duration-200 ease-out will-change-transform",
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export { TiltMouse };
export type { TiltMouseProps };
