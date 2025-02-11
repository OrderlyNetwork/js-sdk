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
import { commifyOptional } from "@orderly.network/utils";

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
        <Flex
          direction={"column"}
          width={"100%"}
          gap={2}
          className="oui-text-2xs oui-text-base-contrast-54"
        >
          {record.liquidation_id != null && (
            <Flex justify={"between"} width={"100%"}>
              <Text>Liquidation id</Text>
              <Text intensity={98}>{record.liquidation_id}</Text>
            </Flex>
          )}
          <Flex justify={"between"} width={"100%"}>
            <Text>Liquidator fee</Text>
            <Text color="lose">
              -{commifyOptional(record.liquidator_fee)}
            </Text>
          </Flex>
          <Flex justify={"between"} width={"100%"}>
            <Text>Ins. Fund fee</Text>
            <Text color="lose">
              -{commifyOptional(record.insurance_fund_fee)}
            </Text>
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
        {capitalizeFirstLetter(
          record.position_status === "partial_closed"
            ? "Partially closed"
            : record.position_status.replace("_", " ")
        )}
      </Badge>
    );

    if (record.type === "adl") {
      list.push(
        <Badge color={"danger"} size="xs">
          {capitalizeFirstLetter(record.type)}
        </Badge>
      );
    } else if (record.type === "liquidated") {
      list.push(
        <Badge
          size="xs"
          color="danger"
          className="oui-cursor-pointer"
          onClick={showAlert}
        >
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
  const closedQty =
    item.closed_position_qty != null
      ? Math.abs(item.closed_position_qty)
      : "--";

  return (
    <Statistic
      // label={
      //   <Text>Closed{<Text intensity={20}>{` (${props.base})`}</Text>}</Text>
      // }
      label={<Text>Closed</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {closedQty}
      </Text.numeral>
    </Statistic>
  );
};

export const MaxClosedQty: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const maxClosedQty =
    item.max_position_qty != null ? Math.abs(item.max_position_qty) : "--";
  return (
    <Statistic
      // label={
      //   <Text>
      //     Max closed{<Text intensity={20}>{` (${props.base})`}</Text>}
      //   </Text>
      // }
      label={<Text>Max closed</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {maxClosedQty}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgOpen: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const avgOpen =
    item.avg_open_price != null ? Math.abs(item.avg_open_price) : "--";

  return (
    <Statistic
      label={<Text>Avg. open{<Text intensity={20}>{" (USDC)"}</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} padding={false} coloring intensity={80}>
        {avgOpen}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgClosed: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const avgClose =
    item.avg_close_price != null ? Math.abs(item.avg_close_price) : "--";

  return (
    <Statistic
      label={<Text>Avg. close{<Text intensity={20}>{" (USDC)"}</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} padding={false} coloring intensity={80}>
        {avgClose}
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
        formatString="yyyy-MM-dd HH:mm:ss"
        rule={"date"}
      >
        {item.open_timestamp}
      </Text.formatted>
    </Statistic>
  );
};
export const ClosedTime: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  const child =
    item.position_status == "closed" && item.close_timestamp ? (
      <Text.formatted
        intensity={80}
        formatString="yyyy-MM-dd HH:mm:ss"
        rule={"date"}
      >
        {item.close_timestamp}
      </Text.formatted>
    ) : (
      "--"
    );

  return (
    <Statistic
      label={"Time closed"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      {child}
    </Statistic>
  );
};
