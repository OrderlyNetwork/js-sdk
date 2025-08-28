import { FC } from "react";
import { API } from "@orderly.network/types";
import {
  cn,
  DataFilter,
  Flex,
  Grid,
  ListView,
  Text,
} from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useLiquidationColumn } from "./desktop/useLiquidationColumn";
import { LiquidationState } from "./liquidation.script";
import { LiquidationCellWidget } from "./mobile";

export const Liquidation: FC<LiquidationState> = (props) => {
  const column = useLiquidationColumn({});

  return (
    <Flex direction="column" width="100%" height="100%" itemAlign="start">
      {/* <Divider className="oui-w-full" /> */}
      <Flex gap={3}>
        {props.filterItems.length > 0 && (
          <DataFilter
            items={props.filterItems}
            onFilter={(value: any) => {
              props.onFilter(value);
            }}
          />
        )}
        {[1, 7, 30, 90].map((value) => {
          return (
            <button
              key={`item-${value}`}
              className="oui-relative oui-px-2 oui-py-[2px] oui-text-sm"
            >
              <div className="oui-z-10">
                <Text.gradient
                  color={props.filterDays === value ? "brand" : undefined}
                  className={
                    props.filterDays !== value
                      ? "oui-text-base-contrast-54"
                      : ""
                  }
                >
                  {`${value}D`}
                </Text.gradient>
              </div>
              <div
                className="oui-absolute oui-inset-0 oui-rounded oui-opacity-[.12] oui-gradient-primary"
                onClick={() => {
                  props.updateFilterDays(value as any);
                }}
              ></div>
            </button>
          );
        })}
      </Flex>

      <AuthGuardDataTable<API.Liquidation>
        loading={props.isLoading}
        id="oui-desktop-liquidation-content"
        columns={column}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record: API.Liquidation) =>
          `${record.liquidation_id}`
        }
        // manualPagination={false}
        pagination={props.pagination}
        testIds={{
          body: "oui-testid-dataList-liquidation-tab-body",
        }}
        classNames={{
          root: "!oui-h-[calc(100%_-_49px)]",
        }}
      />
    </Flex>
  );
};

export const MobileLiquidation: FC<
  LiquidationState & {
    classNames?: {
      root?: string;
      content?: string;
      cell?: string;
    };
  }
> = (props) => {
  return (
    <Grid
      cols={1}
      rows={2}
      className="oui-w-full oui-grid-rows-[auto,1fr]"
      gap={1}
    >
      <Flex gap={2} p={2} className="oui-rounded-b-xl oui-bg-base-9">
        <DataFilter
          className="oui-border-none oui-py-0"
          items={props.filterItems}
          onFilter={(value: any) => {
            props.onFilter(value);
          }}
        />
      </Flex>
      <ListView
        className={cn(
          "oui-hide-scrollbar oui-w-full oui-space-y-0 oui-overflow-y-hidden",
          props.classNames?.root,
        )}
        contentClassName={cn("!oui-space-y-1", props.classNames?.content)}
        dataSource={props.dataSource}
        loadMore={props.loadMore}
        renderItem={(item, index) => (
          <LiquidationCellWidget
            item={item}
            index={index}
            classNames={{
              root: props.classNames?.cell,
            }}
          />
        )}
      />
    </Grid>
  );
};
