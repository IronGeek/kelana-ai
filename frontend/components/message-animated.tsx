"use client"

import { motion } from 'motion/react';
import { MessageScrollerItem } from '@/components/ui/message-scroller';
import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const MotionScrollerItem = motion.create(MessageScrollerItem)

interface MessageAnimatedProps extends ComponentPropsWithoutRef<typeof MotionScrollerItem> {
  animation?: "slide" | "fade" | "scale"
  isStreaming?: boolean
  assistantVariant?: string
  userVariant?: string
  onMessageRendered?: () => void
}

const animationVariants = {
  slide: { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  scale: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
};

const MessageAnimated = forwardRef<HTMLDivElement, MessageAnimatedProps>(
  ({ children, animation = "slide", isStreaming = false, onMessageRendered, ...props }, ref) => {

    const animate = animationVariants[animation];

    return (
      <MotionScrollerItem
        ref={ref}
        initial={isStreaming ? { opacity: 1 } : animate.initial}
        animate={animate.animate}
        exit={{ opacity: 0 }}
        transition={
          isStreaming
            ? { duration: 0 } // Langsung instant tanpa jeda spring
            : { type: "spring", stiffness: 400, damping: 30 } // Animasi halus untuk pesan biasa
        }
        {...props}
      >
        {children}
      </MotionScrollerItem>
    )
});

MessageAnimated.displayName = 'MessageAnimated';

export { MessageAnimated };
export type { MessageAnimatedProps };
