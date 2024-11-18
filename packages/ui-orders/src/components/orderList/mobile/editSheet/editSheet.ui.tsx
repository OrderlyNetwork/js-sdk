import { FC, useEffect } from "react";
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
  ThrottledButton,
  toast,
} from "@orderly.network/ui";
import { EditSheetState } from "./editSheet.script";
import { ConfirmDialogContent } from "./editDialogContent";
import { OrderSide } from "@orderly.network/types";
import { parseBadgesFor } from "../../../../utils/util";
import { utils } from "@orderly.network/hooks";

export const EditSheet: FC<EditSheetState> = (props) => {
  const { item } = props;
  const isBuy = item.side === OrderSide.BUY;

  // useEffect(() => {
  //   if (props.errors?.order_price?.message) {
  //     toast.error(props.errors?.order_price?.message);
  //   } else if (props.errors?.order_quantity?.message) {
  //     toast.error(props.errors?.order_quantity?.message);
  //   } else if (props.errors?.total?.message) {
  //     toast.error(props.errors?.total?.message);
  //   } else if (props.errors?.trigger_price?.message) {
  //     toast.error(props.errors?.trigger_price?.message);
  //   }
  // }, [props.errors]);

  const percentages =
    props.quantity && props.maxQty
      ? Math.min(Number(props.quantity) / props.maxQty, 1)
      : undefined;


      const onBlur = (value: string) => {
        const baseTick = props.baseTick;
        if (baseTick && baseTick > 0) {
          const formatQty = utils.formatNumber(value, baseTick) ?? value;
          props.setQuantity(formatQty);
        }
      };

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
          <Flex direction={"row"} gap={1}>
            {parseBadgesFor(props.item)?.map((e, index) => (
              <Badge
                key={index}
                color={
                  e.toLocaleLowerCase() === "position"
                    ? "primaryLight"
                    : "neutral"
                }
                size="xs"
              >
                {e}
              </Badge>
            ))}
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
            {props.curMarkPrice ?? "--"}
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
              color={
                props.errors?.trigger_price?.message ? "danger" : undefined
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
              tooltip={props.errors?.trigger_price?.message}
              tooltipProps={{
                content: {
                  className: "oui-bg-base-6",
                },
                arrow: {
                  className: "oui-fill-base-6",
                },
              }}
              classNames={{
                input: "oui-text-base-contrast-98 oui-w-full",
                root: cn(
                  "oui-outline-line-12",
                  props.errors?.trigger_price?.message && "oui-outline-danger"
                ),
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
            color={props.errors?.order_price?.message ? "danger" : undefined}
            align="right"
            fullWidth
            autoComplete="off"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(props.quote_dp),
            ]}
            disabled={!props.priceEdit}
            value={props.isStopMarket ? "Market" : props.price}
            onValueChange={(e) => props.setPrice(e)}
            tooltip={props.errors?.order_price?.message}
            tooltipProps={{
              content: {
                className: "oui-bg-base-5",
              },
              arrow: {
                className: "oui-fill-base-5",
              },
            }}
            classNames={{
              input: "oui-text-base-contrast-98",
              root: cn(
                "oui-outline-line-12",
                props.errors?.order_price?.message && "oui-outline-danger"
              ),
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
            color={props.errors?.order_quantity?.message ? "danger" : undefined}
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
            }}
            onBlur={(event) => onBlur(event.target.value)}
            tooltip={props.errors?.order_quantity?.message}
            tooltipProps={{
              content: {
                className: "oui-bg-base-6",
              },
              arrow: {
                className: "oui-fill-base-6",
              },
            }}
            classNames={{
              input: "oui-text-base-contrast-98",
              root: cn(
                "oui-outline-line-12",
                props.errors?.order_quantity?.message && "oui-outline-danger"
              ),
            }}
          />
          <Slider
            markCount={4}
            value={[props.sliderValue ?? 0]}
            onValueChange={(e) => {
              props.setSliderValue(e[0]);
            }}
            color="primaryLight"
          />
          <Flex width={"100%"} justify={"between"}>
            <Text.numeral
              color="primaryLight"
              size="2xs"
              dp={2}
              padding={false}
              rule="percentages"
            >{`${percentages ?? 0}`}</Text.numeral>
            <Flex gap={1}>
              <Text size="2xs" color="primaryLight">
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
          <ThrottledButton
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onSheetConfirm();
            }}
            loading={props.submitting}
            disabled={!props.isChanged}
          >
            Confirm
          </ThrottledButton>
        </Flex>
      </Flex>

      <SimpleDialog
        open={props.dialogOpen}
        onOpenChange={props.setDialogOpen}
        title="Edit order"
        size="xs"
        actions={{
          primary: {
            label: "Confirm",
            onClick: props.onDialogConfirm,
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
