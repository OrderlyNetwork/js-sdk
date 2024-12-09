import { FC } from "react";
import { Divider, Flex, Grid, Text } from "@orderly.network/ui";
import { PositionHistoryCellState } from "./positionHistoryCell.script";
import { PositionHistoryType, ClosedQty, SymbolToken, OpenTime, AvgOpen, AvgClosed, ClosedTime, MaxClosedQty } from "./items";

export const PositionHistoryCell: FC<PositionHistoryCellState> = (props) => {
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      gap={2}
      itemAlign={"start"}
      className={props.classNames?.root}
    >
      <Header {...props} />
      <Divider intensity={6} className="oui-w-full" />
      <Body {...props} />
    </Flex>
  );
};

export const Header: FC<PositionHistoryCellState> = (props) => {
  return (
    <Flex gap={1} width={"100%"}>
      <Flex direction={"column"} itemAlign={"start"} className="oui-flex-1" gap={1}>
        <SymbolToken {...props} />
        <PositionHistoryType {...props} />
      </Flex>
      <Flex direction={"column"} itemAlign={"end"}  className="oui-flex-1">
        <Text size="2xs" intensity={36}>Net PnL</Text>
        <Text.numeral size="xs" coloring>{props.item.netPnL ?? "--"}</Text.numeral>
      </Flex>
    </Flex>
  );
};

export const Body: FC<PositionHistoryCellState> = (props) => {
  return (
    <Grid cols={3} rows={2} width={"100%"} gap={1}>
      <ClosedQty {...props}/>
      <MaxClosedQty {...props}/>
      <OpenTime {...props}/>
      <AvgOpen {...props}/>
      <AvgClosed {...props}/>
      <ClosedTime {...props}/>
    </Grid>
  );
};
