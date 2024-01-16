"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/utils";

const HoverCardRoot = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "orderly-z-[100] orderly-w-64 orderly-rounded-md orderly-bg-base-400 orderly-p-4 orderly-text-base-contrast orderly-shadow-md orderly-outline-none data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export interface HoverCardProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {
  className?: string;
  content: React.ReactNode;
}

const HoverCard: React.FC<
  HoverCardProps &
    React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
> = (props) => {
  const { content, open, defaultOpen, onOpenChange, children, ...rest } = props;
  return (
    <HoverCardRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardPrimitive.Portal>
        <HoverCardContent {...rest}>
          {content}
          <HoverCardPrimitive.Arrow
            width={11}
            height={5}
            className="orderly-fill-base-400"
          />
        </HoverCardContent>
      </HoverCardPrimitive.Portal>
    </HoverCardRoot>
  );
};

HoverCard.displayName = "HoverCard";

export { HoverCard, HoverCardRoot, HoverCardTrigger, HoverCardContent };
