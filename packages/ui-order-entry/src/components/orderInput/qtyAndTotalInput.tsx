import { FC, memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Grid, inputFormatter } from "@orderly.network/ui";
import { InputType } from "../../types";
import { CustomInput } from "../customInput";
import { useOrderEntryContext } from "../orderEntryContext";

type QtyAndTotalInputProps = {
  order_quantity?: string;
  total?: string;
};

export const QtyAndTotalInput: FC<QtyAndTotalInputProps> = memo((props) => {
  const { t } = useTranslation();

  const { symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  const { base, quote, base_dp, quote_dp } = symbolInfo;

  return (
    <Grid cols={2} className="oui-group oui-space-x-1">
      <CustomInput
        id="order_quantity_input"
        name="order_quantity_input"
        label={t("common.qty")}
        suffix={base}
        error={getErrorMsg("order_quantity")}
        value={props.order_quantity}
        onChange={(e) => {
          setOrderValue("order_quantity", e);
        }}
        formatters={[inputFormatter.dpFormatter(base_dp)]}
        onFocus={onFocus(InputType.QUANTITY)}
        onBlur={onBlur(InputType.QUANTITY)}
        className="!oui-rounded-r"
      />
      <CustomInput
        id="order_total_input"
        name="order_total_input"
        label={`${t("common.total")}≈`}
        suffix={quote}
        error={getErrorMsg("total")}
        value={props.total}
        onChange={(e) => {
          setOrderValue("total", e);
        }}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
        onFocus={onFocus(InputType.TOTAL)}
        onBlur={onBlur(InputType.TOTAL)}
        className="!oui-rounded-l"
      />
    </Grid>
  );
});

QtyAndTotalInput.displayName = "QtyAndTotalInput";
