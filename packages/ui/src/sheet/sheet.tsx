import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn, cnBase, tv, type VariantProps } from "tailwind-variants";
import { CloseIcon } from "../icon/close";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cnBase(
      "oui-fixed oui-inset-0 oui-z-50 oui-bg-black/80  data-[state=open]:oui-animate-in data-[state=closed]:oui-animate-out data-[state=closed]:oui-fade-out-0 data-[state=open]:oui-fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = tv({
  base: "oui-fixed oui-z-50 oui-gap-4 oui-bg-base-8 oui-px-4 oui-shadow-lg oui-transition oui-ease-in-out data-[state=closed]:oui-duration-260 data-[state=open]:oui-duration-300 data-[state=open]:oui-animate-in data-[state=closed]:oui-animate-out",
  variants: {
    side: {
      top: "oui-inset-x-0 oui-top-0 oui-border-b data-[state=closed]:oui-slide-out-to-top data-[state=open]:oui-slide-in-from-top",
      bottom:
        "oui-inset-x-0 oui-bottom-0 oui-rounded-t-2xl data-[state=closed]:oui-slide-out-to-bottom data-[state=open]:oui-slide-in-from-bottom",
      left: "oui-inset-y-0 oui-left-0 oui-h-full oui-w-3/4 data-[state=closed]:oui-slide-out-to-left data-[state=open]:oui-slide-in-from-left sm:oui-max-w-sm",
      right:
        "oui-inset-y-0 oui-right-0 oui-h-full oui-w-3/4 oui-border-l data-[state=closed]:oui-slide-out-to-right data-[state=open]:oui-slide-in-from-right sm:oui-max-w-sm",
    },
  },
  defaultVariants: {
    side: "bottom",
  },
});

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  // if true, show close button
  closeable?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { side = "bottom", closeable = true, className, children, ...props },
    ref,
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cnBase(sheetVariants({ side }), className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        {closeable && (
          <SheetPrimitive.Close
            className={cnBase(
              "oui-absolute oui-right-4 oui-top-4 oui-rounded-sm oui-ring-offset-base-700 oui-transition-opacity  focus:oui-outline-none focus:oui-ring-2 focus:oui-ring-ring focus:oui-ring-offset-2 disabled:oui-pointer-events-none data-[state=open]:oui-bg-secondary",
              // "oui-opacity-70 hover:oui-opacity-100"
            )}
          >
            <CloseIcon size={16} color="white" opacity={0.98} />
            <span className="oui-sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  leading,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  leading?: React.ReactNode;
}) => (
  <div
    className={cnBase(
      "oui-sheet-header oui-grid oui-grid-cols-[40px_1fr_40px] oui-items-center oui-min-h-12",
    )}
  >
    <div>{leading}</div>
    <div
      {...props}
      className={cnBase(
        "oui-flex oui-flex-col oui-space-y-2 oui-text-center oui-text-lg oui-text-base-contrast",
        className,
      )}
    />
  </div>
);
SheetHeader.displayName = "SheetHeader";

const SheetBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("oui-py-4", className)({ twMerge: true })} {...props} />
  );
};

SheetBody.displayName = "DialogBody";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cnBase(
      "oui-sheet-footer oui-flex oui-flex-col-reverse sm:oui-flex-row sm:oui-justify-end sm:oui-space-x-2",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & {
    leading?: React.ReactNode;
  }
>(({ className, leading, ...props }, ref) => (
  <div
    className="oui-sheet-header oui-grid oui-grid-cols-[40px_1fr_40px] oui-items-center"
    ref={ref}
  >
    <div>{leading}</div>
    <div
      className={cnBase(
        "oui-flex oui-flex-col oui-space-y-2 oui-text-center oui-text-lg oui-text-base-contrast",
        className,
      )}
      {...props}
    />
  </div>
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cnBase(
      "oui-sheet-description oui-text-2xs oui-text-base-contrast-54",
      className,
    )}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetBody,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
