import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/utils/css";

const TooltipProvider = TooltipPrimitive.Provider;

// const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "orderly-z-50 orderly-overflow-hidden orderly-rounded-md orderly-border orderly-bg-base-600 orderly-px-3 orderly-py-1.5 orderly-text-3xs orderly-text-popover-foreground orderly-shadow-md orderly-animate-in orderly-fade-in-0 orderly-zoom-in-95 data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=closed]:orderly-zoom-out-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export interface TooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  className?: string;
  content?: React.ReactNode;
}

const Tooltip: React.FC<
  TooltipProps & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
> = ({
  className,
  open,
  defaultOpen,
  onOpenChange,
  children,
  content,
  ...props
}) => {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        side="top"
        align="center"
        className={cn(
          "orderly-z-50 orderly-overflow-hidden orderly-rounded-md orderly-bg-base-400 orderly-px-3 orderly-py-1.5 orderly-text-3xs orderly-text-base-contrast orderly-shadow-md orderly-animate-in orderly-fade-in-0 orderly-zoom-in-95 data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=closed]:orderly-zoom-out-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow
          width={11}
          height={5}
          className="orderly-fill-popover"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
};

Tooltip.displayName = TooltipPrimitive.Root.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
