import { Box, Card, Divider } from "@orderly.network/ui";
import { Flex, Text } from "@orderly.network/ui";
import { ReactNode, useCallback } from "react";
import { dataSource } from "./dataSource";
import { FC } from "react";
import { DataTable } from "@orderly.network/ui";
import { useFeeTierColumns } from "./column";
import { useFeeTierScriptReturn } from "./feeTier.script";

export type FeeTierProps = useFeeTierScriptReturn;

export const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { tier } = props;
  return (
    <Card title="Fee tier" className="w-full" id="oui-portfolio-fee-tier">
      <Divider />
      <FeeTierHeader tier={tier} />
      <FeeTierTable dataSource={dataSource} tier={tier} />
    </Card>
  );
};

export type FeeTierHeaderProps = {
  tier?: number;
};

export const FeeTierHeader: React.FC<FeeTierHeaderProps> = (props) => {
  return (
    <Flex direction="row" gapX={4} my={4}>
      <FeeTierHeaderItem
        label="Your Tier"
        value={
          <Text.gradient color={"brand"} angle={270} size="base">
            {props.tier || "--"}
          </Text.gradient>
        }
      />
      <FeeTierHeaderItem
        label="30D Trading Volume (USDC)"
        value="2,643,857.84"
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
    <Box gradient="neutral" r="lg" px={4} py={2} angle={184} width="100%">
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
  dataSource?: any[];
  page?: number;
  pageSize?: number;
  dataCount?: number;
  tier?: number;
};

export const FeeTierTable: FC<FeeTierTableProps> = (props) => {
  const columns = useFeeTierColumns();

  const onRow = useCallback(
    (record: any, index: number) => {
      if (index + 1 == props.tier) {
        return {
          className:
            "oui-bg-[linear-gradient(270deg,#59B0FE_0%,#26FEFE_100%)] oui-rounded-[6px] oui-text-[rgba(0,0,0,0.88)]",
        };
      }

      return { className: "oui-h-12" };
    },
    [props.tier]
  );

  return (
    <div className="oui-border-b oui-border-line-4">
      <DataTable
        bordered
        className="oui-font-semibold"
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
        onRow={onRow}
        columns={columns}
        dataSource={props.dataSource}
      />
    </div>
  );
};
