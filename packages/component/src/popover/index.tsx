"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/utils/css";
import { forwardRef } from "react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "orderly-z-50 orderly-w-72 orderly-rounded-md orderly-bg-base-800 orderly-p-4 orderly-text-base-contrast orderly-shadow-md orderly-outline-none data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
