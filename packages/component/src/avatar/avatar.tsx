import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/utils/css";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva([], {
  variants: {
    size: {
      small: "orderly-h-[18px] orderly-w-[18px]",
      medium: "orderly-h-[24px] orderly-w-[24px]",
      large: "orderly-h-[32px] orderly-w-[32px]",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "orderly-relative orderly-flex orderly-h-10 orderly-w-10 orderly-shrink-0 orderly-overflow-hidden orderly-rounded-full",
      avatarVariants({ size, className })
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("orderly-aspect-square orderly-h-full orderly-w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "orderly-flex orderly-h-full orderly-w-full orderly-items-center orderly-justify-center orderly-rounded-full orderly-bg-base-200",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
