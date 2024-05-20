import React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { tv, type VariantProps } from "tailwind-variants";

const scrollAreaVariants = tv({
  slots: {
    root: "oui-relative oui-overflow-hidden",
    viewport: "oui-h-full oui-w-full oui-rounded-[inherit]",
    bar: [
      "oui-flex",
      "oui-touch-none",
      "oui-select-none",
      "oui-transition-colors",
    ],
    tumb: "oui-relative oui-flex-1 oui-rounded-full oui-bg-base-1",
  },
  variants: {
    orientation: {
      vertical: {
        bar: "oui-h-full oui-w-2.5 oui-border-l oui-border-l-transparent oui-p-[1px]",
      },

      horizontal: {
        bar: "oui-h-2.5 oui-flex-col oui-border-t oui-border-t-transparent oui-p-[1px]",
      },
    },
  },
});

interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
    VariantProps<typeof scrollAreaVariants> {}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, orientation = "vertical", ...props }, ref) => {
  const { root, viewport, bar } = scrollAreaVariants({
    // className,
    orientation,
  });

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={root({ className })}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className={viewport()}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => {
  const { bar, tumb } = scrollAreaVariants({ className, orientation });
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={bar({ className })}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className={tumb()} />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar, scrollAreaVariants };

export { type ScrollAreaProps };
