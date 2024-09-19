import { FC } from "react";
import { cn, DataTable } from "@orderly.network/ui";
import { type UseMarketsListReturn } from "./marketsList.script";
import { TInitialSort } from "../../type";
import { useMarketsContext } from "../marketsProvider";
import { useMarketsListColumns } from "./column";

export type MarketsListProps = UseMarketsListReturn & {
  initialSort: TInitialSort;
};

export const MarketsList: FC<MarketsListProps> = (props) => {
  const { loading, dataSource, favorite, onSort, initialSort } = props;

  const { onSymbolChange } = useMarketsContext();

  const columns = useMarketsListColumns(favorite);

  return (
    <DataTable
      bordered
      classNames={{
        root: "oui-h-full",
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80 oui-h-[600px] oui-overflow-y-auto custom-scrollbar",
      }}
      columns={columns}
      loading={loading}
      dataSource={dataSource}
      onRow={(record, index) => {
        return {
          className: cn(
            "group",
            "oui-h-[53px] oui-border-none oui-rounded-[6px]"
          ),
          onClick: () => {
            onSymbolChange?.(record);
            favorite.addToHistory(record);
          },
        };
      }}
      generatedRowKey={(record) => record.symbol}
      onSort={onSort}
      initialSort={initialSort}
    />
  );
};
