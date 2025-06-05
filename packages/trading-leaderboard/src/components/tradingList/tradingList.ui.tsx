import { FC, useCallback } from "react";
import { cn, DataTable, Flex, TanstackColumn } from "@orderly.network/ui";
import { useTradingListColumns } from "./column";
import {
  getCurrentAddressRowKey,
  TradingData,
  TradingListScriptReturn,
} from "./tradingList.script";

export type TradingListProps = {
  style?: React.CSSProperties;
  className?: string;
} & TradingListScriptReturn;

export const TradingList: FC<TradingListProps> = (props) => {
  const column = useTradingListColumns(props.address);

  const onRow = useCallback(
    (record: TradingData, index: number) => {
      return {
        className: cn(
          "oui-h-[48px]",
          record.rank === 1 &&
            record.key !== getCurrentAddressRowKey(props.address!) &&
            "oui-bg-[linear-gradient(270deg,rgba(241,215,121,0.0225)_-2.05%,rgba(255,203,70,0.45)_100%)]",
          record.rank === 2 &&
            "oui-bg-[linear-gradient(270deg,rgba(255,255,255,0.0225)_-2.05%,rgba(199,199,199,0.45)_100%)]",
          record.rank === 3 &&
            "oui-bg-[linear-gradient(270deg,rgba(255,233,157,0.0225)_-1.3%,rgba(160,101,46,0.45)_100%)]",
        ),
      };
    },
    [props.address],
  );

  const onCell = useCallback(
    (
      column: TanstackColumn<TradingData>,
      record: TradingData,
      index: number,
    ) => {
      const isFirst = column.getIsFirstColumn();
      const isLast = column.getIsLastColumn();
      if (record.key === getCurrentAddressRowKey(props.address!)) {
        return {
          className: cn(
            "after:oui-absolute after:oui-h-[48px] after:oui-w-full",
            "after:oui-border-[rgb(var(--oui-gradient-brand-start))]",
            "after:oui-left-0 after:oui-top-0 after:oui-z-[-1]",
            "after:oui-border-y",
            isFirst && "after:oui-rounded-l-lg after:oui-border-l",
            isLast && "after:oui-rounded-r-lg after:oui-border-r",
          ),
        };
      }
      return {
        className: cn(
          isFirst &&
            [1, 2, 3].includes(record.rank as number) &&
            "oui-rounded-l-lg oui-mix-blend-luminosity",
          isLast &&
            [1, 2, 3].includes(record.rank as number) &&
            "oui-rounded-r-lg",
        ),
      };
    },
    [props.address],
  );

  return (
    <Flex
      direction="column"
      width="100%"
      itemAlign="start"
      intensity={900}
      r="2xl"
      px={4}
      style={props.style}
      className={cn("oui-trading-leaderboard-trading-list", props.className)}
    >
      <DataTable
        loading={props.isLoading}
        id="oui-trading-leaderboard-trading-table"
        columns={column}
        initialSort={props.initialSort}
        onSort={props.onSort}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record: TradingData) => record.key || record.address}
        manualPagination
        manualSorting
        pagination={props.pagination}
        classNames={{
          root: "!oui-h-[calc(100%_-_53px_-_8px)]",
        }}
        onRow={onRow}
        onCell={onCell}
      />
    </Flex>
  );
};
