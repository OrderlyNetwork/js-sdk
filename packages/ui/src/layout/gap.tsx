import { cva } from "cva";
import { tv } from "tailwind-variants";
import { layoutVariants } from "./layout";

export const gapVariants = {
  // extend: layoutVariants,
  variants: {
    gap: {
      0: "oui-gap-0",
      1: "oui-gap-1",
      2: "oui-gap-2",
      3: "oui-gap-3",
      4: "oui-gap-4",
      5: "oui-gap-5",
      6: "oui-gap-6",
      8: "oui-gap-8",
      10: "oui-gap-10",
    },
    gapX: {
      0: "oui-gap-x-0",
      1: "oui-gap-x-1",
      2: "oui-gap-x-2",
      3: "oui-gap-x-3",
      4: "oui-gap-x-4",
      5: "oui-gap-x-5",
      6: "oui-gap-x-6",
      8: "oui-gap-x-8",
      10: "oui-gap-x-10",
    },
    gapY: {
      0: "oui-gap-y-0",
      1: "oui-gap-y-1",
      2: "oui-gap-y-2",
      3: "oui-gap-y-3",
      4: "oui-gap-y-4",
      5: "oui-gap-y-5",
      6: "oui-gap-y-6",
      8: "oui-gap-y-8",
      10: "oui-gap-y-10",
    },
  },
};