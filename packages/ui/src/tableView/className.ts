import { tv } from "tailwind-variants";

export const tableVariants = tv({
  variants: {
    size: {
      sm: "oui-h-7",
      md: "oui-h-10",
      lg: "oui-h-12",
    },
  },
  defaultVariants: {
    size: "md",
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
