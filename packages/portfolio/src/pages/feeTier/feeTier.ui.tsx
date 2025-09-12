/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";
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

  const { isMobile } = useScreen();

  const parentRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      const isActive = props.tier !== null && props.tier === index + 1;
      if (isActive) {
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
        className: "oui-h-12",
        ...config.normal,
      };
    },
    [props.tier, props.onRow],
  );

  const originalTable = (
    <Box
      ref={parentRef}
      className={cn(
        "oui-relative oui-border-b oui-border-line-4",
        isMobile ? "oui-mt-2 oui-rounded-xl oui-bg-base-9" : undefined,
      )}
    >
      {top !== undefined && top !== null && (
        <Box
          angle={90}
          gradient="brand"
          className={cn("oui-absolute oui-w-full oui-rounded")}
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

  return originalTable;
};

export const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { columns, dataSource, tier, vol } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();
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
      id="oui-portfolio-fee-tier"
      className="w-full"
      classNames={{
        root: isMobile ? "oui-bg-transparent oui-p-2" : "oui-bg-base-9",
      }}
    >
      <Divider />
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
