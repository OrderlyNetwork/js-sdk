import { FC, SVGProps } from "react";
import { cn, DataFilter, DataTable, Flex, Spinner } from "@veltodefi/ui";
import { useTradingListColumns } from "./column";
import {
  getRowKey,
  TradingData,
  TradingListScriptReturn,
} from "./tradingList.script";

export type TradingListProps = {
  style?: React.CSSProperties;
  className?: string;
} & TradingListScriptReturn;

export const MobileTradingList: FC<TradingListProps> = (props) => {
  const column = useTradingListColumns(props.address);

  return (
    <Flex
      direction="column"
      width="100%"
      itemAlign="start"
      intensity={900}
      r="2xl"
      px={4}
      style={props.style}
      className={cn(
        "oui-mobile-trading-leaderboard-trading-list",
        props.className,
      )}
    >
      <Flex
        width="100%"
        justify="between"
        itemAlign="center"
        className={cn("oui-mobile-trading-leaderboard-trading-filter")}
      >
        {props.filterItems.length > 0 && (
          <DataFilter
            items={props.filterItems}
            onFilter={(value: any) => {
              props.onFilter(value);
            }}
            className="oui-h-[40px] oui-border-none"
          />
        )}
      </Flex>

      <DataTable
        classNames={{
          root: "oui-pb-4",
          body: "oui-text-2xs",
          scroll: "oui-overflow-y-hidden oui-h-full",
        }}
        loading={props.isLoading}
        id="oui-trading-leaderboard-trading-table"
        columns={column}
        initialSort={props.initialSort}
        onSort={props.onSort}
        dataSource={props.dataList}
        generatedRowKey={(record: TradingData) => record.key || record.address}
        manualPagination
        manualSorting
        onRow={(record, index) => {
          return {
            className: cn("oui-h-[30px]"),
          };
        }}
        onCell={(column, record, index) => {
          if (record.key === getRowKey(props.address!)) {
            const isFirst = column.getIsFirstColumn();
            const isLast = column.getIsLastColumn();

            return {
              className: cn(
                "after:oui-absolute after:oui-h-[30px] after:oui-w-full",
                "after:oui-border-[rgb(var(--oui-gradient-brand-start))]",
                " after:oui-left-0 after:oui-top-0 after:oui-z-[-1]",
                "after:oui-border-y",
                isFirst && "after:oui-rounded-l-lg after:oui-border-l",
                isLast && "after:oui-rounded-r-lg  after:oui-border-r",
              ),
            };
          }
          return {};
        }}
      />
      <div
        ref={props.sentinelRef}
        className="oui-invisible oui-relative oui-top-[-300px] oui-h-px"
      />
      {props.isLoading && props.dataList.length > 0 && (
        <Flex itemAlign="center" justify="center" width="100%" height={40}>
          <Spinner size="sm" />
        </Flex>
      )}
    </Flex>
  );
};

export const SearchIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5.841 1.14a4.667 4.667 0 0 0 0 9.333 4.74 4.74 0 0 0 2.875-.975l2.54 2.56a.6.6 0 0 0 .838 0 .6.6 0 0 0 0-.838L9.537 8.677a4.72 4.72 0 0 0 .971-2.871 4.667 4.667 0 0 0-4.667-4.667m0 1.166a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
  </svg>
);
