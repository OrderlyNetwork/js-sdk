import React, { useRef } from "react";
import { utils } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  Box,
  Button,
  cn,
  convertValueToPercentage,
  Divider,
  Flex,
  Input,
  inputFormatter,
  Slider,
  Text,
} from "@orderly.network/ui";

// ------------- Quantity input start------------
const TPSLQuantity: React.FC<{
  maxQty: number;
  baseTick: number;
  dp: number;
  quote: string;
  onQuantityChange?: (value: number | string) => void;
  quantity: number;
  isEditing?: boolean;
  isPosition?: boolean;
  setOrderValue?: (key: string, value: number | string) => void;
  errorMsg?: string;
}> = (props) => {
  // const isPosition = props.quantity === props.maxQty;
  const { isPosition } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQtyPercentage =
    convertValueToPercentage(props.quantity, 0, props.maxQty) / 100;
  const { t } = useTranslation();

  const formatQuantity = (qty: string) => {
    let _qty = qty;
    if (Number(qty) > props.maxQty) {
      _qty = props.maxQty.toString();
    }
    if (props.baseTick > 0) {
      props.onQuantityChange?.(utils.formatNumber(_qty, props.baseTick) ?? qty);
    }
  };

  const errorMsg =
    (isPosition ? "" : props.quantity).toString().length > 0
      ? props.errorMsg
      : undefined;

  return (
    <>
      <Flex gap={2}>
        <div className={"oui-flex-1"}>
          <Input.tooltip
            data-testid="oui-testid-tpsl-popUp-quantity-input"
            ref={inputRef}
            prefix={t("common.quantity")}
            size={{ initial: "md", lg: "sm" }}
            align="right"
            value={props.quantity}
            autoComplete="off"
            classNames={{
              prefix: "oui-text-base-contrast-54",
              root: cn(
                "oui-bg-base-5 oui-outline-line-12",
                errorMsg && "oui-outline-danger",
              ),
            }}
            tooltipProps={{
              content: {
                className: "oui-bg-base-6 oui-text-base-contrast-80",
              },
              arrow: {
                className: "oui-fill-base-6",
              },
            }}
            tooltip={errorMsg}
            color={errorMsg ? "danger" : undefined}
            formatters={[
              inputFormatter.dpFormatter(props.dp),
              inputFormatter.numberFormatter,
              inputFormatter.currencyFormatter,
              inputFormatter.decimalPointFormatter,
            ]}
            onValueChange={(value) => {
              props.onQuantityChange?.(value);
              const qty = Number(value);
              if (qty && qty > props.maxQty) {
                const qty = isPosition ? 0 : props.maxQty;
                props.onQuantityChange?.(qty);
                inputRef.current?.blur();
              }
            }}
            onBlur={(e) => formatQuantity(e.target.value)}
            suffix={
              <span className="oui-px-3 oui-text-2xs oui-text-base-contrast-54">
                {props.quote}
              </span>
            }
          />
        </div>
      </Flex>
      <Flex mt={2} itemAlign={"center"} height={"15px"}>
        <Slider.single
          markCount={5}
          color="primary"
          max={props.maxQty}
          min={0}
          showTip
          step={props.baseTick}
          value={props.quantity}
          onValueCommit={(value) => {
            formatQuantity(`${value}`);
          }}
          onValueChange={(value) => {
            props.onQuantityChange?.(value);
          }}
        />
      </Flex>
      <Flex justify={"between"}>
        <Text.numeral rule={"percentages"} color={"primary"} size={"2xs"}>
          {currentQtyPercentage}
        </Text.numeral>
        <Flex itemAlign={"center"} gap={1}>
          <button
            className={"oui-leading-none"}
            style={{ lineHeight: 0 }}
            onClick={() => {
              props.onQuantityChange?.(props.maxQty);
            }}
          >
            <Text color={"primary"} size={"2xs"}>
              {t("common.max")}
            </Text>
          </button>
          <Text.numeral
            rule={"price"}
            size={"2xs"}
            intensity={54}
            tick={props.baseTick}
          >
            {props.maxQty}
          </Text.numeral>
        </Flex>
      </Flex>
    </>
  );
};

export const TPSLSimpleDialogUI: React.FC<{
  type: "tp" | "sl";
  triggerPrice?: number;
  errors?: any;
  isEditing?: boolean;
  isPosition?: boolean;
}> = (props) => {
  const { type, triggerPrice, errors, isEditing, isPosition } = props;
  const { t } = useTranslation();
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(errors);
  const pnlLabelMap = {
    tp: t("tpsl.totalEstTpPnl"),
    sl: t("tpsl.totalEstSlPnl"),
  };
  const footer = (
    <Flex width="100%" itemAlign="center" gap={3} mt={4}>
      <Button
        key="secondary"
        color="gray"
        onClick={() => {}}
        fullWidth
        className="oui-text-sm"
        size="md"
      >
        {t("common.cancel")}
      </Button>
      <Button
        key="primary"
        onClick={() => {}}
        fullWidth
        className="oui-text-sm"
        size="md"
      >
        {t("common.confirm")}
      </Button>
    </Flex>
  );

  return (
    <Box className="oui-w-full oui-px-0.5">
      <TPSLQuantity
        maxQty={0}
        quantity={0}
        baseTick={0}
        dp={0}
        quote={"0"}
        isEditing={isEditing}
        isPosition={isPosition}
        errorMsg={parseErrorMsg("quantity")}
      />
      <Flex itemAlign="center" justify="between" my={1}>
        {t("tpsl.advanced.triggerPrice")}
        <Flex itemAlign="center" justify="end" gap={1}>
          <Text intensity={98}>{triggerPrice}</Text>
          <Text intensity={36}>USDC</Text>
        </Flex>
      </Flex>
      <Flex itemAlign="center" justify="between" my={1}>
        {t("tpsl.advanced.orderPrice")}
        <Text intensity={98}>Market</Text>
      </Flex>
      <Flex itemAlign="center" justify="between" my={1}>
        {pnlLabelMap[type]}
        <Flex itemAlign="center" justify="end" gap={1}>
          <Text color="success">52.32</Text>
          <Text intensity={36}>USDC</Text>
        </Flex>
      </Flex>
      <Divider className="oui-my-3 oui-w-full" />
      <Flex itemAlign={"center"} onClick={() => {}}>
        <Text color="primary" className="oui-cursor-pointer oui-text-sm">
          {t("tpsl.advancedSetting")}
        </Text>
      </Flex>
      {footer}
    </Box>
  );
};
