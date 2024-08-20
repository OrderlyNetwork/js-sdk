import { NumeralWithCtx } from "./numeralWithCtx";
import { PriceInput } from "./priceInput";
import { QuantityInput } from "./quantityInput";

export const renderQuantity = (value: number) => {
  return (
    <NumeralWithCtx rule="price" coloring>
      {value}
    </NumeralWithCtx>
  );
};

export const renderQuantityInput = (value: number, record: any) => {
  return <QuantityInput value={record["position_qty"]} />;
};

export const renderPriceInput = (value: number) => {
  return <PriceInput />;
};
