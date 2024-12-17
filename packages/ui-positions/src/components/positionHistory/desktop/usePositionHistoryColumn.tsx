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
import { commifyOptional } from "@orderly.network/utils";

export const usePositionHistoryColumn = (props: {
  onSymbolChange?: (symbol: API.Symbol) => void;
  pnlNotionalDecimalPrecision?: number;
}) => {
  const { onSymbolChange, pnlNotionalDecimalPrecision } = props;

  const column = useMemo(
    () =>
      [
        // instrument
        {
          title: "Instrument",
          dataIndex: "symbol",
          fixed: "left",
          width: 200,
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
          width: 200,
          render: (value: string, record) => <Quantity record={record} />,
        },
        // net pnl
        {
          title: "Net PnL",
          dataIndex: "netPnL",
          width: 140,
          onSort: (a, b) => {
            if (a.netPnL == null || b.netPnL == null) return -1;
            return (a.netPnL ?? 0) - (b.netPnL ?? 0);
          },
          render: (_: any, record) => (
            <NetPnL
              record={record}
              pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
            />
          ),
        },
        // avg open
        {
          title: "Avg. open",
          dataIndex: "avg_open",
          width: 140,
          render: (_: any, record) => {
            const avgOpen =
              record.avg_open_price != null
                ? Math.abs(record.avg_open_price)
                : "--";
            const { quote_dp } = useSymbolContext();
            return (
              <Text.numeral dp={quote_dp} padding={false}>
                {avgOpen}
              </Text.numeral>
            );
          },
        },
        // avg close
        {
          title: "Avg. close",
          dataIndex: "avg_close",
          width: 175,
          render: (_: any, record) => {
            const avgClose =
              record.avg_close_price != null
                ? Math.abs(record.avg_close_price)
                : "--";
            const { quote_dp } = useSymbolContext();
            return (
              <Text.numeral dp={quote_dp} padding={false}>
                {avgClose}
              </Text.numeral>
            );
          },
        },
        // time opened
        {
          title: "Time opened",
          dataIndex: "open_timestamp",
          width: 175,
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
          width: 175,
          onSort: true,
          render: (_: any, record) => {
            if (record.position_status == "closed" && record.close_timestamp) {
              return (
                <Text.formatted
                  rule={"date"}
                  formatString="yyyy-MM-dd hh:mm:ss"
                >
                  {record.close_timestamp ?? "--"}
                </Text.formatted>
              );
            }
            return "--";
          },
        },
        // updated time
        {
          title: "Updated time",
          dataIndex: "last_update_time",
          width: 175,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss">
              {record.last_update_time}
            </Text.formatted>
          ),
        },
      ] as Column<PositionHistoryExt>[],
    [pnlNotionalDecimalPrecision]
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
        {capitalizeFirstLetter(record.position_status.replace("_", " "))}
      </Badge>
    );

    if (record.type === "adl") {
      list.push(
        <Badge color={"neutral"} size="xs">
          {capitalizeFirstLetter(record.type)}
        </Badge>
      );
    } else if (record.type === "liquidated") {
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
                <Text intensity={98}>{record.liquidation_id}</Text>
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
        height={38}
        className={cn(
          "oui-rounded-[1px] oui-shrink-0",
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
      direction={"column"}
      itemAlign={"start"}
      className="oui-overflow-hidden oui-whitespace-nowrap oui-text-ellipsis"
    >
      <Text.numeral dp={base_dp}>
        {Math.abs(record.closed_position_qty)}
      </Text.numeral>
      <Text.numeral dp={base_dp} className="oui-truncate">
        {Math.abs(record.max_position_qty)}
      </Text.numeral>
      {/* <Text className="oui-truncate">{`${record.symbol.split("_")[1]}`}</Text> */}
    </Flex>
  );
};

export const NetPnL = (props: {
  record: PositionHistoryExt;
  pnlNotionalDecimalPrecision?: number;
}) => {
  const { record, pnlNotionalDecimalPrecision } = props;

  const netPnl = record.netPnL != null ? Math.abs(record.netPnL) : undefined;

  const text = () => (
    <Text.numeral
      dp={pnlNotionalDecimalPrecision}
      color={record.netPnL != null ? (record.netPnL > 0 ? "profit" : "lose") : undefined}
      className={
        netPnl == null
          ? ""
          : "oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12"
      }
    >
      {netPnl ?? "--"}
    </Text.numeral>
  );

  console.log("record.netPnL", record.symbol, record.max_position_qty, record.netPnL);

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
              <Text
                color={record.realized_pnl >= 0 ? "profit" : "lose"}
                className="oui-cursor-pointer"
              >
                {commifyOptional(record.realized_pnl)}
              </Text>
            </Flex>
            <Flex justify={"between"} width={"100%"} gap={2}>
              <Text intensity={54}>Funding fee</Text>
              <Text
                color={record.accumulated_funding_fee >= 0 ? "profit" : "lose"}
                className="oui-cursor-pointer"
              >
                {commifyOptional(record.accumulated_funding_fee)}
              </Text>
            </Flex>
            <Flex justify={"between"} width={"100%"} gap={2}>
              <Text intensity={54}>Trading fee</Text>
              <Text
                color={record.trading_fee >= 0 ? "profit" : "lose"}
                className="oui-cursor-pointer"
              >
                {commifyOptional(record.trading_fee)}
              </Text>
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
