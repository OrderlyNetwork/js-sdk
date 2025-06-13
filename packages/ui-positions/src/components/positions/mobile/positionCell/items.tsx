import { FC, useRef } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Badge, cn, Flex, Statistic, Text } from "@orderly.network/ui";
import { SharePnLBottomSheetId } from "@orderly.network/ui-share";
import { Decimal } from "@orderly.network/utils";
import { FundingFeeButton } from "../../../fundingFeeHistory/fundingFeeButton";
import { ShareButtonWidget } from "../../desktop/shareButton";
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
        <Badge color={isBuy ? "success" : "danger"} size="xs">
          {isBuy ? t("common.long") : t("common.short")}
        </Badge>
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
  return (
    <Flex gap={3}>
      <Flex direction={"column"} className="oui-text-2xs" itemAlign={"end"}>
        <div>
          <Text intensity={36}>{t("common.unrealizedPnl")}</Text>
          <Text intensity={20}>(USDC)</Text>
        </div>

        <Text.numeral
          size="xs"
          dp={props.pnlNotionalDecimalPrecision}
          rm={Decimal.ROUND_DOWN}
          coloring
          className="orderly-font-semibold"
          suffix={
            <Text.numeral
              rule="percentages"
              dp={props.pnlNotionalDecimalPrecision}
              rm={Decimal.ROUND_DOWN}
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
            </Text.numeral>
          }
        >
          {item.unrealized_pnl}
        </Text.numeral>
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

  return (
    <Statistic
      label={
        <span>
          {t("positions.column.margin")}
          <Text intensity={20}>(USDC)</Text>
        </span>
      }
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} intensity={80}>
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
      <Text.numeral dp={props.quote_dp} intensity={80}>
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
  const liqPrice =
    item.est_liq_price && item.est_liq_price > 0 ? item.est_liq_price : "-";

  return (
    <Statistic
      label={t("positions.column.liqPrice")}
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
  if (item.tp_trigger_price == null && item.sl_trigger_price == null)
    return <></>;

  return (
    <Flex className="oui-text-2xs oui-text-base-contrast-36">
      <Text>{`${t("common.tpsl")}:`}&nbsp;</Text>
      <Flex className="oui-gap-[2px]">
        {item.tp_trigger_price && (
          <Text.numeral color="buy">{item.tp_trigger_price}</Text.numeral>
        )}
        {item.sl_trigger_price && "/"}
        {item.sl_trigger_price && (
          <Text.numeral color="sell">{item.sl_trigger_price}</Text.numeral>
        )}
      </Flex>
    </Flex>
  );
};

export const FundingFee: FC<PositionCellState> = (props) => {
  const { t } = useTranslation();
  const fundingFeeEndTime = useRef(Date.now().toString());
  return (
    <Flex justify={"end"} className="oui-text-2xs oui-w-full">
      <Text intensity={36}>{t("funding.fundingFee")}: </Text>
      <FundingFeeButton
        fee={props.item.fundingFee}
        symbol={props.item.symbol}
        start_t={props.item.timestamp.toString()}
        end_t={fundingFeeEndTime.current}
      />
    </Flex>
  );
};
