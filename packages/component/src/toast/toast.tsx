import * as React from "react";
// @ts-ignore
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/utils/css";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "orderly-fixed orderly-top-0 orderly-z-[100] orderly-flex orderly-max-h-screen orderly-w-full orderly-flex-col-reverse orderly-p-4 sm:orderly-bottom-0 sm:orderly-right-0 sm:orderly-top-auto sm:orderly-flex-col desktop:orderly-max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "orderly-group orderly-pointer-events-auto orderly-relative orderly-flex orderly-w-full orderly-items-center orderly-justify-between orderly-space-x-2 orderly-overflow-hidden orderly-rounded-md orderly-border orderly-p-4 orderly-pr-6 orderly-shadow-lg orderly-transition-all data-[swipe=cancel]:orderly-translate-x-0 data-[swipe=end]:orderly-translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:orderly-translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:orderly-transition-none data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[swipe=end]:orderly-animate-out data-[state=closed]:orderly-fade-out-80 data-[state=closed]:orderly-slide-out-to-right-full data-[state=open]:orderly-slide-in-from-top-full data-[state=open]:sm:orderly-slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "orderly-border orderly-bg-background orderly-text-foreground",
        destructive:
          "orderly-destructive orderly-group orderly-border-destructive orderly-bg-destructive orderly-text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "orderly-inline-flex orderly-h-8 orderly-shrink-0 orderly-items-center orderly-justify-center orderly-rounded-md orderly-border orderly-bg-transparent orderly-px-3 orderly-text-3xs orderly-font-medium orderly-transition-colors hover:orderly-bg-secondary focus:orderly-outline-none focus:orderly-ring-1 focus:orderly-ring-ring disabled:orderly-pointer-events-none disabled:orderly-opacity-50 group-[.destructive]:orderly-border-muted/40 group-[.destructive]:hover:orderly-border-destructive/30 group-[.destructive]:hover:orderly-bg-destructive group-[.destructive]:hover:orderly-text-destructive-foreground group-[.destructive]:focus:orderly-ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "orderly-absolute orderly-right-1 orderly-top-1 orderly-rounded-md orderly-p-1 orderly-text-foreground/50 orderly-opacity-0 orderly-transition-opacity hover:orderly-text-foreground focus:orderly-opacity-100 focus:orderly-outline-none focus:orderly-ring-1 group-hover:orderly-opacity-100 group-[.destructive]:orderly-text-red-300 group-[.destructive]:hover:orderly-text-red-50 group-[.destructive]:focus:orderly-ring-red-400 group-[.destructive]:focus:orderly-ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="orderly-h-4 orderly-w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("orderly-text-3xs orderly-font-semibold [&+div]:orderly-text-4xs", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("orderly-text-3xs orderly-opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
