import { tv } from "tailwind-variants";

export const alignVariants = tv({
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
