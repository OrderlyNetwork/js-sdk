import { FC, useState } from "react";
import {
  Badge,
  Button,
  cn,
  Divider,
  Flex,
  Input,
  inputFormatter,
  SimpleDialog,
  SimpleSheet,
  Slider,
  Text,
  ThrottledButton,
  toast,
} from "@orderly.network/ui";
import { LimitCloseBtnState } from "./limitCloseBtn.script";
import { Decimal } from "@orderly.network/utils";
import { LimitConfirmDialog } from "../../desktop/closeButton";
import { utils } from "@orderly.network/hooks";

export const LimitCloseBtn: FC<LimitCloseBtnState> = (props) => {
  const {
    item,
    sheetOpen,
    setSheetOpen,
    dialogOpen,
    setDialogOpen,
    updatePriceChange,
    base,
    quantity,
    price,
    onClose,
    onConfirm,
    submitting,
    quote_dp,
    closeOrderData,
    onCloseDialog,
  } = props;
  const isBuy = item.position_qty > 0;

  const onBlur = (value: string) => {
    if (props.baseTick && props.baseTick > 0) {
      const formatQty = utils.formatNumber(value, props.baseTick) ?? value;
      props.updateQuantity(formatQty);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="sm"
        className="oui-border-base-contrast-36"
        onClick={() => {
          updatePriceChange("limit");
          setSheetOpen(true);
        }}
      >
        Limit Close
      </Button>

      {sheetOpen && (
        <SimpleSheet
          title={"Limit close"}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        >
          <Flex
            direction={"column"}
            gap={3}
            width={"100%"}
            itemAlign={"start"}
            className="oui-text-sm"
          >
            <Flex width={"100%"} justify={"between"}>
              <Text.formatted rule={"symbol"} showIcon>
                {item.symbol}
              </Text.formatted>
              <Flex gap={1}>
                <Badge color="neutral" size="xs">
                  Limit
                </Badge>
                {isBuy && (
                  <Badge color="success" size="xs">
                    Buy
                  </Badge>
                )}
                {!isBuy && (
                  <Badge color="danger" size="xs">
                    Sell
                  </Badge>
                )}
              </Flex>
            </Flex>
            <Divider className="oui-w-full" />
            <Flex width={"100%"} justify={"between"}>
              <Text intensity={54}>Last price</Text>
              <Text.numeral
                dp={(props.item as any)?.symbolInfo?.quote_dp}
                suffix={<Text intensity={36}>USDC</Text>}
              >
                {props.curMarkPrice}
              </Text.numeral>
            </Flex>
            <Flex width={"100%"} direction={"column"} gap={2}>
              <Input.tooltip
                prefix="Price"
                suffix={props.quote}
                align="right"
                fullWidth
                autoComplete="off"
                formatters={[
                  inputFormatter.numberFormatter,
                  inputFormatter.dpFormatter(props.quote_dp),
                ]}
                triggerClassName="oui-w-full"
                tooltip={props.errors?.order_price?.message}
                color={
                  props.errors?.order_price?.message ? "danger" : undefined
                }
                value={props.price}
                onValueChange={(e) => props.updatePriceChange(e)}
                classNames={{
                  prefix: "oui-text-base-contrast-54",
                  suffix: "oui-text-base-contrast-54",
                  root: cn(
                    "oui-outline-line-12 oui-w-full",
                    props.errors?.order_price?.message
                      ? "oui-outline-danger"
                      : undefined
                  ),
                }}
              />
              <Input
                prefix="Quantity"
                suffix={props.base}
                align="right"
                fullWidth
                autoComplete="off"
                formatters={[
                  inputFormatter.numberFormatter,
                  inputFormatter.dpFormatter(props.base_dp),
                ]}
                // triggerClassName="oui-w-full"
                // tooltip={props.errors?.order_quantity?.message}
                // color={
                //   props.errors?.order_quantity?.message ? "danger" : undefined
                // }
                value={props.quantity}
                onBlur={(event) => onBlur(event.target.value)}
                onValueChange={(e) => {
                  props.updateQuantity(e);
                  const slider = new Decimal(e)
                    .div(props.item.position_qty)
                    .mul(100)
                    .toDecimalPlaces(2, Decimal.ROUND_DOWN)
                    .toNumber();
                  props.setSliderValue(slider);
                }}
                classNames={{
                  prefix: "oui-text-base-contrast-54",
                  suffix: "oui-text-base-contrast-54",
                  root: cn(
                    "oui-outline-line-12 oui-w-full",
                    // props.errors?.order_quantity?.message
                    //   ? "oui-outline-danger"
                    //   : undefined
                  ),
                }}
              />
              <Slider
                markCount={4}
                value={[props.sliderValue]}
                color="primary"
                onValueChange={(e) => {
                  props.setSliderValue(e[0]);
                  const qty = new Decimal(e[0])
                    .div(100)
                    .mul(props.item.position_qty)
                    .toFixed(props.base_dp, Decimal.ROUND_DOWN);
                  // props.updateQuantity(qty);
                  onBlur(qty);
                }}
              />
              <Flex width={"100%"} justify={"between"}>
                <Text
                  color="primary"
                  size="2xs"
                >{`${props.sliderValue}%`}</Text>
                <Flex gap={1}>
                  <Text size="2xs" color="primary">
                    Max
                  </Text>
                  <Text.numeral intensity={54} size="2xs">
                    {Math.abs(props.item.position_qty)}
                  </Text.numeral>
                </Flex>
              </Flex>
            </Flex>
            <Flex width={"100%"} gap={3} mt={2}>
              <Button
                fullWidth
                color="secondary"
                onClick={(e) => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <ThrottledButton
                fullWidth
                disabled={submitting}
                loading={submitting}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const errors = props.errors;

                  const quantityMsg = errors?.order_quantity?.message;
                  const priceMsg = errors?.order_price?.message;
                  if (quantityMsg || priceMsg) {
                    toast.error(quantityMsg ?? priceMsg);
                    return;
                  }
                  if (!props.orderConfirm) {
                    onConfirm();
                    return;
                  }
                  setDialogOpen(true);
                }}
                // disabled={Object.keys(props.errors ?? {}).length > 0}
              >
                Confirm
              </ThrottledButton>
            </Flex>
          </Flex>
        </SimpleSheet>
      )}

      {dialogOpen && (
        <SimpleDialog open={dialogOpen} onOpenChange={setDialogOpen} size="xs">
          <LimitConfirmDialog
            base={base}
            quantity={quantity}
            price={price}
            onClose={onCloseDialog}
            onConfirm={onConfirm}
            submitting={submitting}
            quoteDp={quote_dp}
            order={closeOrderData}
            hideCloseIcon
          />
        </SimpleDialog>
      )}
    </>
  );
};
