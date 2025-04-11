import { FC, useMemo } from "react";
import {
  cn,
  DataFilter,
  Flex,
  Grid,
  ListView,
  Text,
} from "@orderly.network/ui";
import {
  PositionHistoryExt,
  PositionHistoryState,
} from "./positionHistory.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { usePositionHistoryColumn } from "./desktop/usePositionHistoryColumn";
import { SymbolProvider } from "../../providers/symbolProvider";
import { PositionHistoryCellWidget } from "./mobile";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { useTranslation } from "@orderly.network/i18n";
type PositionHistoryProps = PositionHistoryState & {
  sharePnLConfig?: SharePnLConfig;
};

export const PositionHistory: FC<PositionHistoryProps> = (props) => {
  const { onSymbolChange, pagination, pnlNotionalDecimalPrecision } = props;
  const column = usePositionHistoryColumn({
    onSymbolChange,
    pnlNotionalDecimalPrecision,
    sharePnLConfig: props.sharePnLConfig,
  });

  const { t } = useTranslation();

  const dayLabel: Record<number, string> = useMemo(() => {
    return {
      1: t("common.select.1d"),
      7: t("common.select.7d"),
      30: t("common.select.30d"),
      90: t("common.select.90d"),
    };
  }, [t]);

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
            <button className="oui-relative oui-px-2 oui-py-[2px] oui-text-sm">
              <div className="oui-z-10">
                <Text.gradient
                  color={props.filterDays === value ? "brand" : undefined}
                  className={cn(
                    "oui-break-normal oui-whitespace-nowrap",
                    props.filterDays !== value
                      ? "oui-text-base-contrast-54"
                      : ""
                  )}
                >
                  {dayLabel[value] || `${value}D`}
                </Text.gradient>
              </div>
              <div
                className="oui-gradient-primary oui-opacity-[.12] oui-absolute oui-left-0 oui-right-0 oui-top-0 oui-bottom-0 oui-rounded"
                onClick={() => {
                  props.updateFilterDays(value as any);
                }}
              ></div>
            </button>
          );
        })}
      </Flex>

      <AuthGuardDataTable<PositionHistoryExt>
        loading={props.isLoading}
        id="oui-desktop-positions-content"
        columns={column}
        bordered
        dataSource={props.dataSource}
        generatedRowKey={(record: PositionHistoryExt) =>
          `${record.symbol}_${record.position_id}`
        }
        renderRowContainer={(record: any, index: number, children: any) => (
          <SymbolProvider symbol={record.symbol}>{children}</SymbolProvider>
        )}
        manualPagination={false}
        pagination={pagination}
        testIds={{
          body: "oui-testid-dataList-positionHistory-tab-body",
        }}
        classNames={{
          root: "!oui-h-[calc(100%_-_49px)]",
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
    sharePnLConfig?: SharePnLConfig;
  }
> = (props) => {
  return (
    <Grid
      cols={1}
      rows={2}
      className="oui-grid-rows-[auto,1fr] oui-w-full"
      gap={1}
    >
      <Flex gap={2} p={2} className="oui-bg-base-9 oui-rounded-b-xl">
        <DataFilter
          className="oui-pt-0 oui-pb-0 oui-border-none"
          items={props.filterItems}
          onFilter={(value: any) => {
            props.onFilter(value);
          }}
        />
      </Flex>
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
              sharePnLConfig={props.sharePnLConfig}
            />
          </SymbolProvider>
        )}
      />
    </Grid>
  );
};
