/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Flex,
  Text,
  Card,
  Divider,
  DataTable,
  Column,
  useScreen,
  cn,
  TanstackColumn,
} from "@orderly.network/ui";
import type { FeeDataType, useFeeTierScriptReturn } from "./feeTier.script";

const LazyFeeTierHeader = React.lazy(() =>
  import("./feeTierHeader").then((mod) => {
    return { default: mod.FeeTierHeader };
  }),
);

export type FeeTierProps = useFeeTierScriptReturn;

export type FeeTierHeaderProps = {
  tier?: number;
  vol?: number;
};

type FeeTierTableProps = {
  columns: Column<any>[];
  dataSource?: any[];
  page?: number;
  pageSize?: number;
  dataCount?: number;
  tier?: number | null;
  vol?: number | null;
  onRow?: (
    record: any,
    index: number,
  ) => {
    normal?: any;
    active?: any;
  };
  onCell?: (
    column: TanstackColumn<any>,
    record: any,
    index: number,
  ) => {
    normal?: any;
    active?: any;
  };
};

export const FeeTierTable: React.FC<FeeTierTableProps> = (props) => {
  const { isMobile } = useScreen();

  const { tier, columns, dataSource, onRow, onCell } = props;

  const internalOnRow = useCallback(
    (record: FeeDataType, index: number) => {
      const config =
        typeof onRow === "function"
          ? onRow(record, index)
          : { normal: undefined, active: undefined };
      const active = tier !== undefined && tier !== null && tier === index + 1;
      if (active) {
        return {
          "data-state": "active",
          className: cn(
            "oui-pointer-events-none oui-h-[54px] oui-text-[rgba(0,0,0,0.88)] oui-gradient-primary",
          ),
          ...config.active,
        };
      } else {
        return {
          "data-state": "none",
          className: cn("oui-h-[54px]"),
          ...config.normal,
        };
      }
    },
    [tier, onRow],
  );

  const internalOnCell = useCallback(
    (
      column: TanstackColumn<FeeDataType>,
      record: FeeDataType,
      index: number,
    ) => {
      const config =
        typeof onCell === "function"
          ? onCell(column, record, index)
          : { normal: undefined, active: undefined };
      const active = tier !== undefined && tier !== null && tier === index + 1;
      const isFirstColumn = column.getIsFirstColumn();
      const isLastColumn = column.getIsLastColumn();
      if (active) {
        return {
          className: cn(
            isFirstColumn && "oui-rounded-l-lg",
            isLastColumn && "oui-rounded-r-lg",
          ),
          ...config.active,
        };
      } else {
        return {
          className: "",
          ...config.normal,
        };
      }
    },
    [tier, onCell],
  );

  return (
    <Box
      className={cn(
        "oui-relative oui-border-b oui-border-line-4",
        isMobile ? "oui-mt-2 oui-rounded-xl oui-bg-base-9" : undefined,
      )}
    >
      <DataTable
        bordered
        className="oui-font-semibold"
        classNames={{ root: "oui-bg-transparent" }}
        onRow={internalOnRow}
        onCell={internalOnCell}
        columns={columns}
        dataSource={dataSource}
      />
    </Box>
  );
};

export const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { columns, dataSource, tier, vol, headerDataAdapter, onRow, onCell } =
    props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  return (
    <Card
      title={
        <Flex itemAlign={"center"} justify={"between"}>
          <Text size={isMobile ? "xs" : "lg"}>{t("portfolio.feeTier")}</Text>
          <Flex itemAlign={"center"} justify={"center"} gap={1}>
            <Text size="xs" intensity={54}>
              {t("portfolio.feeTier.updatedDailyBy")}
            </Text>
            <Text size="xs" intensity={80}>
              2:00 UTC
            </Text>
          </Flex>
        </Flex>
      }
      id="oui-portfolio-fee-tier"
      className="w-full"
      classNames={{
        root: isMobile ? "oui-bg-transparent oui-p-2" : "oui-bg-base-9",
      }}
    >
      {!isMobile && <Divider />}
      <React.Suspense fallback={null}>
        <LazyFeeTierHeader
          vol={vol}
          tier={tier}
          headerDataAdapter={headerDataAdapter}
        />
      </React.Suspense>
      <FeeTierTable
        dataSource={dataSource}
        columns={columns}
        vol={vol}
        tier={tier}
        onRow={onRow}
        onCell={onCell}
      />
    </Card>
  );
};
