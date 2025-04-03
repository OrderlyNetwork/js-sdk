import {
  Box,
  cn,
  Divider,
  Flex,
  HoverCard,
  Column,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { useMemo } from "react";
import {
  renderPriceInput,
  renderQuantity,
  renderQuantityInput,
} from "./listElement";
import { CloseButton } from "./closeButton";
import { Decimal } from "@orderly.network/utils";
import { SharePnLOptions, SharePnLDialogId } from "@orderly.network/ui-share";
import { ShareButtonWidget } from "./shareButton";
import { API } from "@orderly.network/types";
import { TriggerPrice } from "./triggerPrice";
import { TPSLButton } from "./components";
import { UnrealizedPnLPopoverCard } from "./unrealPnLHover";
import { NumeralWithCtx } from "./numeralWithCtx";
import { useTranslation } from "@orderly.network/i18n";

export const useColumn = (props: {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLOptions;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  const { t } = useTranslation();

  const column = useMemo(
    () =>
      [
        {
          title: t("common.symbol"),
          dataIndex: "symbol",
          fixed: "left",
          width: 140,
          onSort: (r1, r2) => {
            return r1.symbol.localeCompare(r2.symbol);
            // if (sortOrder === "asc") {
            //   return r1.symbol.localeCompare(r2.symbol);
            // }
            // return r2.symbol.localeCompare(r1.symbol);
          },
          render: (value: string, record) => (
            <Flex gap={2}>
              <Box
                width={4}
                height={20}
                className={cn(
                  "oui-rounded-[1px]",
                  record.position_qty > 0
                    ? "oui-bg-trade-profit"
                    : "oui-bg-trade-loss"
                )}
              />

              <Text.formatted
                // rule={"symbol"}
                formatString="base-type"
                className="oui-cursor-pointer"
                onClick={(e) => {
                  props.onSymbolChange?.({ symbol: value } as API.Symbol);
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {`${value.split("_")[1]}-PERP`}
              </Text.formatted>
            </Flex>
          ),
        },
        {
          title: t("common.quantity"),
          dataIndex: "position_qty",
          // onSort: true,
          onSort: (a, b) => {
            return a.position_qty - b.position_qty;
          },
          width: 120,
          className: "oui-pl-6",
          // rule: "price",
          // numeralProps: {
          //   coloring: true,
          //   // tick: "base_dp",
          // },
          render: renderQuantity,
          // render: (value: string) => (
          //   <NumeralWithCtx
          //     coloring
          //     className="oui-font-semibold"
          //     tick="base_dp"
          //   >
          //     {value}
          //   </NumeralWithCtx>
          // ),
        },
        {
          title: t("common.avgOpen"),
          className: "oui-h-[48px]",
          width: 120,
          onSort: true,
          dataIndex: "average_open_price",
          render: (value: string, record: any) => {
            // const ctx = usePositionsRowContext();
            return (
              <NumeralWithCtx rm={Decimal.ROUND_DOWN}>{value}</NumeralWithCtx>
            );
          },
        },
        {
          title: t("common.markPrice"),
          dataIndex: "mark_price",
          width: 120,
          onSort: true,
          className: "oui-h-[48px]",

          render: (value: string, record: any) => {
            return (
              <NumeralWithCtx rm={Decimal.ROUND_DOWN}>{value}</NumeralWithCtx>
            );
          },
        },
        {
          title: (
            <Tooltip
              className="oui-max-w-[280px] oui-text-2xs oui-text-base-contrast-54 oui-p-3 oui-bg-base-8"
              content={t("positions.column.liqPrice.tooltip")}
            >
              <Text>{t("positions.column.liqPrice")}</Text>
            </Tooltip>
          ),
          width: 100,
          onSort: true,
          dataIndex: "est_liq_price",
          render: (value: string, record: any) => {
            return Number(value) === 0 ? (
              "--"
            ) : (
              <NumeralWithCtx
                rm={Decimal.ROUND_DOWN}
                className={Number(value) > 0 ? "oui-text-warning-light" : ""}
              >
                {value ?? "--"}
              </NumeralWithCtx>
            );
          },
        },
        {
          title: (
            <HoverCard
              content={<UnrealizedPnLPopoverCard />}
              side="top"
              align="center"
              className="oui-max-w-[280px] oui-text-2xs"
            >
              <Text>{t("common.unrealizedPnl")}</Text>
            </HoverCard>
          ),
          dataIndex: "unrealized_pnl",
          width: 180,
          onSort: true,
          rule: "price",
          numeralProps: {
            coloring: true,
            // tick: "base_dp",
          },
          // hint: <UnrealizedPnLPopoverCard />,
          render: (value: string, record: any) => {
            return (
              <Flex gap={2}>
                <Flex>
                  <Text.numeral
                    dp={props.pnlNotionalDecimalPrecision}
                    rm={Decimal.ROUND_DOWN}
                    coloring
                    className="oui-font-semibold"
                  >
                    {value}
                  </Text.numeral>
                  <Text.numeral
                    rule="percentages"
                    dp={props.pnlNotionalDecimalPrecision}
                    rm={Decimal.ROUND_DOWN}
                    coloring
                    className="oui-font-semibold"
                    prefix="("
                    suffix=")"
                  >
                    {record.unrealized_pnl_ROI}
                  </Text.numeral>
                </Flex>
                <ShareButtonWidget
                  position={record}
                  sharePnLConfig={props.sharePnLConfig}
                  modalId={SharePnLDialogId}
                />
              </Flex>
            );
          },
        },
        {
          title: t("common.tpsl"),
          dataIndex: "__",
          width: 150,
          render: (_: string, record) => (
            <TriggerPrice
              stopLossPrice={record.sl_trigger_price}
              takeProfitPrice={record.tp_trigger_price}
            />
          ),
        },

        {
          title: t("common.notional"),
          dataIndex: "notional",
          className: "oui-h-[48px]",
          width: 100,
          onSort: true,
          render: (value: string) => (
            <Text.numeral dp={pnlNotionalDecimalPrecision}>
              {value}
            </Text.numeral>
          ),
        },
        {
          title: (
            <Tooltip
              className="oui-max-w-[280px] oui-text-2xs oui-text-base-contrast-54 oui-p-3 oui-bg-base-8"
              // @ts-ignore
              content={
                <Flex
                  direction={"column"}
                  gap={3}
                  className="oui-text-base-contrast-54 oui-bg-base-8 oui-rounded-sm"
                >
                  <span>{t("positions.column.margin.tooltip")}</span>
                  <Divider className="oui-w-full" />
                  <span>{t("positions.column.margin.formula")}</span>
                </Flex>
              }
            >
              <Text>{t("positions.column.margin")}</Text>
            </Tooltip>
          ),
          dataIndex: "mm",
          onSort: true,
          width: 100,
          rule: "price",
          render: (value: string) => <Text.numeral>{value}</Text.numeral>,
          // hint: (
          //   <Flex
          //     direction={"column"}
          //     gap={3}
          //     className="oui-text-base-contrast-54 oui-bg-base-8 oui-rounded-sm"
          //   >
          //     <span>The minimum equity to keep your position. </span>
          //     <Divider className="oui-w-full" />
          //     <span>Margin = Position size * Mark price * MMR</span>
          //   </Flex>
          // ),
        },
        {
          title: t("common.qty"),
          dataIndex: "close_qty",
          width: 100,
          fixed: "right",
          render: renderQuantityInput,
        },
        {
          title: t("common.price"),
          dataIndex: "close_price",
          width: 100,
          fixed: "right",
          render: renderPriceInput,
          // render: (value: string) => <PriceInput />,
        },
        {
          title: "",
          dataIndex: "close_position",
          align: "right",
          width: 160,
          fixed: "right",
          render: (value: string) => {
            return (
              <Flex gapX={2} justify={"end"}>
                <CloseButton />
                <TPSLButton />
              </Flex>
            );
          },
        },
      ] as Column<API.PositionTPSLExt>[],
    [pnlNotionalDecimalPrecision, sharePnLConfig, t]
  );

  return column;
};
