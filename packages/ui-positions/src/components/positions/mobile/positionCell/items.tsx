import { FC, useMemo, useRef } from "react";
import { useTpslPriceChecker } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API, OrderSide, PositionType } from "@orderly.network/types";
import {
  Badge,
  cn,
  Flex,
  Grid,
  Statistic,
  Text,
  Tips,
} from "@orderly.network/ui";
import { SymbolLeverageSheetId } from "@orderly.network/ui-leverage";
import { SharePnLBottomSheetId } from "@orderly.network/ui-share";
import { CloseToLiqPriceIcon } from "@orderly.network/ui-tpsl";
import { Decimal } from "@orderly.network/utils";
import { LIQ_DISTANCE_THRESHOLD } from "../../../../constants";
import { FundingFeeButton } from "../../../fundingFeeHistory/fundingFeeButton";
import { LeverageBadge } from "../../desktop/components";
import { AddIcon, TPSLEditIcon } from "../../desktop/components";
import { ShareButtonWidget } from "../../desktop/shareButton";
import { UnrealizedPnLPopoverCard } from "../../desktop/unrealPnLHover";
import { PositionCellState } from "./positionCell.script";

export const SymbolToken: FC<PositionCellState> = (props) => {
  const { item } = props;
  const isBuy = item.position_qty > 0;
  const { t } = useTranslation();
  return (
    <Text.formatted
      rule="symbol"
      formatString="base-type"
      size="2xs"
      suffix={
        <div className="oui-flex oui-items-center oui-gap-1">
          <Badge color={isBuy ? "success" : "danger"} size="xs">
            {isBuy ? t("common.long") : t("common.short")}
          </Badge>
          <LeverageBadge
            symbol={item.symbol}
            leverage={item.leverage}
            modalId={SymbolLeverageSheetId}
          />
        </div>
      }
      showIcon
      onClick={() => {
        props.onSymbolChange?.({ symbol: item.symbol } as API.Symbol);
      }}
    >
      {item.symbol}
    </Text.formatted>
  );
};

export const UnrealPnL: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const unrealPnlLabel = (
    <div className="oui-text-right">
      <Text intensity={36} className="oui-underline oui-decoration-dotted">
        {t("common.unrealizedPnl")}
      </Text>
      <Text intensity={20} className="oui-ml-0.5">
        (USDC)
      </Text>
    </div>
  );

  return (
    <Flex gap={3}>
      <Flex direction={"column"} className="oui-text-2xs" itemAlign={"end"}>
        <Tips
          trigger={unrealPnlLabel}
          content={<UnrealizedPnLPopoverCard />}
          title={t("common.tips")}
        />

        <Text.pnl
          size="xs"
          dp={props.pnlNotionalDecimalPrecision}
          coloring
          className="orderly-font-semibold"
          suffix={
            <Text.roi
              rule="percentages"
              dp={props.pnlNotionalDecimalPrecision}
              prefix="("
              suffix=")"
              className={cn(
                "oui-ml-1",
                item.unrealized_pnl_ROI > 0
                  ? "oui-text-success-darken"
                  : "oui-text-danger-darken",
              )}
            >
              {item.unrealized_pnl_ROI}
            </Text.roi>
          }
        >
          {item.unrealized_pnl}
        </Text.pnl>
      </Flex>
      <ShareButtonWidget
        position={item}
        sharePnLConfig={props.sharePnLConfig}
        modalId={SharePnLBottomSheetId}
        iconSize={12}
      />
    </Flex>
  );
};

export const Qty: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Statistic
      label={t("common.qty")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring>
        {item.position_qty}
      </Text.numeral>
    </Statistic>
  );
};

export const Margin: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const marginTipsContent = (
    <div className="oui-text-2xs oui-text-base-contrast-80">
      <div>{t("positions.column.margin.tooltip")}</div>
      <div className="oui-my-2 oui-h-px oui-w-full oui-bg-base-8" />
      <div>{t("positions.column.margin.formula")}</div>
    </div>
  );

  const marginLabel = (
    <Text className="oui-underline oui-decoration-dotted">
      {t("positions.column.margin")}
    </Text>
  );

  return (
    <Statistic
      label={
        <Tips
          trigger={marginLabel}
          content={marginTipsContent}
          title={t("common.tips")}
        />
      }
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={2} intensity={80}>
        {item.mm}
      </Text.numeral>
    </Statistic>
  );
};

export const Notional: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Statistic
      align="end"
      label={
        <span>
          {t("common.notional")}
          <Text intensity={20}>(USDC)</Text>
        </span>
      }
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={2} intensity={80}>
        {item.notional}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgOpen: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Statistic
      label={t("common.avgOpen")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} rm={Decimal.ROUND_DOWN} intensity={80}>
        {item.average_open_price}
      </Text.numeral>
    </Statistic>
  );
};

export const MarkPrice: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();
  return (
    <Statistic
      label={t("common.markPrice")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} rm={Decimal.ROUND_DOWN} intensity={80}>
        {item.mark_price}
      </Text.numeral>
    </Statistic>
  );
};

export const LiqPrice: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();
  const liqPrice = useMemo(() => {
    const estLiqPrice = item.est_liq_price;
    const markPrice = item.mark_price;

    if (!estLiqPrice || estLiqPrice <= 0) return "-";
    if (!markPrice || markPrice === 0) return "-";
    if (
      Math.abs(estLiqPrice - markPrice) / markPrice >=
      LIQ_DISTANCE_THRESHOLD
    ) {
      return "-";
    }
    return estLiqPrice;
  }, [item.est_liq_price, item.mark_price]);

  const liqTipsContent = (
    <div className="oui-text-2xs oui-text-base-contrast-80">
      <div className="oui-text-pretty">
        {t("common.liquidationPrice.tooltip")}
      </div>
      <div className="oui-mt-2">
        <a
          href="https://orderly.network/docs/introduction/trade-on-orderly/perpetual-futures/liquidations"
          target="_blank"
          rel="noopener noreferrer"
          className="oui-text-primary oui-underline"
        >
          {t("common.liquidationPrice.tooltip.learnMore")}
        </a>
      </div>
    </div>
  );

  const liqLabel = (
    <Text className="oui-underline oui-decoration-dotted">
      {t("positions.column.liqPrice")}
    </Text>
  );

  return (
    <Statistic
      label={
        <Tips
          trigger={liqLabel}
          content={liqTipsContent}
          title={t("common.tips")}
        />
      }
      align="end"
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} rm={Decimal.ROUND_DOWN} color="warning">
        {liqPrice}
      </Text.numeral>
    </Statistic>
  );
};

export const TPSLPrice: FC<PositionCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const slPriceError = useTpslPriceChecker({
    slPrice: item.full_tp_sl?.sl_trigger_price?.toString() ?? undefined,
    liqPrice: item.est_liq_price ?? null,
    side: item.position_qty > 0 ? OrderSide.BUY : OrderSide.SELL,
  });

  const partialSlPriceError = useTpslPriceChecker({
    slPrice: item.partial_tp_sl?.sl_trigger_price?.toString() ?? undefined,
    liqPrice: item.est_liq_price ?? null,
    side: item.position_qty > 0 ? OrderSide.BUY : OrderSide.SELL,
  });

  const fullTPSL = useMemo(() => {
    if (
      item.full_tp_sl?.tp_trigger_price == null &&
      item.full_tp_sl?.sl_trigger_price == null
    )
      return <AddIcon positionType={PositionType.FULL} />;

    return (
      <Flex className="oui-gap-[2px]">
        {item.full_tp_sl?.tp_trigger_price && (
          <Text.numeral color="buy">
            {item.full_tp_sl.tp_trigger_price}
          </Text.numeral>
        )}
        {item.full_tp_sl?.sl_trigger_price && "/"}
        {item.full_tp_sl?.sl_trigger_price && (
          <Text.numeral
            as="div"
            color="sell"
            suffix={<CloseToLiqPriceIcon slPriceError={slPriceError} />}
            className="oui-flex oui-items-center"
          >
            {item.full_tp_sl.sl_trigger_price}
          </Text.numeral>
        )}
        <TPSLEditIcon />
      </Flex>
    );
  }, [item.full_tp_sl]);

  const partialTPSL = useMemo(() => {
    if (
      item.partial_tp_sl?.tp_trigger_price == null &&
      item.partial_tp_sl?.sl_trigger_price == null
    )
      return <AddIcon positionType={PositionType.PARTIAL} />;

    return (
      <Flex className="oui-gap-[2px]" itemAlign={"center"}>
        {item.partial_tp_sl?.tp_trigger_price && (
          <Text.numeral color="buy">
            {item.partial_tp_sl.tp_trigger_price}
          </Text.numeral>
        )}
        {item.partial_tp_sl?.sl_trigger_price && "/"}
        {item.partial_tp_sl?.sl_trigger_price && (
          <Text.numeral
            as="div"
            color="sell"
            suffix={<CloseToLiqPriceIcon slPriceError={partialSlPriceError} />}
            className="oui-flex oui-items-center"
          >
            {item.partial_tp_sl.sl_trigger_price}
          </Text.numeral>
        )}
        <Text>{`(${item.partial_tp_sl?.order_num})`}</Text>
        <TPSLEditIcon />
      </Flex>
    );
  }, [item.partial_tp_sl]);

  return (
    <Grid cols={2} rows={1} gap={2} width={"100%"}>
      <Flex
        className="oui-text-2xs oui-text-base-contrast-36"
        direction={"column"}
        itemAlign={"start"}
      >
        <Text>{t("common.fullTPSL")}: </Text>
        {fullTPSL}
      </Flex>
      <Flex
        className="oui-text-2xs oui-grid-cols-end oui-text-base-contrast-36"
        direction={"column"}
        itemAlign={"end"}
      >
        <Text>{t("common.partialTPSL")}: </Text>
        {partialTPSL}
      </Flex>
    </Grid>
  );
};

export const FundingFee: FC<PositionCellState> = (props) => {
  const { t } = useTranslation();
  const fundingFeeEndTime = useRef(Date.now().toString());
  return (
    <Flex justify={"end"} className="oui-w-full oui-text-2xs">
      <Text intensity={36}>{t("funding.fundingFee")}: </Text>
      <FundingFeeButton
        fee={props.item.fundingFee!}
        symbol={props.item.symbol}
        start_t={props.item.timestamp.toString()}
        end_t={fundingFeeEndTime.current}
      />
    </Flex>
  );
};
