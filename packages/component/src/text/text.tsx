import { FC, HTMLAttributes, PropsWithChildren } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { TradingPair } from "./tradingPair";

const textVariants = cva([], {
  variants: {
    variant: {},
    type: {
      primary: "text-primary",
      secondary: "text-gray-500",
      tertiary: "text-gray-400",
      quaternary: "text-gray-300",
      warning: "text-warning",
      danger: "text-danger",
      success: "text-success",
    },
  },
});

export interface TextProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  asChildren?: boolean;
}
const Text: FC<PropsWithChildren<TextProps>> = (props) => {
  return <span></span>;
};

export type CombinedText = typeof Text & {
  tradingPair: typeof TradingPair;
};

(Text as CombinedText).tradingPair = TradingPair;

export { Text };
