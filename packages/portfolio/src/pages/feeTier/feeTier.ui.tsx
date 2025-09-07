/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  vol?: number | null;
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

  const parentRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const parentRect = parentRef.current?.getBoundingClientRect();
    const elementRect = activeRowRef.current?.getBoundingClientRect();
    if (elementRect && parentRect && props.tier) {
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
        return {
          ref: activeRowRef,
          "data-state": "active",
          className:
            "group oui-h-12 oui-text-[rgba(0,0,0,0.88)] oui-pointer-events-none",
          ...config.active,
        };
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
      ref={parentRef}
      className="oui-relative oui-border-b oui-border-line-4"
    >
      {top !== undefined && top !== null && (
        <Box
          angle={90}
          gradient="brand"
          className="oui-absolute oui-w-full oui-rounded-md"
          style={{ transform: `translate3d(0, ${top}px, 0)`, height: 48 }}
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
        <LazyFeeTierHeader
          vol={vol}
          tier={tier}
          headerDataAdapter={props.headerDataAdapter}
        />
      </React.Suspense>
      <FeeTierTable
        dataSource={dataSource}
        columns={columns}
        vol={vol}
        tier={tier}
        onRow={props.onRow}
      />
    </Card>
  );
};
