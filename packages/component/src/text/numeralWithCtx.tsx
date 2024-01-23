import { FC } from "react";
import { useSymbolContext } from "@/provider/symbolProvider";
import { Numeral, NumeralProps } from "./numeral";

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

  return <Numeral {...rest} precision={symbolInfo[tick]} />;
};
