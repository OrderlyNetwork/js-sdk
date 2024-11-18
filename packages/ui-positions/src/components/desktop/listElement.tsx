import { Button, Text } from "@orderly.network/ui";
import { NumeralWithCtx } from "./numeralWithCtx";
import { PriceInput } from "./priceInput";
import { QuantityInput } from "./quantityInput";
import { Decimal } from "@orderly.network/utils";
import { useSymbolContext } from "../../providers/symbolProvider";

export const renderQuantity = (value: number, record: any) => {

  const symbolInfo = useSymbolContext();
  return (
    <Text.numeral dp={symbolInfo.base_dp} rm={Decimal.ROUND_DOWN} padding={false} coloring>
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
