/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import {
  Box,
  Flex,
  Text,
  Card,
  Divider,
  DataTable,
  Column,
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
  columns: Column[];
  dataSource?: any[];
  page?: number;
  pageSize?: number;
  dataCount?: number;
  tier?: number | null;
  onRow?: (
    record: any,
    index: number,
  ) => {
    normal: any;
    active: any;
  };
};

export const FeeTierTable: React.FC<FeeTierTableProps> = (props) => {
  const [top, setTop] = useState<undefined | number>(undefined);

  const { widgetConfigs } = useAppContext();

  useEffect(() => {
    const parentRect = document
      .getElementById("oui-fee-tier-content")
      ?.getBoundingClientRect();

    const elementRect = document
      .getElementById("oui-fee-tier-current")
      ?.getBoundingClientRect();

    if (elementRect && parentRect && !!props.tier) {
      const offsetTop = elementRect.top - parentRect.top;
      setTop(offsetTop);
    } else {
      setTop(undefined);
    }
  }, [props.tier]);

  const onRow = useCallback(
    (record: FeeDataType, index: number) => {
      const config = props?.onRow?.(record, index) ?? {
        normal: undefined,
        active: undefined,
      };
      if (index + 1 == props.tier) {
        const innerConfig = {
          id: "oui-fee-tier-current",
          "data-state": "active",
          className:
            "group oui-h-12 oui-text-[rgba(0,0,0,0.88)] oui-pointer-events-none",
        };
        return { ...innerConfig, ...config.active };
      }
      return {
        "data-state": "none",
        ...{ className: "oui-h-12" },
        ...config.normal,
      };
    },
    [props.tier, props.onRow],
  );

  const originalTable = (
    <Box
      id="oui-fee-tier-content"
      className="oui-relative oui-border-b oui-border-line-4"
    >
      {top && (
        <Box
          angle={90}
          gradient="brand"
          className="oui-absolute oui-w-full oui-rounded-md"
          style={{ top: `${top}px`, height: "48px" }}
        />
      )}
      <DataTable
        bordered
        className="oui-font-semibold"
        classNames={{ root: "oui-bg-transparent" }}
        onRow={onRow}
        columns={props.columns}
        dataSource={props.dataSource}
      />
    </Box>
  );

  const customTable = widgetConfigs?.feeTier?.table;

  return typeof customTable === "function"
    ? customTable(originalTable)
    : originalTable;
};

export const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { columns, dataSource, tier, vol } = props;
  const { widgetConfigs } = useAppContext();
  const { t } = useTranslation();
  const customHeader = widgetConfigs?.feeTier?.header;
  return (
    <Card
      title={
        <Flex justify={"between"}>
          <Text size="lg">{t("portfolio.feeTier")}</Text>
          <Flex gap={1}>
            <Text size="xs" intensity={54}>
              {t("portfolio.feeTier.updatedDailyBy")}
            </Text>
            <Text size="xs" intensity={80}>
              2:00 UTC
            </Text>
          </Flex>
        </Flex>
      }
      className="w-full"
      id="oui-portfolio-fee-tier"
    >
      <Divider />
      {typeof customHeader === "function" ? customHeader() : null}
      <React.Suspense fallback={null}>
        <LazyFeeTierHeader tier={tier} vol={vol} />
      </React.Suspense>
      <FeeTierTable
        dataSource={dataSource}
        columns={columns}
        tier={tier}
        onRow={props.onRow}
      />
    </Card>
  );
};
