import { FC, memo } from "react";
import { Grid } from "@orderly.network/ui";
import { QuantityInput } from "./quantityInput";
import { TotalInput } from "./totalInput";

type QtyAndTotalInputProps = {
  order_quantity?: string;
  total?: string;
};

export const QtyAndTotalInput: FC<QtyAndTotalInputProps> = memo((props) => {
  return (
    <Grid cols={2} className="oui-group oui-space-x-1">
      <QuantityInput order_quantity={props.order_quantity} />
      <TotalInput total={props.total} />
    </Grid>
  );
});

QtyAndTotalInput.displayName = "QtyAndTotalInput";
