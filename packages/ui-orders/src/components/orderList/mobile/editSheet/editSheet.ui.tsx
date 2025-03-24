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
  ThrottledButton,
  toast,
} from "@orderly.network/ui";
import { EditSheetState } from "./editSheet.script";
import { ConfirmDialogContent } from "./editDialogContent";
import { OrderSide } from "@orderly.network/types";
import { parseBadgesFor } from "../../../../utils/util";
import { utils } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";

export const EditSheet: FC<EditSheetState> = (props) => {
  const { item } = props;
  const isBuy = item.side === OrderSide.BUY;
  const { t } = useTranslation();

  const { parseErrorMsg } = useOrderEntryFormErrorMsg(props.errors!);

  const orderQuantityErrorMsg = parseErrorMsg("order_quantity");
  const orderPriceErrorMsg = parseErrorMsg("order_price");
  const triggerPriceErrorMsg = parseErrorMsg("trigger_price");

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
                  e.toLocaleLowerCase() === "position" ? "primary" : "neutral"
                }
                size="xs"
              >
                {e}
              </Badge>
            ))}
            {isBuy && (
              <Badge color="success" size="xs">
                {t("common.buy")}
              </Badge>
            )}
            {!isBuy && (
              <Badge color="danger" size="xs">
                {t("common.sell")}
              </Badge>
            )}
          </Flex>
        </Flex>
        <Divider intensity={8} className="oui-w-full" />
        <Flex width={"100%"} justify={"between"}>
          <Text>{t("common.lastPrice")}</Text>
          <Text.numeral dp={(props.item as any)?.symbolInfo?.duote_dp}>
            {props.curMarkPrice ?? "--"}
          </Text.numeral>
        </Flex>
        <Flex width={"100%"} direction={"column"} itemAlign={"stretch"} gap={2}>
          {props.isAlgoOrder && (
            <Input.tooltip
              prefix={
                <Text intensity={54} className="oui-px-3">
                  {t("orders.column.triggerPrice")}
                </Text>
              }
              suffix={
                <Text intensity={54} className="oui-px-3">
                  {props.quote}
                </Text>
              }
              color={triggerPriceErrorMsg ? "danger" : undefined}
              align="right"
              fullWidth
              autoComplete="off"
              formatters={[
                inputFormatter.numberFormatter,
                inputFormatter.dpFormatter(props.quote_dp),
              ]}
              value={props.triggerPrice}
              onValueChange={(e) => props.setTriggerPrice(e)}
              tooltip={triggerPriceErrorMsg}
              tooltipProps={{
                content: {
                  className: "oui-bg-base-6 oui-text-base-contrast-80",
                },
                arrow: {
                  className: "oui-fill-base-6",
                },
              }}
              classNames={{
                input: "oui-text-base-contrast-98 oui-w-full",
                root: cn(
                  "oui-outline-line-12",
                  triggerPriceErrorMsg && "oui-outline-danger"
                ),
              }}
            />
          )}
          <Input.tooltip
            prefix={
              <Text intensity={54} className="oui-px-3">
                {t("common.price")}
              </Text>
            }
            suffix={
              <Text intensity={54} className="oui-px-3">
                {props.quote}
              </Text>
            }
            color={orderPriceErrorMsg ? "danger" : undefined}
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
            tooltip={orderPriceErrorMsg}
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
                orderPriceErrorMsg && "oui-outline-danger"
              ),
            }}
          />
          <Input.tooltip
            prefix={
              <Text intensity={54} className="oui-px-3">
                {t("common.quantity")}
              </Text>
            }
            suffix={
              <Text intensity={54} className="oui-px-3">
                {props.base}
              </Text>
            }
            color={orderQuantityErrorMsg ? "danger" : undefined}
            align="right"
            fullWidth
            autoComplete="off"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(props.base_dp),
              // inputFormatter.rangeFormatter({ max: props.maxQty }),
            ]}
            value={props.quantity}
            onValueChange={(e) => {
              props.setQuantity(e);
            }}
            onBlur={(event) => onBlur(event.target.value)}
            tooltip={orderQuantityErrorMsg}
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
                orderQuantityErrorMsg && "oui-outline-danger"
              ),
            }}
          />
          <Slider
            markCount={4}
            value={[props.sliderValue ?? 0]}
            onValueChange={(e) => {
              props.setSliderValue(e[0]);
            }}
            color="primary"
          />
          <Flex width={"100%"} justify={"between"}>
            <Text.numeral
              color="primary"
              size="2xs"
              dp={2}
              padding={false}
              rule="percentages"
            >{`${percentages ?? 0}`}</Text.numeral>
            <Flex gap={1}>
              <Text size="2xs" color="primary">
                {t("common.max")}
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
            {t("common.cancel")}
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
            {t("common.confirm")}
          </ThrottledButton>
        </Flex>
      </Flex>

      <SimpleDialog
        open={props.dialogOpen}
        onOpenChange={props.setDialogOpen}
        title={t("orders.editOrder")}
        size="xs"
        actions={{
          primary: {
            label: t("common.confirm"),
            onClick: props.onDialogConfirm,
            loading: props.submitting,
            fullWidth: true,
          },
          secondary: {
            label: t("common.cancel"),
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
