import { FC } from "react";
import { Numeral, NumeralProps } from "./numeral";
import { useSymbolsInfo } from "@orderly.network/hooks";

/**
 * 根据symbol配置进行截断，需要搭配 @orderly.network/hooks 使用
 * @param props
 * @returns
 */
export const NumeralWithConfig: FC<
  Omit<NumeralProps, "precision"> & { symbol: string }
> = (props) => {
  //   const { data, isLoading, error } = useSymbolsInfo();
  const config = useSymbolsInfo();

  //   console.log("config***", data, isLoading, error);

  return <Numeral {...props} dp={config[props.symbol]("quote_tick", 2)} />;
};
