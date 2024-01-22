import * as ProgressPrimitive from "@radix-ui/react-progress";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { cn } from "@/utils/css";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * @gradient solid
 */
type ProgressProps = {
  variant?: "solid" | "gradient";
  foregroundClassName?: string;
  backgoundClassName?: string;
};

const progressVariantsBg = cva("", {
  variants: {
    variant: {
      solid: "orderly-bg-base-contrast/[.072]",
      gradient:
        "orderly-bg-gradient-to-l \
      orderly-from-[rgba(28,246,180,0.2)] \
      orderly-via-[rgba(229,191,115,0.2)] \
      orderly-via-[rgba(229,210,115,0.2)] \
      orderly-via-[rgba(229,229,115,0.2)] \
      orderly-to-[rgba(255,77,130,0.2)]",
    },
  },
  defaultVariants: {
    variant: "solid",
  },
});

const progressVariantsFg = cva("", {
  variants: {
    variant: {
      solid: "orderly-bg-primary",
      gradient:
        "orderly-bg-gradient-to-r \
      orderly-from-[rgba(255,77,130,1)] \
      orderly-to-[rgba(28,246,180,1)]",
    },
  },
  defaultVariants: {
    variant: "solid",
  },
});

const Progress = forwardRef<
  ElementRef<typeof ProgressPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & ProgressProps
>(
  (
    {
      className,
      variant = "solid",
      backgoundClassName,
      foregroundClassName,
      value,
      ...props
    },
    ref
  ) => {
    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "orderly-relative orderly-h-[8px] orderly-w-full orderly-overflow-hidden orderly-rounded-full",
          backgoundClassName ?? progressVariantsBg({ variant })
        )}
        style={{
          // Fix overflow clipping in Safari
          // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
          transform: "translateZ(0)",
        }}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "orderly-h-full orderly-w-full orderly-flex-1 orderly-transition-all orderly-rounded-full",
            foregroundClassName ?? progressVariantsFg({ variant })
          )}
          style={{ width: `${value || 0}%` }}
        />
      </ProgressPrimitive.Root>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
