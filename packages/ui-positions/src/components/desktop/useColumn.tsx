import {
  Box,
  cn,
  Divider,
  Flex,
  HoverCard,
  TableColumn,
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
import { NumeralWithCtx } from "./numeralWithCtx";

export const useColumn = (props: {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLConfig;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig } = props;
  const column = useMemo(
    () =>
      [
        {
          title: "Instrument",
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
          title: "Quantity",
          dataIndex: "position_qty",
          // onSort: true,
          onSort: ((a,b) => {
            return a.position_qty - b.position_qty;
          }),
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
          title: "Avg. open",
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
          title: "Mark price",
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
              content={
                "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions."
              }
            >
              <Text>Liq. price</Text>
            </Tooltip>
          ),
          width: 100,
          onSort: true,
          // hint: "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions.",
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
              <Text>Unreal. PnL</Text>
            </HoverCard>
          ),
          dataIndex: "unrealized_pnl",
          width: 150,
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
            <Text.numeral dp={pnlNotionalDecimalPrecision}>
              {value}
            </Text.numeral>
          ),
        },
        {
          title: (
            <Tooltip
              className="oui-max-w-[280px] oui-text-2xs oui-text-base-contrast-54 oui-p-3 oui-bg-base-8"
              content={
                <Flex
                  direction={"column"}
                  gap={3}
                  className="oui-text-base-contrast-54 oui-bg-base-8 oui-rounded-sm"
                >
                  <span>The minimum equity to keep your position. </span>
                  <Divider className="oui-w-full" />
                  <span>Margin = Position size * Mark price * MMR</span>
                </Flex>
              }
            >
              <Text>Margin</Text>
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
      ] as TableColumn<API.PositionTPSLExt>[],
    [pnlNotionalDecimalPrecision, sharePnLConfig]
  );

  return column;
};
