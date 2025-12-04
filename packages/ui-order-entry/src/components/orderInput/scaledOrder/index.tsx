import { DistributionType, OrderlyOrder } from "@veltodefi/types";
import { cn, Grid } from "@veltodefi/ui";
import { QuantityDistributionInput } from "./quantityDistributionInput";
import { ScaledPriceInput } from "./scaledPriceInput";
import { ScaledQuantityInput } from "./scaledQuantityInput";
import { SkewInput } from "./skewInput";
import { TotalOrdersInput } from "./totalOrdersInput";

type ScaledOrderInputProps = {
  values: Partial<OrderlyOrder>;
};

export const ScaledOrderInput = (props: ScaledOrderInputProps) => {
  const { values } = props;

  const showSkewInput = values.distribution_type === DistributionType.CUSTOM;

  return (
    <div className="oui-space-y-1">
      <ScaledPriceInput
        start_price={values.start_price}
        end_price={values.end_price}
      />

      <Grid cols={2} className="oui-group oui-space-x-1">
        <ScaledQuantityInput
          order_quantity={values.order_quantity}
          total={values.total}
        />
        <TotalOrdersInput total_orders={values.total_orders} />
      </Grid>

      <QuantityDistributionInput
        distribution_type={values.distribution_type}
        className={cn(!showSkewInput && "oui-rounded-b-xl")}
      />

      {showSkewInput && <SkewInput skew={values.skew} />}
    </div>
  );
};
