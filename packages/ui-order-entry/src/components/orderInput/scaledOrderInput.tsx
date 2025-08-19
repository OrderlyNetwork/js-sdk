import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { DistributionType } from "@orderly.network/types";
import { cn, Grid, inputFormatter } from "@orderly.network/ui";
import { type BaseOrderInputProps } from ".";
import { InputType } from "../../types";
import { CustomInput } from "../customInput";
import { QuantityDistributionInput } from "../quantityDistribution";
import { QuantityUnit } from "../quantityUnit";

export const ScaledOrderInput = (props: BaseOrderInputProps) => {
  const { symbolInfo, values, onFocus, onBlur, parseErrorMsg, errors } = props;
  const { base, quote, base_dp, quote_dp } = symbolInfo;
  const { t } = useTranslation();

  const [quantityUnit, setQuantityUnit] = useLocalStorage<"quote" | "base">(
    "orderly_order_quantity_unit",
    "quote",
  );

  const isBase = quantityUnit === "base";
  const unit = isBase ? base : quote;
  const showSkewInput = values.distribution_type === DistributionType.CUSTOM;

  const suffix = (
    <QuantityUnit
      base={base}
      quote={quote}
      value={unit}
      onValueChange={(value) => {
        setQuantityUnit(value === base ? "base" : "quote");
      }}
    />
  );

  return (
    <div className="oui-space-y-1">
      <CustomInput
        label={t("orderEntry.startPrice")}
        suffix={quote}
        id="order_start_price_input"
        value={values.start_price}
        error={parseErrorMsg("start_price")}
        onChange={(e) => {
          props.onChange("start_price", e);
        }}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
        onFocus={onFocus(InputType.START_PRICE)}
        onBlur={onBlur(InputType.START_PRICE)}
        classNames={{
          root: "oui-rounded-t-xl",
        }}
      />
      <CustomInput
        label={t("orderEntry.endPrice")}
        suffix={quote}
        id="order_end_price_input"
        value={values.end_price}
        error={parseErrorMsg("end_price")}
        onChange={(val) => {
          props.onChange("end_price", val);
        }}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
        onFocus={onFocus(InputType.END_PRICE)}
        onBlur={onBlur(InputType.END_PRICE)}
      />

      <Grid cols={2} className={"oui-group oui-space-x-1"}>
        {isBase ? (
          <CustomInput
            label={t("common.qty")}
            suffix={suffix}
            id="order_quantity_input"
            name="order_quantity_input"
            className="!oui-rounded-r"
            value={values.order_quantity}
            error={parseErrorMsg(
              "order_quantity",
              `${errors?.order_quantity?.value} ${base}`,
            )}
            onChange={(val) => {
              props.onChange("order_quantity", val);
            }}
            formatters={[inputFormatter.dpFormatter(base_dp)]}
            onFocus={onFocus(InputType.QUANTITY)}
            onBlur={onBlur(InputType.QUANTITY)}
          />
        ) : (
          <CustomInput
            label={t("common.qty")}
            suffix={suffix}
            id="order_total_input"
            name="order_total_input"
            className="!oui-rounded-r"
            value={values.total}
            error={parseErrorMsg(
              "order_quantity",
              `${errors?.total?.value} ${quote}`,
            )}
            onChange={(val) => {
              props.onChange("total", val);
            }}
            formatters={[inputFormatter.dpFormatter(quote_dp)]}
            onFocus={onFocus(InputType.TOTAL)}
            onBlur={onBlur(InputType.TOTAL)}
          />
        )}
        <CustomInput
          label={t("orderEntry.totalOrders")}
          placeholder="2-20"
          id="order_total_orders_input"
          className={"!oui-rounded-l"}
          value={values.total_orders}
          error={parseErrorMsg("total_orders")}
          onChange={(val) => {
            props.onChange("total_orders", val);
          }}
          overrideFormatters={[
            // inputFormatter.rangeFormatter({ min: 2, max: 20 }),
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(0),
          ]}
          onFocus={onFocus(InputType.TOTAL_ORDERS)}
          onBlur={onBlur(InputType.TOTAL_ORDERS)}
        />
      </Grid>
      <QuantityDistributionInput
        value={values.distribution_type}
        onValueChange={(value) => {
          props.onChange("distribution_type", value);
        }}
        className={cn(!showSkewInput && "oui-rounded-b-xl")}
      />

      {showSkewInput && (
        <CustomInput
          id="order_skew_input"
          label={t("orderEntry.skew")}
          value={values.skew}
          error={parseErrorMsg("skew")}
          onChange={(val) => {
            props.onChange("skew", val);
          }}
          onFocus={onFocus(InputType.SKEW)}
          onBlur={onBlur(InputType.SKEW)}
          overrideFormatters={[
            inputFormatter.rangeFormatter({ min: 0, max: 100, dp: 2 }),
            inputFormatter.dpFormatter(2),
          ]}
          classNames={{
            root: "oui-rounded-b-xl",
          }}
        />
      )}
    </div>
  );
};
