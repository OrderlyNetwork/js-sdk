import { memo } from "react";
import { useSymbolsInfo } from "@veltodefi/hooks";
import { Text } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";

type AvgPriceProps = {
  symbol: string;
  value: string;
};

export const AvgPrice = memo((props: AvgPriceProps) => {
  const symbolsInfo = useSymbolsInfo();

  const info = symbolsInfo[props.symbol];

  if (!props.value) {
    return "--";
  }

  return (
    <Text.numeral
      padding={false}
      dp={info("quote_dp", 2)}
      rm={Decimal.ROUND_UP}
    >
      {props.value}
    </Text.numeral>
  );
});
