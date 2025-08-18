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
import { PnlInfo } from "../components/pnlInfo";
import { TPSLQuantity } from "../components/tpslQty";
import { useTPSLSimpleDialog } from "./tpslSimpleDialog.script";

type Props = ReturnType<typeof useTPSLSimpleDialog> & {
  close?: () => void;
  onComplete?: () => void;
};

export const TPSLSimpleDialogUI: React.FC<Props> = (props) => {
  const { type, triggerPrice, errors, isPosition, TPSL_OrderEntity } = props;
  const { t } = useTranslation();
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(errors);

  const footer = (
    <Flex width="100%" itemAlign="center" gap={3} mt={4}>
      <Button
        key="secondary"
        color="gray"
        onClick={() => {
          props.onComplete?.();
          props.close?.();
        }}
        fullWidth
        className="oui-text-sm"
        size="md"
      >
        {t("common.cancel")}
      </Button>
      <Button
        key="primary"
        onClick={() => {
          props.onSubmit().then(() => {
            props.onComplete?.();
            props.close?.();
          });
        }}
        fullWidth
        className="oui-text-sm"
        size="md"
      >
        {t("common.confirm")}
      </Button>
    </Flex>
  );

  const renderPnl = () => {
    const { tp_pnl, sl_pnl } = TPSL_OrderEntity;
    if (type === "sl") {
      return (
        <Flex justify={"between"} className="oui-w-full">
          <Text size="2xs">{t("tpsl.totalEstSlPnl")}</Text>
          {sl_pnl ? (
            <Text.numeral
              suffix={
                <Text className="oui-text-base-contrast-36 oui-ml-1">USDC</Text>
              }
              coloring
              visible={true}
              size="2xs"
              dp={2}
            >
              {Number(sl_pnl)}
            </Text.numeral>
          ) : (
            <Text size="2xs">-- USDC</Text>
          )}
        </Flex>
      );
    }
    return (
      <Flex justify={"between"} className="oui-w-full">
        <Text size="2xs">{t("tpsl.totalEstTpPnl")}</Text>
        <Text.numeral
          suffix={
            <Text className="oui-text-base-contrast-36 oui-ml-1">USDC</Text>
          }
          rule="price"
          coloring
          visible={true}
          size="2xs"
          dp={2}
        >
          {tp_pnl ? Number(tp_pnl) : "--"}
        </Text.numeral>
      </Flex>
    );
  };

  return (
    <Box className="oui-w-full oui-px-0.5">
      <TPSLQuantity
        maxQty={props.maxQty}
        quantity={Number(props.orderQuantity ?? props.maxQty)}
        baseTick={props.symbolInfo("base_tick")}
        dp={props.symbolInfo("base_dp")}
        quote={props.symbolInfo("base")}
        isEditing={false}
        errorMsg={parseErrorMsg("quantity")}
        onQuantityChange={props.setQuantity}
      />
      <Flex
        direction={"column"}
        itemAlign={"start"}
        className={cn(
          "oui-w-full oui-gap-1 oui-text-xs oui-text-base-contrast-36 oui-mt-4",
        )}
      >
        <Flex justify={"between"} className="oui-w-full">
          <Text size="xs">{t("tpsl.advanced.triggerPrice")}</Text>
          <Text.numeral
            className="oui-text-base-contrast"
            suffix={
              <Text className="oui-text-base-contrast-36 oui-ml-1 oui-text-xs">
                USDC
              </Text>
            }
            rule="price"
            size="xs"
            dp={props.symbolInfo("quote_dp")}
          >
            {triggerPrice ? Number(triggerPrice) : "--"}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"} className="oui-w-full">
          <Text size="xs">{t("tpsl.advanced.orderPrice")}</Text>
          <Text className="oui-text-base-contrast" size="xs">
            {t("tpsl.advanced.market")}
          </Text>
        </Flex>
        {renderPnl()}
      </Flex>
      {errors && (
        <Flex
          justify={"start"}
          itemAlign={"start"}
          gap={2}
          className="oui-w-full"
        >
          <div className="oui-relative oui-top-[7px] oui-w-1 oui-h-1 oui-bg-danger oui-rounded-full" />
          <Text className="oui-text-danger">
            {type === "sl"
              ? errors.sl_trigger_price?.message
              : errors.tp_trigger_price?.message}
          </Text>
        </Flex>
      )}

      <Divider className="oui-my-3 oui-w-full" />
      <Flex itemAlign={"center"} onClick={() => {}} className="oui-pb-4">
        <Text color="primary" className="oui-cursor-pointer oui-text-sm">
          {t("tpsl.advancedSetting")}
        </Text>
      </Flex>
      {footer}
    </Box>
  );
};
