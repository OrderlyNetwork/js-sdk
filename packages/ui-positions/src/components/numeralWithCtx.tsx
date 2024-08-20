import { FC } from "react";
import { useSymbolContext } from "../providers/symbolProvider";
import { NumeralProps, Text } from "@orderly.network/ui";

export type TickName = "quote_dp" | "base_dp";

export const NumeralWithCtx: FC<
  Omit<NumeralProps, "precision" | "tick"> & {
    tick?: TickName;
  }
> = (props) => {
  const { tick = "quote_dp", ...rest } = props;
  const symbolInfo = useSymbolContext();

  if (!symbolInfo) {
    throw new Error("NumeralWithCtx must be used inside SymbolProvider");
  }

  return <Text.numeral as="span" {...rest} dp={symbolInfo[tick]} />;
};
