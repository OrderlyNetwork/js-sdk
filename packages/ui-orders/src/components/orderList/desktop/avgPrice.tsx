import { memo } from "react";
import { useSymbolsInfo } from "@kodiak-finance/orderly-hooks";
import { Text } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";

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
