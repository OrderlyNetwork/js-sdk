import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderType } from "@orderly.network/types";
import { cn, inputFormatter } from "@orderly.network/ui";
import { OrderEntryScriptReturn } from "../../../orderEntry.script";
import { InputType } from "../../../types";
import { BBOStatus } from "../../../utils";
import { BBOOrderTypeSelect } from "../../bboOrderTypeSelect";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";
import { LimitPriceSuffix } from "./limitPriceSuffix";

export type PriceInputProps = {
  order_type: OrderType;
  order_price?: string;
  bbo: Pick<
    OrderEntryScriptReturn,
    "bboStatus" | "bboType" | "onBBOChange" | "toggleBBO"
  >;
  refs: OrderEntryScriptReturn["refs"];
  priceInputContainerWidth?: number;
  fillMiddleValue: OrderEntryScriptReturn["fillMiddleValue"];
};

// TODO: memo component
export const PriceInput: FC<PriceInputProps> = (props) => {
  const { bbo } = props;
  const { t } = useTranslation();
  const { symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  const { quote, quote_dp } = symbolInfo;

  const readOnly = bbo.bboStatus === BBOStatus.ON;

  const suffix =
    props.order_type === OrderType.LIMIT ? (
      <LimitPriceSuffix
        quote={quote}
        bbo={bbo}
        fillMiddleValue={props.fillMiddleValue}
      />
    ) : (
      quote
    );

  return (
    <div
      ref={props.refs.priceInputContainerRef}
      className="oui-group oui-relative oui-w-full"
    >
      <CustomInput
        id="order_price_input"
        name="order_price_input"
        label={t("common.price")}
        suffix={suffix}
        value={props.order_price}
        onChange={(e) => {
          setOrderValue("order_price", e);
        }}
        error={getErrorMsg("order_price")}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
        onFocus={onFocus(InputType.PRICE)}
        onBlur={onBlur(InputType.PRICE)}
        readonly={readOnly}
        ref={props.refs.priceInputRef}
        classNames={{
          root: cn(readOnly && "focus-within:oui-outline-transparent "),
          input: cn(readOnly && "oui-cursor-auto"),
        }}
      />
      {bbo.bboStatus === BBOStatus.ON && (
        <div className={cn("oui-absolute oui-bottom-1 oui-left-0")}>
          <BBOOrderTypeSelect
            value={bbo.bboType}
            onChange={bbo.onBBOChange}
            contentStyle={{
              width: props.priceInputContainerWidth,
            }}
          />
        </div>
      )}
    </div>
  );
};
