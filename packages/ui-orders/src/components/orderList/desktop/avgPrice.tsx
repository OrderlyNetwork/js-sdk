import { memo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

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
