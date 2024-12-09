import { API } from "@orderly.network/types";
import {
  Badge,
  Box,
  capitalizeFirstLetter,
  cn,
  Column,
  Flex,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { ReactNode } from "react";
import { useMemo } from "react";
import { PositionHistoryExt } from "../positionHistory.script";
import { useSymbolContext } from "../../../providers/symbolProvider";

export const usePositionHistoryColumn = (props: {
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { onSymbolChange } = props;

  const column = useMemo(
    () =>
      [
        // instrument
        {
          title: "Instrument",
          dataIndex: "symbol",
          fixed: "left",
          width: 140,
          onSort: (r1: any, r2: any) => {
            return r1.symbol.localeCompare(r2.symbol);
          },
          render: (value: string, record) => (
            <SymbolInfo record={record} onSymbolChange={onSymbolChange} />
          ),
        },
        // quantity
        {
          title: "Closed / Max closed",
          dataIndex: "close_maxClose",
          width: 175,
          render: (value: string, record) => <Quantity record={record} />,
        },
        // net pnl
        {
          title: "Net PnL",
          dataIndex: "netPnL",
          width: 140,
          onSort: true,
          render: (_: any, record) => <NetPnL record={record} />,
        },
        // avg open
        {
          title: "Avg. open",
          dataIndex: "avg_open",
          width: 140,
          render: (_: any, record) => (
            <Text.numeral>{record.avg_open_price}</Text.numeral>
          ),
        },
        // avg close
        {
          title: "Avg. close",
          dataIndex: "avg_close",
          width: 140,
          render: (_: any, record) => (
            <Text.numeral>{record.avg_close_price}</Text.numeral>
          ),
        },
        // time opened
        {
          title: "Time opened",
          dataIndex: "open_timestamp",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss">
              {record.open_timestamp}
            </Text.formatted>
          ),
        },
        // time close
        {
          title: "Time closed",
          dataIndex: "close_timestamp",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss">
              {record.close_timestamp}
            </Text.formatted>
          ),
        },
        // updated time
        {
          title: "Updated time",
          dataIndex: "last_update_timestamp",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss">
              {record.last_update_time}
            </Text.formatted>
          ),
        },
      ] as Column<PositionHistoryExt>[],
    []
  );

  return column;
};

export const SymbolInfo = (props: {
  record: PositionHistoryExt;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { record, onSymbolChange } = props;

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
    } else if (record.type === "liquidation") {
      list.push(
        <Tooltip
          className="oui-min-w-[204px] oui-p-2"
          // @ts-ignore
          content={
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
                <Text.numeral coloring>
                  {record.insurance_fund_fee}
                </Text.numeral>
              </Flex>
            </Flex>
          }
        >
          <Badge size="xs" color="danger" className="oui-cursor-pointer">
            <span className="oui-underline oui-decoration-dashed oui-decoration-[1px]">
              {capitalizeFirstLetter(record.type)}
            </span>
          </Badge>
        </Tooltip>
      );
    }

    return list;
  }, [record]);

  return (
    <Flex gap={2} height={48}>
      <Box
        width={4}
        height={20}
        className={cn(
          "oui-rounded-[1px]",
          record.side === "LONG" ? "oui-bg-trade-profit" : "oui-bg-trade-loss"
        )}
      />

      <Flex direction={"column"} itemAlign={"start"}>
        <Text.formatted
          // rule={"symbol"}
          formatString="base-type"
          className="oui-cursor-pointer"
          onClick={(e) => {
            onSymbolChange?.({ symbol: record.symbol } as API.Symbol);
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {`${record.symbol.split("_")[1]}-PERP`}
        </Text.formatted>
        <Flex gap={1}>{tags}</Flex>
      </Flex>
    </Flex>
  );
};

export const Quantity = (props: { record: PositionHistoryExt }) => {
  const { record } = props;

  const { base_dp } = useSymbolContext();

  return (
    <Flex gap={1} className="oui-overflow-hidden oui-whitespace-nowrap oui-text-ellipsis">
      <Text.numeral dp={base_dp}>{record.closed_position_qty}</Text.numeral>/
      <Text.numeral dp={base_dp} className="oui-truncate">{record.max_position_qty}</Text.numeral>
      {/* <Text className="oui-truncate">{`${record.symbol.split("_")[1]}`}</Text> */}
    </Flex>
  );
};

export const NetPnL = (props: { record: PositionHistoryExt }) => {
  const { record } = props;

  return (
    <Tooltip
      delayDuration={200}
      // @ts-ignore
      content={
        <Flex direction={"column"}>
          <Text intensity={80}>Net PnL</Text>
          <Flex justify={"between"}>
            <Text>Realized PnL</Text>
            <Text.numeral coloring>{record.realized_pnl}</Text.numeral>
          </Flex>
          <Flex justify={"between"}>
            <Text>Funding fee</Text>
            <Text.numeral coloring>
              {record.accumulated_funding_fee}
            </Text.numeral>
          </Flex>
          <Flex justify={"between"}>
            <Text>Trading fee</Text>
            <Text.numeral coloring>{record.trading_fee}</Text.numeral>
          </Flex>
        </Flex>
      }
      className="oui-p-2 oui-min-w-[204px]"
    >
      <Text.numeral coloring className="oui-cursor-pointer">
        {record.netPnL ?? "--"}
      </Text.numeral>
    </Tooltip>
  );
};
