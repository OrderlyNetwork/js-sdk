import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/css";
import { CloseIcon } from "@/icon";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = ({
  className,
  ...props
}: SheetPrimitive.DialogPortalProps) => (
  <SheetPrimitive.Portal className={cn(className)} {...props} />
);
SheetPortal.displayName = SheetPrimitive.Portal.displayName;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "orderly-sheet-overlay orderly-fixed orderly-inset-0 orderly-z-50 orderly-bg-black/60 orderly-backdrop-blur-sm data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "orderly-fixed orderly-z-50 orderly-gap-4 orderly-bg-base-700 orderly-p-[20px] orderly-shadow-lg orderly-transition orderly-ease-in-out data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-duration-260 data-[state=open]:orderly-duration-300",
  {
    variants: {
      side: {
        top: "orderly-inset-x-0 orderly-top-0 orderly-border-b data-[state=closed]:orderly-slide-out-to-top data-[state=open]:orderly-slide-in-from-top",
        bottom:
          "orderly-inset-x-0 orderly-bottom-0 orderly-rounded-t-2xl data-[state=closed]:orderly-slide-out-to-bottom data-[state=open]:orderly-slide-in-from-bottom",
        left: "orderly-inset-y-0 orderly-left-0 orderly-h-full orderly-w-3/4 data-[state=closed]:orderly-slide-out-to-left data-[state=open]:orderly-slide-in-from-left sm:orderly-max-w-sm",
        right:
          "orderly-inset-y-0 orderly-right-0 orderly-h-full orderly-w-3/4 orderly-border-l data-[state=closed]:orderly-slide-out-to-right data-[state=open]:orderly-slide-in-from-right sm:orderly-max-w-sm",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  //是否显示关闭按钮
  closeable?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { side = "bottom", closeable = true, className, children, ...props },
    ref
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          "orderly-sheet-content",
          sheetVariants({ side }),
          className
        )}
        {...props}
      >
        {children}
        {closeable && (
          <SheetPrimitive.Close className="orderly-absolute orderly-right-[24px] orderly-top-[24px] orderly-rounded-sm orderly-opacity-70 orderly-ring-offset-base-700 orderly-transition-opacity hover:orderly-opacity-100 focus:orderly-outline-none focus:orderly-ring-2 focus:orderly-ring-ring focus:orderly-ring-offset-2 disabled:orderly-pointer-events-none data-[state=open]:orderly-bg-secondary">
            <CloseIcon size={20} />
            <span className="orderly-sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  leading,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  leading?: React.ReactNode;
}) => (
  <div className="orderly-sheet-header orderly-grid orderly-grid-cols-[40px_1fr_40px] orderly-items-center">
    <div>{leading}</div>
    <div
      className={cn(
        "orderly-flex orderly-flex-col orderly-space-y-2 orderly-text-center orderly-text-lg orderly-text-base-contrast",
        className
      )}
      {...props}
    />
  </div>
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "orderly-sheet-footer orderly-flex orderly-flex-col-reverse sm:orderly-flex-row sm:orderly-justify-end sm:orderly-space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "orderly-sheet-title orderly-text-lg orderly-text-base-contrast",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(
      "orderly-sheet-description orderly-text-2xs orderly-text-base-contrast-54",
      className
    )}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
