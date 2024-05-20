import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { VariantProps, tv } from "tailwind-variants";

const tabsVariants = tv({
  slots: {
    list: [
      "oui-inline-flex",
      //   "oui-h-9",
      "oui-items-center",
      "oui-p-1",
      "oui-space-x-6",
    ],
    content: [
      "oui-ring-offset-background",
      "focus-visible:oui-outline-none",
      "focus-visible:oui-ring-2",
      "focus-visible:oui-ring-ring",
      "focus-visible:oui-ring-offset-2",
    ],
    trigger: [
      "oui-inline-flex",
      "oui-items-center",
      "oui-justify-center",
      "oui-whitespace-nowrap",
      //   "oui-px-3",
      "oui-pb-2",
      "oui-box-content",
      "oui-font-medium",
      "oui-relative",
      "oui-text-base-contrast-36",
      "oui-ring-offset-background",
      "oui-transition-all",
      "oui-space-x-1",
      "focus-visible:oui-outline-none",
      "focus-visible:oui-ring-2",
      "focus-visible:oui-ring-ring",
      "focus-visible:oui-ring-offset-2",
      "disabled:oui-pointer-events-none",
      "disabled:oui-opacity-50",
      "data-[state=active]:oui-text-base-contrast",
      "data-[state=active]:after:oui-content-['']",
      "data-[state=active]:after:oui-block",
      "data-[state=active]:after:oui-h-[3px]",
      "data-[state=active]:after:oui-bg-white",
      "data-[state=active]:after:oui-absolute",
      "data-[state=active]:after:oui-rounded-full",
      "data-[state=active]:after:-oui-bottom-0",
      "data-[state=active]:after:oui-left-0",
      "data-[state=active]:after:oui-right-0",
    ],
    icon: ["oui-text-inherit"],
  },
  variants: {
    size: {
      sm: {
        trigger: ["oui-text-sm", "oui-h-5"],
        icon: ["oui-w-[10px]", "oui-h-[10px]"],
      },
      md: {
        trigger: ["oui-text-base", "oui-h-6"],
        icon: ["oui-w-3", "oui-h-3"],
      },
      lg: {
        trigger: ["oui-text-lg", "oui-h-7"],
        icon: ["oui-w-4", "oui-h-4"],
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsVariants>
>(({ className, size, ...props }, ref) => {
  const { list } = tabsVariants({ size });
  return (
    <TabsPrimitive.List ref={ref} className={list({ className })} {...props} />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsVariants> & {
      icon?: React.ReactElement;
    }
>(({ className, size, children, icon, ...props }, ref) => {
  const { trigger, icon: iconClassName } = tabsVariants({ size });
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={trigger({ className })}
      {...props}
    >
      {typeof icon !== "undefined"
        ? React.cloneElement(icon, { className: iconClassName(), opacity: 1 })
        : null}
      <span>{children}</span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
    VariantProps<typeof tabsVariants>
>(({ className, size, ...props }, ref) => {
  const { content } = tabsVariants({ size });
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={content({ className })}
      {...props}
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
