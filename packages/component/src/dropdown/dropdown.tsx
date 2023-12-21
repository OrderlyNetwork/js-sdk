import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/utils/css";
import { ArrowIcon } from "@/icon";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "orderly-flex orderly-cursor-default orderly-select-none orderly-items-center orderly-rounded-sm orderly-px-2 orderly-py-1.5 orderly-text-3xs orderly-outline-none focus:orderly-bg-accent data-[state=open]:orderly-bg-accent",
      inset && "orderly-pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ArrowIcon size={12} />
    {/* <ChevronRightIcon className="orderly-ml-auto orderly-h-4 orderly-w-4" /> */}
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "orderly-z-50 orderly-min-w-[8rem] orderly-overflow-hidden orderly-rounded orderly-border orderly-bg-base-600 orderly-p-1 orderly-text-popover-foreground orderly-shadow-lg data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    container?: HTMLElement;
  }
>(({ className, sideOffset = 4, container, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal container={container}>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "orderly-z-50 orderly-min-w-[8rem] orderly-overflow-hidden orderly-rounded orderly-bg-base-600 orderly-p-1 orderly-text-popover-foreground orderly-shadow-md orderly-py-2",
        "data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "orderly-relative orderly-flex orderly-cursor-pointer orderly-select-none orderly-items-center orderly-rounded-sm orderly-px-2 orderly-py-2 orderly-text-3xs orderly-outline-none orderly-transition-colors focus:orderly-bg-base-700 data-[disabled]:orderly-pointer-events-none data-[disabled]:orderly-opacity-50 [data-highlighted]:orderly-bg-base-700",
      inset && "orderly-pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "orderly-relative orderly-flex orderly-cursor-default orderly-select-none orderly-items-center orderly-rounded-sm orderly-py-1.5 orderly-pl-8 orderly-pr-2 orderly-text-3xs orderly-outline-none orderly-transition-colors focus:orderly-bg-accent focus:orderly-text-accent-foreground data-[disabled]:orderly-pointer-events-none data-[disabled]:orderly-opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="orderly-absolute orderly-left-2 orderly-flex orderly-h-3.5 orderly-w-3.5 orderly-items-center orderly-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        {/* <CheckIcon className="orderly-h-4 orderly-w-4" /> */}
        <ArrowIcon size={12} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "orderly-relative orderly-flex orderly-cursor-default orderly-select-none orderly-items-center orderly-rounded-sm orderly-py-1.5 orderly-pl-8 orderly-pr-2 orderly-text-3xs orderly-outline-none orderly-transition-colors focus:orderly-bg-accent focus:orderly-text-accent-foreground data-[disabled]:orderly-pointer-events-none data-[disabled]:orderly-opacity-50",
      className
    )}
    {...props}
  >
    <span className="orderly-absolute orderly-left-2 orderly-flex orderly-h-3.5 orderly-w-3.5 orderly-items-center orderly-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        {/* <DotFilledIcon className="orderly-h-4 orderly-w-4 orderly-fill-current" /> */}
        <ArrowIcon size={12} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "orderly-px-2 orderly-py-1.5 orderly-text-3xs orderly-font-semibold",
      inset && "orderly-pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "-orderly-mx-1 orderly-my-1 orderly-h-px orderly-bg-muted",
      className
    )}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "orderly-ml-auto orderly-text-4xs orderly-tracking-widest orderly-opacity-60",
        className
      )}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
