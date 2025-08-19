import { useTranslation } from "@orderly.network/i18n";
import { OrderType } from "@orderly.network/types";
import {
  cn,
  Flex,
  Grid,
  inputFormatter,
  modal,
  Text,
} from "@orderly.network/ui";
import { type OrderInputProps } from ".";
import { InputType } from "../../types";
import { BBOStatus } from "../../utils";
import { BBOOrderTypeSelect } from "../bboOrderTypeSelect";
import { CustomInput } from "../customInput";

export const CommonOrderInput = (props: OrderInputProps) => {
  const {
    type,
    symbolInfo,
    values,
    onFocus,
    onBlur,
    bbo,
    parseErrorMsg,
    fillMiddleValue,
  } = props;
  const { t } = useTranslation();

  const readOnly = bbo.bboStatus === BBOStatus.ON;

  const priceSuffix =
    type === OrderType.LIMIT ? (
      <Flex direction="column" itemAlign="end" className="oui-text-2xs">
        {symbolInfo.quote}
        <Flex justify={"end"} itemAlign="center" gap={2}>
          <Flex
            px={3}
            height={20}
            justify="center"
            itemAlign="center"
            r="base"
            className={cn(
              "oui-mt-[2px] oui-cursor-pointer oui-select-none oui-border",
              bbo.bboStatus === BBOStatus.ON
                ? "oui-border-primary"
                : "oui-border-line-12",
              bbo.bboStatus === BBOStatus.DISABLED && "oui-cursor-not-allowed",
            )}
            onClick={() => {
              if (bbo.bboStatus === BBOStatus.DISABLED) {
                modal.dialog({
                  title: t("common.tips"),
                  size: "xs",
                  content: (
                    <Text intensity={54}>
                      {t("orderEntry.bbo.disabled.tips")}
                    </Text>
                  ),
                });
              } else {
                bbo.toggleBBO();
              }
            }}
          >
            <Text
              className={cn(
                bbo.bboStatus === BBOStatus.ON && "oui-text-primary",
                bbo.bboStatus === BBOStatus.OFF && "oui-text-base-contrast-54",
                bbo.bboStatus === BBOStatus.DISABLED &&
                  "oui-text-base-contrast-20",
              )}
            >
              {t("orderEntry.bbo")}
            </Text>
          </Flex>
          <Text
            className={cn(
              "oui-select-none",
              "oui-cursor-pointer oui-text-primary",
            )}
            onClick={fillMiddleValue}
          >
            Mid
          </Text>
        </Flex>
      </Flex>
    ) : (
      symbolInfo.quote
    );

  return (
    <div className={"oui-space-y-1"}>
      {type === OrderType.STOP_LIMIT || type === OrderType.STOP_MARKET ? (
        <div className={"oui-group"}>
          <CustomInput
            label={t("common.trigger")}
            suffix={symbolInfo.quote}
            error={parseErrorMsg("trigger_price")}
            id={"trigger"}
            ref={props.refs.triggerPriceInputRef}
            value={values.trigger_price}
            onChange={(e) => {
              props.onChange("trigger_price", e);
            }}
            formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
            onFocus={onFocus(InputType.TRIGGER_PRICE)}
            onBlur={onBlur(InputType.TRIGGER_PRICE)}
          />
        </div>
      ) : null}

      {type === OrderType.LIMIT || type === OrderType.STOP_LIMIT ? (
        <div
          ref={props.refs.priceInputContainerRef}
          className="oui-group oui-relative oui-w-full"
        >
          <CustomInput
            label={t("common.price")}
            suffix={priceSuffix}
            id={"price"}
            value={values.price}
            error={parseErrorMsg("order_price")}
            ref={props.refs.priceInputRef}
            // helperText="Price per unit"
            onChange={(e) => {
              props.onChange("order_price", e);
            }}
            formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
            onFocus={onFocus(InputType.PRICE)}
            onBlur={onBlur(InputType.PRICE)}
            readonly={readOnly}
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
      ) : null}

      <Grid cols={2} className={"oui-group oui-space-x-1"}>
        <CustomInput
          label={t("common.qty")}
          suffix={symbolInfo.base}
          id="order_quantity_input"
          name="order_quantity_input"
          className={"!oui-rounded-r"}
          value={values.order_quantity}
          error={parseErrorMsg("order_quantity")}
          onChange={(e) => {
            props.onChange("order_quantity", e);
          }}
          formatters={[inputFormatter.dpFormatter(symbolInfo.base_dp)]}
          onFocus={onFocus(InputType.QUANTITY)}
          onBlur={onBlur(InputType.QUANTITY)}
        />
        <CustomInput
          label={`${t("common.total")}≈`}
          suffix={symbolInfo.quote}
          id={"total"}
          className={"!oui-rounded-l"}
          value={values.total}
          error={parseErrorMsg("total")}
          onChange={(e) => {
            props.onChange("total", e);
          }}
          onFocus={onFocus(InputType.TOTAL)}
          onBlur={onBlur(InputType.TOTAL)}
          formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
        />
      </Grid>
    </div>
  );
};
