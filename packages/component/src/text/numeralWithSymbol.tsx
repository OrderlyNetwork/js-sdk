import { FC } from "react";
import { Numeral, NumeralProps } from "./numeral";
import { useSymbolsInfo } from "@orderly.network/hooks";

/**
 * Truncate according to the symbol configuration, need to be used with @orderly.network/hooks
 * @param props
 * @returns
 */
export const NumeralWithSymbol: FC<
  Omit<NumeralProps, "precision"> & { symbol: string }
> = (props) => {
  //   const { data, isLoading, error } = useSymbolsInfo();
  const config = useSymbolsInfo()[props.symbol];

  return <Numeral {...props} precision={config("quote_dp", 2)} />;
};
