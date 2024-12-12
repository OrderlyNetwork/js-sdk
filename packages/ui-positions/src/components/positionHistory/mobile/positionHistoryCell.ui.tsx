import { FC } from "react";
import { Divider, Flex, Grid, modal, Text } from "@orderly.network/ui";
import { PositionHistoryCellState } from "./positionHistoryCell.script";
import {
  PositionHistoryType,
  ClosedQty,
  SymbolToken,
  OpenTime,
  AvgOpen,
  AvgClosed,
  ClosedTime,
  MaxClosedQty,
} from "./items";

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
  const showAlert = () => {
    const { item: record } = props;
    modal.alert({
      title: "Net PnL",
      message: (
        <Flex
          direction={"column"}
          width={"100%"}
          gap={2}
          className="oui-text-2xs oui-text-base-contrast-54"
        >
          <Flex justify={"between"} width={"100%"} gap={2}>
            <Text intensity={54}>Realized PnL</Text>
            <Text.numeral coloring>{record.realized_pnl}</Text.numeral>
          </Flex>
          <Flex justify={"between"} width={"100%"} gap={2}>
            <Text intensity={54}>Funding fee</Text>
            <Text.numeral coloring>
              {record.accumulated_funding_fee}
            </Text.numeral>
          </Flex>
          <Flex justify={"between"} width={"100%"} gap={2}>
            <Text intensity={54}>Trading fee</Text>
            <Text.numeral coloring>{record.trading_fee}</Text.numeral>
          </Flex>
        </Flex>
      ),
    });
  };
  return (
    <Flex gap={1} width={"100%"}>
      <Flex
        direction={"column"}
        itemAlign={"start"}
        className="oui-flex-1"
        gap={1}
      >
        <SymbolToken {...props} />
        <PositionHistoryType {...props} />
      </Flex>
      <Flex direction={"column"} itemAlign={"end"} className="oui-flex-1">
        <Text size="2xs" intensity={36}>
          Net PnL
        </Text>
        <button onClick={showAlert}>
          <Text.numeral size="xs" coloring>
            {props.item.netPnL ?? "--"}
          </Text.numeral>
        </button>
      </Flex>
    </Flex>
  );
};

export const Body: FC<PositionHistoryCellState> = (props) => {
  return (
    <Grid cols={3} rows={2} width={"100%"} gap={1}>
      <ClosedQty {...props} />
      <MaxClosedQty {...props} />
      <OpenTime {...props} />
      <AvgOpen {...props} />
      <AvgClosed {...props} />
      <ClosedTime {...props} />
    </Grid>
  );
};
