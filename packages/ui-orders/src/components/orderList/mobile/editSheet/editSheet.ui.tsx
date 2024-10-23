import { FC } from "react";
import {
  Badge,
  Button,
  cn,
  Divider,
  Flex,
  Input,
  inputFormatter,
  SimpleDialog,
  Slider,
  Text,
} from "@orderly.network/ui";
import { EditSheetState } from "./editSheet.script";
import { commify, Decimal } from "@orderly.network/utils";
import { ConfirmDialogContent } from "./editDialogContent";

export const EditSheet: FC<EditSheetState> = (props) => {
  const { item } = props;
  const isBuy = item.quantity > 0;
  return (
    <>
      <Flex
        direction={"column"}
        gap={3}
        width={"100%"}
        itemAlign={"start"}
        className="oui-text-sm"
      >
        <Flex width={"100%"} justify={"between"}>
          <Text.formatted rule={"symbol"} showIcon intensity={80}>
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
        <Divider intensity={8} className="oui-w-full" />
        <Flex width={"100%"} justify={"between"}>
          <Text>Last price</Text>
          <Text.numeral dp={(props.item as any)?.symbolInfo?.duote_dp}>
            {props.curMarkPrice}
          </Text.numeral>
        </Flex>
        <Flex width={"100%"} direction={"column"} itemAlign={"stretch"} gap={2}>
          {props.isAlgoOrder && (
            <Input.tooltip
              prefix={
                <Text intensity={54} className="oui-px-3">
                  Trigger price
                </Text>
              }
              suffix={
                <Text intensity={54} className="oui-px-3">
                  {props.quote}
                </Text>
              }
              align="right"
              fullWidth
              autoComplete="off"
              formatters={[
                inputFormatter.numberFormatter,
                inputFormatter.dpFormatter(props.quote_dp),
              ]}
              value={props.triggerPrice}
              onValueChange={(e) => props.setTriggerPrice(e)}
              tooltip={props.errors.trigger_price?.message}
              tooltipProps={{
                content: {
                  className: "oui-bg-base-6"
                },
                arrow: {
                  className: "oui-fill-base-6"
                }
              }}
              classNames={{
                input: "oui-text-base-contrast-80 oui-w-full",
              }}
            />
          )}
          <Input.tooltip
            prefix={
              <Text intensity={54} className="oui-px-3">
                Price
              </Text>
            }
            suffix={
              <Text intensity={54} className="oui-px-3">
                {props.quote}
              </Text>
            }
            align="right"
            fullWidth
            autoComplete="off"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(props.quote_dp),
            ]}
            disabled={!props.priceEdit}
            value={props.price}
            onValueChange={(e) => props.setPrice(e)}
            tooltip={props.errors.order_price?.message}
            tooltipProps={{
              content: {
                className: "oui-bg-base-6"
              },
              arrow: {
                className: "oui-fill-base-6"
              }
            }}
            classNames={{
              input: "oui-text-base-contrast-80",
            }}
          />
          <Input.tooltip
            prefix={
              <Text intensity={54} className="oui-px-3">
                {"Quantity"}
              </Text>
            }
            suffix={
              <Text intensity={54} className="oui-px-3">
                {props.base}
              </Text>
            }
            align="right"
            fullWidth
            autoComplete="off"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(props.base_dp),
              inputFormatter.rangeFormatter({ max: props.maxQty }),
            ]}
            value={props.quantity}
            onValueChange={(e) => {
              props.setQuantity(e);
              if (e.endsWith(".")) return;
              const sliderValue = new Decimal(e).div(props.maxQty).mul(100).toNumber();
              props.setSliderValue(sliderValue);
            }}
            tooltip={props.errors.order_quantity?.message}
            tooltipProps={{
              content: {
                className: "oui-bg-base-6"
              },
              arrow: {
                className: "oui-fill-base-6"
              }
            }}
            classNames={{
              input: "oui-text-base-contrast-80",
            }}
          />
          <Slider
            markCount={4}
            value={[props.sliderValue ?? 0]}
            onValueChange={(e) => {
              props.setSliderValue(e[0]);
              const qty = new Decimal(e[0])
                .div(100)
                .mul(props.maxQty)
                .toFixed(props.base_dp, Decimal.ROUND_DOWN);
              props.setQuantity(qty);
            }}
          />
          <Flex width={"100%"} justify={"between"}>
            <Text.numeral
              color="primary"
              size="2xs"
              dp={props.base_dp}
              padding={false}
              rule="percentages"
            >{`${props.percentages ?? 0}`}</Text.numeral>
            <Flex gap={1}>
              <Text size="2xs" color="primary">
                Max
              </Text>
              <Text.numeral intensity={54} size="2xs" dp={props.base_dp}>
                {props.maxQty}
              </Text.numeral>
            </Flex>
          </Flex>
        </Flex>
        <Flex width={"100%"} gap={3} mt={2}>
          <Button
            fullWidth
            color="secondary"
            onClick={(e) => {
              props.onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onComfirm();
            }}
            loading={props.submitting}
          >
            Confirm
          </Button>
        </Flex>
      </Flex>

      <SimpleDialog
        open={props.dialogOpen}
        onOpenChange={props.setDialogOpen}
        title="Confirm order"
        size="xs"
        actions={{
          primary: {
            label: "Confirm",
            onClick: props.onConfirm,
            loading: props.submitting,
            fullWidth: true,
          },
          secondary: {
            label: "Cancel",
            onClick: props.onCloseDialog,
            fullWidth: true,
          },
        }}
        classNames={{
          content: "oui-pb-4",
          body: "oui-p-0",
          footer: "oui-pt-3 oui-pb-0",
        }}
      >
        <ConfirmDialogContent {...props} />
      </SimpleDialog>
    </>
  );
};
