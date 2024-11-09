import { FC } from "react";
import { cn, Divider, Flex, Grid } from "@orderly.network/ui";
import { PositionCellState } from "./positionCell.script";
import {
  UnrealPnL,
  Symbol,
  Qty,
  Margin,
  Notional,
  AvgOpen,
  MarkPrice,
  LiqPrice,
} from "./items";
import { LimitCloseBtnWidget } from "../limitCloseBtn";
import { MarketCloseBtnWidget } from "../marketCloseBtn";
import { TpSLBtnWidget } from "../tpSLBtn";

export const PositionCell: FC<
  PositionCellState & {
    className?: string;
  }
> = (props) => {
  const { className, ...rest } = props;
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      gap={2}
      p={2}
      r="xl"
      className={cn(className, "oui-bg-base-9")}
    >
      <Header {...rest} />
      <Divider intensity={6} className="oui-w-full" />
      <Body {...rest} />
      <Buttons {...rest} />
    </Flex>
  );
};

const Header: FC<PositionCellState> = (props) => {
  const { item } = props;
  const isBuy = item.position_qty > 0;

  return (
    <Flex justify={"between"} width={"100%"}>
      <Symbol {...props} />
      <UnrealPnL {...props} />
    </Flex>
  );
};

const Body: FC<PositionCellState> = (props) => {
  return (
    <Grid cols={3} rows={2} gap={2} width={"100%"}>
      <Qty {...props} />
      <Margin {...props} />
      <Notional {...props} />
      <AvgOpen {...props} />
      <MarkPrice {...props} />
      <LiqPrice {...props} />
    </Grid>
  );
};

const Buttons: FC<PositionCellState> = (props) => {
  return (
    <Grid width={"100%"} gap={2} cols={3} rows={1}>
      <TpSLBtnWidget state={props} />
      <LimitCloseBtnWidget state={props} />
      <MarketCloseBtnWidget state={props} />
    </Grid>
  );
};
