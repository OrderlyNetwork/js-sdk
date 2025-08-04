import { FC } from "react";
import { OrderType } from "@orderly.network/types";
import { cn, Divider, Flex, Grid } from "@orderly.network/ui";
import { ClosePositionWidget } from "../../closePosition";
import { TpSLBtnWidget } from "../tpSLBtn";
import {
  UnrealPnL,
  SymbolToken,
  Qty,
  Margin,
  Notional,
  AvgOpen,
  MarkPrice,
  LiqPrice,
  TPSLPrice,
  FundingFee,
} from "./items";
import { PositionCellState } from "./positionCell.script";

export const PositionCell: FC<
  PositionCellState & {
    className?: string;
  }
> = (props) => {
  const { className, ...rest } = props;

  const header = (
    <Flex justify={"between"} width={"100%"}>
      <SymbolToken {...props} />
      <UnrealPnL {...props} />
    </Flex>
  );

  const body = (
    <Grid cols={3} rows={2} gap={2} width={"100%"}>
      <Qty {...props} />
      <Margin {...props} />
      <Notional {...props} />
      <AvgOpen {...props} />
      <MarkPrice {...props} />
      <LiqPrice {...props} />
    </Grid>
  );

  const buttons = (
    <Grid width={"100%"} gap={2} cols={2} rows={1}>
      <ClosePositionWidget type={OrderType.LIMIT} />
      <ClosePositionWidget type={OrderType.MARKET} />
    </Grid>
  );

  return (
    <Flex
      direction={"column"}
      width={"100%"}
      gap={2}
      p={2}
      r="xl"
      itemAlign={"start"}
      className={cn(className, "oui-bg-base-9")}
    >
      {header}
      <Divider intensity={6} className="oui-w-full" />
      {body}
      <TPSLPrice {...rest} />
      <FundingFee {...rest} />
      {buttons}
    </Flex>
  );
};
