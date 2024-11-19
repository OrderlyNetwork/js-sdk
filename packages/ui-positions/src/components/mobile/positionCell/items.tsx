import { Badge, cn, Flex, Statistic, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ShareButtonWidget } from "../../desktop/shareButton";
import { SharePnLBottomSheetId } from "@orderly.network/ui-share";
import { PositionCellState } from "./positionCell.script";
import { FC } from "react";
import { API } from "@orderly.network/types";

export const SymbolToken: FC<PositionCellState> = (props) => {
  const { item } = props;
  const isBuy = item.position_qty > 0;
  return (
    <Text.formatted
      rule="symbol"
      formatString="base-type"
      size="2xs"
      suffix={
        <Badge color={isBuy ? "success" : "danger"} size="xs">
          {isBuy ? "Buy" : "Sell"}
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

  return (
    <Flex gap={3}>
      <Flex direction={"column"} className="oui-text-2xs" itemAlign={"end"}>
        <Text intensity={36}>
          Unreal. PnL{<Text intensity={20}>(USDC)</Text>}
        </Text>
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
                  : "oui-text-danger-darken"
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

  return (
    <Statistic
      label={"Qty."}
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

  return (
    <Statistic
      label={<Text>Margin{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} coloring>
        {item.mm}
      </Text.numeral>
    </Statistic>
  );
};

export const Notional: FC<PositionCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      align="end"
      label={<Text>Notional{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} coloring>
        {item.notional}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgOpen: FC<PositionCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Avg. open"}
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

  return (
    <Statistic
      label={"Mark price"}
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

  const liqPrice =
    item.est_liq_price && item.est_liq_price > 0 ? item.est_liq_price : "-";

  return (
    <Statistic
      label={"Liq. price"}
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

  if (item.tp_trigger_price == null && item.sl_trigger_price == null)
    return <></>;

  return (
    <Flex className="oui-text-2xs oui-text-base-contrast-36">
      <Text>TP/SL:&nbsp;</Text>
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
