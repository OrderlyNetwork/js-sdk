import { FC } from "react";
import { cn, DataFilter, Flex, ListView, Text } from "@orderly.network/ui";
import {
  PositionHistoryExt,
  PositionHistoryState,
} from "./positionHistory.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { API } from "@orderly.network/types";
import { usePositionHistoryColumn } from "./desktop/usePositionHistoryColumn";
import { SymbolProvider } from "../../providers/symbolProvider";
import { PositionHistoryCellWidget } from "./mobile";

export const PositionHistory: FC<PositionHistoryState> = (props) => {
  const { onSymbolChange, pagination } = props;
  const column = usePositionHistoryColumn({
    onSymbolChange,
  });

  return (
    <Flex direction="column" width="100%" height="100%" itemAlign="start">
      {/* <Divider className="oui-w-full" /> */}
      {props.filterItems.length > 0 && (
        <DataFilter
          items={props.filterItems}
          onFilter={(value: any) => {
            props.onFilter(value);
          }}
        />
      )}

      <AuthGuardDataTable<PositionHistoryExt>
        loading={props.isLoading}
        id="oui-desktop-positions-content"
        columns={column}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record: PositionHistoryExt) =>
          `${record.symbol}_${record.position_id}`
        }
        renderRowContainer={(record: any, index: number, children: any) => {
          return (
            <SymbolProvider symbol={record.symbol}>{children}</SymbolProvider>
          );
        }}
        manualPagination={false}
        pagination={pagination}
        testIds={{
          body: "oui-testid-dataList-positionHistory-tab-body",
        }}
      />
    </Flex>
  );
};

export const MobilePositionHistory: FC<
  PositionHistoryState & {
    classNames?: {
      root?: string;
      content?: string;
      cell?: string;
    };
  }
> = (props) => {
  return (
    <ListView
      className={cn(
        "oui-w-full oui-hide-scrollbar oui-overflow-y-hidden oui-space-y-0",
        props.classNames?.root
      )}
      contentClassName={cn("!oui-space-y-1", props.classNames?.content)}
      dataSource={props.dataSource}
      renderItem={(item, index) => (
        <SymbolProvider symbol={item.symbol}>
          <PositionHistoryCellWidget
            item={item}
            index={index}
            onSymbolChange={props.onSymbolChange}
            classNames={{
              root: props.classNames?.cell,
            }}
          />
        </SymbolProvider>
      )}
    />
  );
};
