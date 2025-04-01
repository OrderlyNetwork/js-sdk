import { FC, SVGProps } from "react";
import {
  Box,
  CloseCircleFillIcon,
  cn,
  DataFilter,
  Flex,
  Input,
  Text,
} from "@orderly.network/ui";
import {
  FilterDays,
  TradingData,
  TradingListScriptReturn,
} from "./tradingList.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useTradingListColumns } from "./column";
import { useTranslation } from "@orderly.network/i18n";

export type TradingListProps = {
  style?: React.CSSProperties;
  className?: string;
} & TradingListScriptReturn;

export const TradingList: FC<TradingListProps> = (props) => {
  const column = useTradingListColumns();
  const { t } = useTranslation();

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
      <Flex
        width="100%"
        justify="between"
        itemAlign="center"
        mt={2}
        className={cn(
          "oui-trading-leaderboard-trading-filter",
          "oui-border-b oui-border-line"
        )}
      >
        <Flex gap={3}>
          {props.filterItems.length > 0 && (
            <DataFilter
              items={props.filterItems}
              onFilter={(value: any) => {
                props.onFilter(value);
              }}
              className="oui-h-[53px] oui-border-none"
            />
          )}
          {FilterDays.map((value) => {
            return (
              <button
                className="oui-relative oui-px-2 oui-py-[2px] oui-text-sm"
                key={value}
              >
                <div className="oui-z-10">
                  <Text.gradient
                    color={props.filterDay === value ? "brand" : undefined}
                    className={
                      props.filterDay !== value
                        ? "oui-text-base-contrast-54"
                        : ""
                    }
                  >
                    {`${value}D`}
                  </Text.gradient>
                </div>
                <div
                  className="oui-gradient-primary oui-opacity-[.12] oui-absolute oui-left-0 oui-right-0 oui-top-0 oui-bottom-0 oui-rounded"
                  onClick={() => {
                    props.updateFilterDay(value as any);
                  }}
                ></div>
              </button>
            );
          })}
        </Flex>
        <Input
          value={props.searchValue}
          onValueChange={props.onSearchValueChange}
          placeholder={t("common.address.search.placeholder")}
          className={cn(
            "oui-trading-leaderboard-trading-search-input",
            "oui-w-[240px]"
          )}
          size="sm"
          prefix={
            <Box pl={3} pr={1}>
              <SearchIcon className="oui-text-base-contrast-36" />
            </Box>
          }
          suffix={
            props.searchValue && (
              <Box mr={2}>
                <CloseCircleFillIcon
                  size={14}
                  className="oui-text-base-contrast-36 oui-cursor-pointer"
                  onClick={props.clearSearchValue}
                />
              </Box>
            )
          }
          autoComplete="off"
        />
      </Flex>

      <AuthGuardDataTable
        loading={props.isLoading}
        id="oui-trading-leaderboard-trading-table"
        columns={column}
        initialSort={props.initialSort}
        onSort={props.onSort}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record: TradingData) => record.address}
        manualPagination
        manualSorting
        pagination={props.pagination}
        classNames={{
          root: "!oui-h-[calc(100%_-_53px_-_8px)]",
        }}
        onRow={(record, index) => {
          return {
            className: cn("oui-h-[48px]"),
          };
        }}
      />
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
