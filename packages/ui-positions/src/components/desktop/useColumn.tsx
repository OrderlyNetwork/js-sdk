import { Box, cn, Column, Divider, Flex, Text } from "@orderly.network/ui";
import { useMemo } from "react";
import {
  renderPriceInput,
  renderQuantity,
  renderQuantityInput,
} from "./listElement";
import { CloseButton } from "./closeButton";
import { Decimal } from "@orderly.network/utils";
import {
  SharePnLBottomSheetId,
  SharePnLConfig,
  SharePnLDialogId,
} from "@orderly.network/ui-share";
import { ShareButtonWidget } from "./shareButton";
import { API } from "@orderly.network/types";
import { TriggerPrice } from "./triggerPrice";
import { TPSLButton } from "./components";
import { UnrealizedPnLPopoverCard } from "./unrealPnLHover";

export const useColumn = (props: {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
}) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  const column = useMemo<Column<API.PositionTPSLExt>[]>(
    () => [
      {
        title: "Instrument",
        dataIndex: "symbol",
        fixed: "left",
        width: 140,
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
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
              rule={"symbol"}
              onClick={(e) => {
                // props.onSymbolChange?.({ symbol: value } as API.Symbol);
                // e.stopPropagation();
                // e.preventDefault();
              }}
            >
              {value}
            </Text.formatted>
          </Flex>
        ),
      },
      {
        title: "Quantity",
        dataIndex: "position_qty",
        onSort: true,
        width: 100,
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
        title: "Avg. open",
        className: "oui-h-[48px]",
        width: 120,
        onSort: true,
        dataIndex: "average_open_price",
        render: (value: string, record: any) => {
          return (
            <Text.numeral
              dp={record?.symbolInfo?.("quote_dp")}
              rm={Decimal.ROUND_DOWN}
            >
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "Mark price",
        dataIndex: "mark_price",
        width: 120,
        onSort: true,
        className: "oui-h-[48px]",

        render: (value: string, record: any) => {
          return (
            <Text.numeral
              dp={record?.symbolInfo?.("quote_dp")}
              rm={Decimal.ROUND_DOWN}
            >
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "Liq. price",
        width: 100,
        onSort: true,
        hint: "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions.",
        dataIndex: "est_liq_price",
        render: (value: string, record: any) => {
          return Number(value) === 0 ? (
            "--"
          ) : (
            <Text.numeral
              dp={record?.symbolInfo?.("quote_dp")}
              rm={Decimal.ROUND_DOWN}
              className={Number(value) > 0 ? "oui-text-warning-light" : ""}
            >
              {value ?? "--"}
            </Text.numeral>
          );
        },
      },
      {
        title: "Unreal. PnL",
        dataIndex: "unrealized_pnl",
        width: 150,
        onSort: true,
        rule: "price",
        numeralProps: {
          coloring: true,
          // tick: "base_dp",
        },
        hint: <UnrealizedPnLPopoverCard />,
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
        title: "TP/SL",
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
        title: "Est. total",
        dataIndex: "notional",
        className: "oui-h-[48px]",
        width: 100,
        onSort: true,
        render: (value: string) => (
          <Text.numeral dp={pnlNotionalDecimalPrecision}>{value}</Text.numeral>
        ),
      },
      {
        title: "Margin",
        dataIndex: "mm",
        onSort: true,
        width: 100,
        rule: "price",
        render: (value: string) => <Text.numeral>{value}</Text.numeral>,
        hint: (
          <Flex
            direction={"column"}
            gap={3}
            className="oui-text-base-contrast-54 oui-bg-base-8 oui-rounded-sm"
          >
            <span>The minimum equity to keep your position. </span>
            <Divider className="oui-w-full" />
            <span>Margin = Position size * Mark price * MMR</span>
          </Flex>
        ),
      },
      {
        title: "Qty.",
        dataIndex: "close_qty",
        width: 100,
        fixed: "right",
        render: renderQuantityInput,
      },
      {
        title: "Price",
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
    ],
    [pnlNotionalDecimalPrecision, sharePnLConfig]
  );

  return column;
};
