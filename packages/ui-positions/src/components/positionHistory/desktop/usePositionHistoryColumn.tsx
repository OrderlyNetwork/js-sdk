import { API } from "@orderly.network/types";
import { Box, cn, Column, Flex, Text, Tooltip } from "@orderly.network/ui";
import { useMemo } from "react";

export const usePositionHistoryColumn = (props: {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbolsInfo: any;
}) => {
  const { symbolsInfo, onSymbolChange } = props;

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
          width: 140,
          render: (value: string, record) => (
            <Quantity record={record} symbolsInfo={symbolsInfo} />
          ),
        },
        // net pnl
        {
          title: "Net PnL",
          dataIndex: "net_pnl",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <NetPnL record={record} />
          ),
        },
        // avg open
        {
          title: "Avg. open",
          dataIndex: "avg_open",
          width: 140,
          render: (_: any, record) => (
            <Text.numeral  >{record.avg_open_price}</Text.numeral>
          ),
        },
        // avg close
        {
          title: "Avg. close",
          dataIndex: "avg_close",
          width: 140,
          render: (_: any, record) => (
            <Text.numeral >{record.avg_close_price}</Text.numeral>
          ),
        },
        // time opened
        {
          title: "Avg. close",
          dataIndex: "open_timestamp",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss" >{record.open_timestamp}</Text.formatted>
          ),
        },
        // time close
        {
          title: "Avg. close",
          dataIndex: "close_timestamp",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss" >{record.close_timestamp}</Text.formatted>
          ),
        },
        // updated time
        {
          title: "Avg. close",
          dataIndex: "last_update_timestamp",
          width: 140,
          onSort: true,
          render: (_: any, record) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss" >{record.last_update_timestamp}</Text.formatted>
          ),
        },

      ] as Column<API.PositionHistory>[],
    [symbolsInfo]
  );

  return column;
};

export const SymbolInfo = (props: {
  record: API.PositionHistory;
  onSymbolChange?: (symbol: API.Symbol) => void;
}) => {
  const { record, onSymbolChange } = props;

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
    </Flex>
  );
};

export const Quantity = (props: { record: API.PositionHistory; symbolsInfo: any }) => {
  const { record, symbolsInfo } = props;

  const { base_dp } = symbolsInfo?.[record.symbol]();

  return (
    <Flex gap={1}>
      <Text.numeral dp={base_dp}>{record.closed_position_qty}</Text.numeral>/
      <Text.numeral dp={base_dp}>{record.max_position_qty}</Text.numeral>
      <Text>{`${record.symbol.split("_")[1]}`}</Text>
    </Flex>
  );
};


export const NetPnL = (props: {
    record: API.PositionHistory;
}) => {
    // Net PnL = realized_pnl - accumulated_funding_fee - trading_fee
    const { record } = props;
    const netPnL = record.realized_pnl - record.accumulated_funding_fee - record.trading_fee;
return (<Tooltip>
    <Text.numeral>
        {netPnL}
    </Text.numeral>
</Tooltip>);
};