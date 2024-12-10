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
          className="oui-min-w-[204px] oui-bg-base-5"
          tooltipProps={{
            arrow: {
              className: "oui-fill-base-5",
            },
          }}
          // @ts-ignore
          content={
            <Flex
              direction={"column"}
              itemAlign={"start"}
              className="oui-text-2xs"
            >
              <Flex justify={"between"} width={"100%"} gap={2}>
                <Text intensity={54}>Liquidation id</Text>
                <Text.numeral intensity={98}>
                  {record.liquidation_id}
                </Text.numeral>
              </Flex>
              <Flex justify={"between"} width={"100%"} gap={2}>
                <Text intensity={54}>Liquidator fee</Text>
                <Text.numeral coloring>{record.liquidator_fee}</Text.numeral>
              </Flex>
              <Flex justify={"between"} width={"100%"} gap={2}>
                <Text intensity={54}>Ins. Fund fee</Text>
                <Text.numeral coloring>
                  {record.insurance_fund_fee}
                </Text.numeral>
              </Flex>
            </Flex>
          }
        >
          <div>
            <Badge size="xs" color="danger" className="oui-cursor-pointer">
              <span className="oui-underline oui-decoration-dashed oui-decoration-[1px]">
                {capitalizeFirstLetter(record.type)}
              </span>
            </Badge>
          </div>
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
    <Flex
      gap={1}
      className="oui-overflow-hidden oui-whitespace-nowrap oui-text-ellipsis"
    >
      <Text.numeral dp={base_dp}>{record.closed_position_qty}</Text.numeral>/
      <Text.numeral dp={base_dp} className="oui-truncate">
        {record.max_position_qty}
      </Text.numeral>
      {/* <Text className="oui-truncate">{`${record.symbol.split("_")[1]}`}</Text> */}
    </Flex>
  );
};

export const NetPnL = (props: { record: PositionHistoryExt }) => {
  const { record } = props;

  const text = () => (
    <Text.numeral
      coloring
      className={record.netPnL == null ? "" : "oui-cursor-pointer"}
    >
      {record.netPnL ?? "--"}
    </Text.numeral>
  );

  if (record.netPnL == null) return text();

  return (
    <Flex>
      <Tooltip
        // open={record.max_position_qty == 3.22}
        delayDuration={200}
        // @ts-ignore
        content={
          <Flex
            direction={"column"}
            itemAlign={"start"}
            className="oui-text-2xs"
          >
            <Text intensity={80}>Net PnL</Text>
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
        }
        className="oui-min-w-[204px] oui-bg-base-5"
        tooltipProps={{
          arrow: {
            className: "oui-fill-base-5",
          },
        }}
      >
        <div>{text()}</div>
      </Tooltip>
    </Flex>
  );
};
