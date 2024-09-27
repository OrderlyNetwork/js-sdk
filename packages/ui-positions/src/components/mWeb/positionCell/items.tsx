import {
  Badge,
  Button,
  cn,
  Flex,
  Sheet,
  SimpleDialog,
  SimpleSheet,
  Statistic,
  Text,
  toast,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ShareButtonWidget } from "../../desktop/shareButton";
import { SharePnLBottomSheetId } from "@orderly.network/ui-share";
import { PositionCellState } from "./positionCell.script";
import { FC, useState } from "react";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { LimitConfirmDialog } from "../../desktop/closeButton";
import { useSymbolContext } from "../../../providers/symbolProvider";

export const Symbol: FC<PositionCellState> = (props) => {
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
        <Text intensity={54}>
          Unreal. PnL{<Text intensity={36}>(USDC)</Text>}
        </Text>
        <Text.numeral
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
      <Text.numeral coloring>{item.position_qty}</Text.numeral>
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
      <Text.numeral coloring>{item.mm}</Text.numeral>
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
      <Text.numeral coloring>{item.notional}</Text.numeral>
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
      <Text.numeral
        dp={(item as any)?.symbolInfo?.("quote_dp")}
        rm={Decimal.ROUND_DOWN}
      >
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
      <Text.numeral
        dp={(item as any)?.symbolInfo?.("quote_dp")}
        rm={Decimal.ROUND_DOWN}
      >
        {item.mark_price}
      </Text.numeral>
    </Statistic>
  );
};

export const LiqPrice: FC<PositionCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Liq. price"}
      align="end"
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={(item as any)?.symbolInfo?.("quote_dp")}
        rm={Decimal.ROUND_DOWN}
        color="warning"
      >
        {item.mark_price}
      </Text.numeral>
    </Statistic>
  );
};

export const TPSLBtn: FC<PositionCellState> = (props) => {
  const { item } = props;
  return (
    <Button variant="outlined" color="secondary">
      TP/SL
    </Button>
  );
};
export const LimitCloseBtn: FC<PositionCellState> = (props) => {
  const { item } = props;
  const [open, setOpen] = useState(false);
  const { onSubmit, price, quantity, closeOrderData, type, submitting, quoteDp, updatePriceChange } =
    usePositionsRowContext();

  const { base, quote } = useSymbolContext();

  const onConfirm = () => {
    return onSubmit().then(
      (res) => {
        setOpen(false);
      },
      (error: any) => {
        if (typeof error === "string") {
          toast.error(error);
        } else {
          toast.error(error.message);
        }
      }
    );
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" color="secondary" onClick={() => {
        updatePriceChange('limit');
        setOpen(true);
      }}>
        Limit Close
      </Button>

      <SimpleSheet title={"Limit close"} open={open} onClose={() => setOpen(false)}>
        DIalog
      </SimpleSheet>
    </>
  );
};
export const MarketCloseBtn: FC<PositionCellState> = (props) => {
  const { item } = props;
  return (
    <Button variant="outlined" color="secondary">
      Market Close
    </Button>
  );
};
