import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Divider,
  TableView,
  TableColumn,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useFeeTierScriptReturn } from "./feeTier.script";

export type FeeTierProps = useFeeTierScriptReturn;

export const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { columns, dataSource, tier, vol, takerFeeRate, makerFeeRate } = props;
  return (
    <Card
      // @ts-ignore
      title={
        <Flex justify={"between"}>
          <Text size="lg">Fee tier</Text>
          <Flex gap={1}>
            <Text size="xs" intensity={54}>
              Updated daily by
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
      <FeeTierHeader
        tier={tier!}
        vol={vol!}
        takerFeeRate={takerFeeRate!}
        makerFeeRate={makerFeeRate!}
      />
      <FeeTierTable
        dataSource={dataSource}
        columns={columns}
        tier={tier}
        onRow={props.onRow}
      />
    </Card>
  );
};

export type FeeTierHeaderProps = {
  tier?: number;
  vol?: number;
  takerFeeRate?: string;
  makerFeeRate?: string;
};

export const FeeTierHeader: React.FC<FeeTierHeaderProps> = (props) => {
  return (
    <Flex direction="row" gapX={4} my={4} itemAlign={"stretch"}>
      <FeeTierHeaderItem
        label="Your tier"
        value={
          <Text.gradient color={"brand"} angle={270} size="base">
            {props.tier || "--"}
          </Text.gradient>
        }
      />
      <FeeTierHeaderItem
        label="30D trading volume (USDC)"
        value={
          <Text.numeral rule="price" dp={2} rm={Decimal.ROUND_DOWN}>
            {typeof props.vol !== undefined ? `${props.vol}` : "-"}
          </Text.numeral>
        }
      />
      <FeeTierHeaderItem
        label="Taker fee rate"
        value={
          <Text.gradient color={"brand"} angle={270} size="base">
            {props.takerFeeRate || "--"}
          </Text.gradient>
        }
      />
      <FeeTierHeaderItem
        label="Marker fee rate"
        value={
          <Text.gradient color={"brand"} angle={270} size="base">
            {props.makerFeeRate || "--"}
          </Text.gradient>
        }
      />
    </Flex>
  );
};

export type FeeTierHeaderItemProps = {
  label: string;
  value: ReactNode;
};

export const FeeTierHeaderItem: React.FC<FeeTierHeaderItemProps> = (props) => {
  return (
    <Box
      gradient="neutral"
      r="lg"
      px={4}
      py={2}
      angle={184}
      width="100%"
      border
      borderColor={6}
    >
      <Text
        as="div"
        intensity={36}
        size="2xs"
        weight="semibold"
        className="oui-leading-[18px]"
      >
        {props.label}
      </Text>

      <Text
        size="base"
        intensity={80}
        className="oui-leading-[24px] oui-mt-[2px]"
      >
        {props.value}
      </Text>
    </Box>
  );
};

type FeeTierTableProps = {
  columns: TableColumn[];
  dataSource?: any[];
  page?: number;
  pageSize?: number;
  dataCount?: number;
  tier?: number | null;
  onRow?: (
    record: any,
    index: number
  ) => {
    normal: any,
    active: any,
  };
};

export const FeeTierTable: FC<FeeTierTableProps> = (props) => {
  const [top, setTop] = useState<undefined | number>(undefined);
  useEffect(() => {
    const parentRect = document
      .getElementById("oui-fee-tier-content")
      ?.getBoundingClientRect();
    const elementRect = document
      .getElementById("oui-fee-tier-current")
      ?.getBoundingClientRect();

    if (elementRect && parentRect) {
      const offsetTop = elementRect.top - parentRect.top;
      setTop(offsetTop);
    }
  }, [props.tier]);
  const onRow = useCallback(
    (record: any, index: number) => {
      const config = props?.onRow?.(record, index) ?? {
        normal: undefined,
        active: undefined,
      };
      if (index + 1 == props.tier) {
        const innerConfig = {
          id: "oui-fee-tier-current",
          'data-state': "active",
          className:
            "group oui-h-12 oui-text-[rgba(0,0,0,0.88)] oui-pointer-events-none",
        };
        return {
          ...innerConfig,
          ...config.active,
        };
      }

      return {
        'data-state': "none",
        ...{ className: "oui-h-12" },
        ...config.normal,
      };
    },
    [props.tier, props.onRow]
  );

  return (
    <Box
      id="oui-fee-tier-content"
      className="oui-border-b oui-border-line-4 oui-relative"
    >
      {top && (
        <Box
          angle={90}
          gradient="brand"
          className="oui-rounded-[6px] oui-absolute oui-w-full"
          style={{
            top: `${top}px`,
            height: "48px",
          }}
        />
      )}
      <TableView
        bordered
        className="oui-font-semibold"
        classNames={{
          root: "oui-bg-transparent",
        }}
        onRow={onRow}
        columns={props.columns}
        dataSource={props.dataSource}
      />
    </Box>
  );
};
