import { FC, ReactNode, useMemo } from "react";
import {
  PositionHistoryExt,
  PositionHistorySide,
} from "../positionHistory.script";
import { API } from "@orderly.network/types";
import {
  Badge,
  capitalizeFirstLetter,
  Flex,
  modal,
  Statistic,
  Text,
} from "@orderly.network/ui";
import { PositionHistoryCellState } from "./positionHistoryCell.script";
import { PositionsRowContextState } from "../../positions/desktop/positionRowContext";

export const SymbolToken: FC<PositionHistoryCellState> = (props) => {
  const { side, symbol } = props.item;
  const isBuy = side === PositionHistorySide.buy;
  return (
    <Text.formatted
      intensity={80}
      rule="symbol"
      formatString="base-type"
      size="sm"
      // @ts-ignore
      prefix={
        <Badge color={isBuy ? "success" : "danger"} size="xs">
          {isBuy ? "Buy" : "Sell"}
        </Badge>
      }
      onClick={() => {
        props.onSymbolChange?.({ symbol: symbol } as API.Symbol);
      }}
      // showIcon
    >
      {symbol}
    </Text.formatted>
  );
};

export const Time: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Text.formatted
      rule={"date"}
      formatString="yyyy-MM-dd hh:mm:ss"
      intensity={36}
      size="2xs"
    >
      {item.last_update_time}
    </Text.formatted>
  );
};

export const PositionHistoryType: FC<PositionHistoryCellState> = (props) => {
  const { item: record } = props;

  const showAlert = () => {
    modal.alert({
      title: "Liquidation",
      message: (
        <Flex direction={"column"}>
          <Flex justify={"between"}>
            <Text>Liquidation id</Text>
            <Text.numeral coloring>{record.liquidation_id}</Text.numeral>
          </Flex>
          <Flex justify={"between"}>
            <Text>Liquidator fee</Text>
            <Text.numeral coloring>{record.liquidator_fee}</Text.numeral>
          </Flex>
          <Flex justify={"between"}>
            <Text>Ins. Fund fee</Text>
            <Text.numeral coloring>{record.insurance_fund_fee}</Text.numeral>
          </Flex>
        </Flex>
      ),
    });
  };

  const tags = useMemo(() => {
    const list: ReactNode[] = [];

    list.push(
      <Badge
        color={record.position_status !== "closed" ? "primaryLight" : "neutral"}
        size="xs"
      >
        {capitalizeFirstLetter(record.position_status)}
      </Badge>
    );

    if (record.type === "adl") {
      <Badge color={"neutral"} size="xs">
        {capitalizeFirstLetter(record.type)}
      </Badge>;
    } else if (record.type === "trade") {
      list.push(
        <Badge size="xs" color="danger" className="oui-cursor-pointer" onClick={showAlert}>
            <span className="oui-underline oui-decoration-dashed oui-decoration-[1px]">
              {capitalizeFirstLetter(record.type)}
            </span>
          </Badge>
      );
    }

    return list;
  }, [record]);

  return <Flex gap={1}>{tags}</Flex>;
};

export const ClosedQty: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Closed"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {item.closed_position_qty}
      </Text.numeral>
    </Statistic>
  );
};

export const MaxClosedQty: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Max closed"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {item.max_position_qty}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgOpen: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={<Text>Avg. open{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {item.avg_open_price}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgClosed: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={<Text>Avg. closed{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {item.avg_open_price}
      </Text.numeral>
    </Statistic>
  );
};

export const OpenTime: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Time opened"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      <Text.formatted
        intensity={80}
        formatString="yyyy-MM-dd hh:mm:ss"
        rule={"date"}
      >
        {item.open_timestamp}
      </Text.formatted>
    </Statistic>
  );
};
export const ClosedTime: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Time closed"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      <Text.formatted
        intensity={80}
        formatString="yyyy-MM-dd hh:mm:ss"
        rule={"date"}
      >
        {item.position_status === 'closed' ? item.close_timestamp : "--"}
      </Text.formatted>
    </Statistic>
  );
};
