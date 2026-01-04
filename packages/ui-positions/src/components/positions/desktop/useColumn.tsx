import { useMemo } from "react";
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
  modal,
  useScreen,
} from "@orderly.network/ui";
import { SymbolLeverageDialogId } from "@orderly.network/ui-leverage";
import { SharePnLOptions, SharePnLDialogId } from "@orderly.network/ui-share";
import { Decimal } from "@orderly.network/utils";
import { LIQ_DISTANCE_THRESHOLD } from "../../../constants";
import { RwaStatusTag } from "../../rwaStatus/rwaStatus";
import {
  AdjustMarginDialogId,
  AdjustMarginSheetId,
} from "../adjustMargin/adjustMargin.widget";
import { ClosePositionWidget } from "../closePosition";
import { LeverageBadge } from "./components";
import { renderQuantity } from "./listElement";
import { NumeralWithCtx } from "./numeralWithCtx";
import { PartialTPSL } from "./partialTPSL";
import { ReversePositionButton } from "./reversePotisionButton";
import { ShareButtonWidget } from "./shareButton";
import { TriggerPrice } from "./triggerPrice";
import { UnrealizedPnLPopoverCard } from "./unrealPnLHover";

interface ColumnConfig {
  pnlNotionalDecimalPrecision?: number;
  sharePnLConfig?: SharePnLOptions;
  onSymbolChange?: (symbol: API.Symbol) => void;
  positionReverse?: boolean;
}

export const useColumn = (config: ColumnConfig) => {
  const {
    pnlNotionalDecimalPrecision,
    sharePnLConfig,
    onSymbolChange,
    positionReverse,
  } = config;
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const column = useMemo<Column<API.PositionTPSLExt>[]>(
    () => [
      {
        title: t("common.symbol"),
        dataIndex: "symbol",
        fixed: "left",
        width: 200,
        onSort: (r1, r2) => {
          return r1.symbol?.localeCompare(r2.symbol || "");
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
              <Flex gap={1}>
                <LeverageBadge
                  symbol={value}
                  leverage={record.leverage}
                  modalId={SymbolLeverageDialogId}
                />
                <RwaStatusTag symbol={value} />
              </Flex>
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
        render: (value: string, record) => {
          const liqPrice = Number(value);
          const markPrice = record.mark_price;
          if (
            liqPrice === 0 ||
            !markPrice ||
            markPrice === 0 ||
            Math.abs(liqPrice - markPrice) / markPrice >= LIQ_DISTANCE_THRESHOLD
          ) {
            return "--";
          }

          return (
            <NumeralWithCtx
              rm={Decimal.ROUND_DOWN}
              className={liqPrice > 0 ? "oui-text-warning-light" : ""}
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
                <Text.pnl
                  dp={pnlNotionalDecimalPrecision}
                  coloring
                  className="oui-font-semibold"
                >
                  {value}
                </Text.pnl>
                <Text.roi
                  rule="percentages"
                  dp={pnlNotionalDecimalPrecision}
                  coloring
                  className="oui-font-semibold"
                  prefix="("
                  suffix=")"
                >
                  {record.unrealized_pnl_ROI}
                </Text.roi>
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
          <Text.notional dp={pnlNotionalDecimalPrecision}>
            {value}
          </Text.notional>
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
        width: 120,
        rule: "price",
        render: (value: string, record) => {
          // Temporary: Always show button for UI acceptance
          // TODO: After acceptance, restore correct check based on actual margin_mode field
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const position = record as API.PositionTPSLExt & {
            margin_mode?: string;
            marginMode?: string;
          };
          const isIsolated = true;
          // const isIsolated =
          //   position.margin_mode === "isolated" || position.marginMode === "isolated";
          if (!isIsolated) return <Text.numeral>{value}</Text.numeral>;

          return (
            <Flex gap={2} itemAlign="center">
              <Text.numeral>{value}</Text.numeral>
              <button
                type="button"
                aria-label="adjust margin"
                className="oui-group oui-flex oui-items-center oui-justify-center oui-size-5 oui-rounded-full oui-bg-transparent oui-transition-colors hover:oui-bg-base-contrast-6"
                onClick={(e) => {
                  e.stopPropagation();
                  modal.show(
                    isMobile ? AdjustMarginSheetId : AdjustMarginDialogId,
                    {
                      position: record,
                      symbol: record.symbol,
                    },
                  );
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="oui-text-base-contrast-54 oui-transition-colors group-hover:oui-text-base-contrast-98"
                >
                  <path
                    d="M8.47056 4.66893C8.59115 4.78951 8.6768 4.95625 8.67694 5.14024L8.67704 7.29088L10.8276 7.29088C11.0119 7.29135 11.1783 7.37667 11.299 7.49735C11.4197 7.61803 11.505 7.78444 11.5055 7.96876C11.505 8.33693 11.1958 8.64616 10.8276 8.64663L8.67704 8.64664L8.67703 10.7972C8.67656 11.1654 8.36733 11.4746 7.99916 11.4751C7.63099 11.4746 7.32175 11.1653 7.32128 10.7972L7.32128 8.64664L5.17064 8.64654C4.80271 8.64631 4.49323 8.33683 4.49295 7.96885C4.49318 7.60045 4.80242 7.29121 5.17082 7.29097L7.32128 7.29088L7.32137 5.14042C7.32161 4.77202 7.63084 4.46278 7.99925 4.46255C8.18328 4.46274 8.34993 4.54829 8.47056 4.66893Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8.00016 1.33264C4.3183 1.33264 1.3335 4.3173 1.3335 7.9993C1.3335 11.6813 4.3183 14.666 8.00016 14.666C11.6822 14.666 14.6668 11.6813 14.6668 7.9993C14.6668 4.3173 11.6822 1.33264 8.00016 1.33264ZM8.00016 2.66597C10.9455 2.66597 13.3335 5.05397 13.3335 7.9993C13.3335 10.9446 10.9455 13.3326 8.00016 13.3326C5.05463 13.3326 2.66683 10.9446 2.66683 7.9993C2.66683 5.05397 5.05463 2.66597 8.00016 2.66597Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </Flex>
          );
        },
      },
      // {
      //   title: t("funding.fundingFee"),
      //   dataIndex: "fundingFee",
      //   width: 100,
      //   render: (value, record) => (
      //     <FundingFeeButton
      //       fee={value}
      //       symbol={record.symbol}
      //       start_t={record.timestamp.toString()}
      //       end_t={fundingFeeEndTime.current}
      //     />
      //   ),
      // },
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
        width: positionReverse ? 100 : 70,
        fixed: "right",
        render(_, record) {
          return (
            <Flex gapX={2} justify={"end"}>
              <ClosePositionWidget />
              {positionReverse && <ReversePositionButton position={record} />}
            </Flex>
          );
        },
      },
    ],
    [pnlNotionalDecimalPrecision, sharePnLConfig, t, positionReverse],
  );
  return column;
};
