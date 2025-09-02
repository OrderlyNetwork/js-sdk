import { useMemo, useRef } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
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
import { SharePnLOptions, SharePnLDialogId } from "@orderly.network/ui-share";
import { Decimal } from "@orderly.network/utils";
import { FundingFeeButton } from "../../fundingFeeHistory/fundingFeeButton";
import { ClosePositionWidget } from "../closePosition";
import { TPSLButton, LeverageBadge } from "./components";
import {
  renderPriceInput,
  renderQuantity,
  renderQuantityInput,
} from "./listElement";
import { NumeralWithCtx } from "./numeralWithCtx";
import { PartialTPSL } from "./partialTPSL";
import { ShareButtonWidget } from "./shareButton";
import { TriggerPrice } from "./triggerPrice";
import { UnrealizedPnLPopoverCard } from "./unrealPnLHover";

interface ColumnConfig {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLOptions;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const useColumn = (config: ColumnConfig) => {
  const { pnlNotionalDecimalPrecision, sharePnLConfig, onSymbolChange } =
    config;
  const { t } = useTranslation();
  const fundingFeeEndTime = useRef(Date.now().toString());
  const column = useMemo<Column<API.PositionTPSLExt>[]>(
    () => [
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
                "oui-h-[38px] oui-rounded-[1px]",
                record.position_qty > 0
                  ? "oui-bg-trade-profit"
                  : "oui-bg-trade-loss",
              )}
            />
            <Flex direction="column" itemAlign="start">
              <Text.formatted
                // rule={"symbol"}
                formatString="base-type"
                className="oui-cursor-pointer"
                onClick={(e) => {
                  onSymbolChange?.({ symbol: value } as API.Symbol);
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {`${value.split("_")[1]}-PERP`}
              </Text.formatted>
              <LeverageBadge symbol={value} leverage={record.leverage} />
            </Flex>
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
        render: (value: string) => {
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
        render: (value: string) => {
          return (
            <NumeralWithCtx rm={Decimal.ROUND_DOWN}>{value}</NumeralWithCtx>
          );
        },
      },
      {
        title: (
          <Tooltip
            className="oui-max-w-[280px] oui-bg-base-8 oui-p-3 oui-text-2xs oui-text-base-contrast-54"
            content={t("positions.column.liqPrice.tooltip")}
          >
            <Text>{t("positions.column.liqPrice")}</Text>
          </Tooltip>
        ),
        width: 100,
        onSort: true,
        dataIndex: "est_liq_price",
        render: (value: string) => {
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
        render: (value: string, record) => {
          return (
            <Flex gap={2}>
              <Flex>
                <Text.numeral
                  dp={pnlNotionalDecimalPrecision}
                  rm={Decimal.ROUND_DOWN}
                  coloring
                  className="oui-font-semibold"
                >
                  {value}
                </Text.numeral>
                <Text.numeral
                  rule="percentages"
                  dp={pnlNotionalDecimalPrecision}
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
                sharePnLConfig={sharePnLConfig}
                modalId={SharePnLDialogId}
              />
            </Flex>
          );
        },
      },
      {
        title: t("common.fullTPSL"),
        dataIndex: "full_tpsl",
        width: 150,
        render: (_: string, record) => {
          return (
            <TriggerPrice
              stopLossPrice={record.full_tp_sl?.sl_trigger_price}
              takeProfitPrice={record.full_tp_sl?.tp_trigger_price}
            />
          );
        },
      },

      {
        title: t("common.partialTPSL"),
        dataIndex: "partial_tpsl",
        width: 150,
        render: (_: string, record) => (
          <PartialTPSL
            orderNum={record.partial_tp_sl?.order_num}
            tpTriggerPrice={record.partial_tp_sl?.tp_trigger_price}
            slTriggerPrice={record.partial_tp_sl?.sl_trigger_price}
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
          <Text.numeral dp={pnlNotionalDecimalPrecision}>{value}</Text.numeral>
        ),
      },
      {
        title: (
          <Tooltip
            className="oui-max-w-[280px] oui-bg-base-8 oui-p-3 oui-text-2xs oui-text-base-contrast-54"
            content={
              <Flex
                direction={"column"}
                gap={3}
                className="oui-rounded-sm oui-bg-base-8 oui-text-base-contrast-54"
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
      },
      {
        title: t("funding.fundingFee"),
        dataIndex: "fundingFee",
        width: 100,
        render: (value, record) => (
          <FundingFeeButton
            fee={value}
            symbol={record.symbol}
            start_t={record.timestamp.toString()}
            end_t={fundingFeeEndTime.current}
          />
        ),
      },
      // {
      //   title: t("common.qty"),
      //   dataIndex: "close_qty",
      //   width: 100,
      //   fixed: "right",
      //   render: renderQuantityInput,
      // },
      // {
      //   title: t("common.price"),
      //   dataIndex: "close_price",
      //   width: 100,
      //   fixed: "right",
      //   render: renderPriceInput,
      //   // render: (value: string) => <PriceInput />,
      // },
      {
        title: null,
        dataIndex: "close_position",
        align: "right",
        width: 70,
        fixed: "right",
        render() {
          return (
            <Flex gapX={2} justify={"end"}>
              <ClosePositionWidget />
            </Flex>
          );
        },
      },
    ],
    [pnlNotionalDecimalPrecision, sharePnLConfig, t],
  );
  return column;
};
