import { FC } from "react";
import { Numeral, NumeralProps } from "./numeral";
import { useSymbolsInfo } from "@orderly.network/hooks";

/**
 * 根据symbol配置进行截断，需要搭配 @orderly.network/hooks 使用
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
