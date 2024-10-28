import { tv } from "tailwind-variants";

export const bodySizeVariants = tv({
  variants: {
    size: {
      xs: "oui-h-[22px]",
      sm: "oui-h-7",
      md: "oui-h-[34px]",
      lg: "oui-h-10",
      xl: "oui-h-12",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export const columnVariants = tv({
  variants: {
    align: {
      left: "oui-text-left",
      center: "oui-text-center",
      right: "oui-text-right",
    },
  },
  defaultVariants: {
    align: "left",
  },
});

export const headerSizeVariants = tv({
  variants: {
    size: {
      md: "oui-h-6",
      lg: "oui-h-10",
      xl: "oui-h-12",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});
