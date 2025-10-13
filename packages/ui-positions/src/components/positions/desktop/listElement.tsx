import { Text } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { useSymbolContext } from "../../../provider/symbolContext";
import { PriceInput } from "./priceInput";
import { QuantityInput } from "./quantityInput";

export const renderQuantity = (value: number) => {
  const symbolInfo = useSymbolContext();
  return (
    <Text.numeral
      dp={symbolInfo.base_dp}
      rm={Decimal.ROUND_DOWN}
      padding={false}
      coloring
    >
      {value}
    </Text.numeral>
  );
};

export const renderQuantityInput = (value: number, record: any) => {
  return <QuantityInput value={record["position_qty"]} />;
};

export const renderPriceInput = (value: number) => {
  return <PriceInput />;
};
