import { FC } from "react";
import { useSymbolContext } from "@/provider/symbolProvider";
import { Numeral, NumeralProps } from "./numeral";

export const NumeralWithCtx: FC<Omit<NumeralProps, "precision">> = (props) => {
  const symbolInfo = useSymbolContext();

  if (!symbolInfo) {
    throw new Error("NumeralWithCtx must be used inside SymbolProvider");
  }

  return <Numeral {...props} precision={symbolInfo.base_dp} />;
};
