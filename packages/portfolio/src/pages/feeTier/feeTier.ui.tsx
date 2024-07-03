import { Box, Card, Divider } from "@orderly.network/ui";
import { Flex, Text } from "@orderly.network/ui";
import { ReactNode } from "react";
import { dataSource } from "./dataSource";
import { FC } from "react";
import { DataGrid, DataTable } from "@orderly.network/ui";
import { useFeeTierColumns } from "./column";

export const FeeTier = () => {
  return (
    <Card title="Fee tier" className="w-full" id="oui-portfolio-fee-tier">
      <Divider />
      <FeeTierHeader />
      <FeeTierTable dataSource={dataSource} />
    </Card>
  );
};

export const FeeTierHeader: React.FC<FeeTierHeaderItemProps> = (props) => {
  return (
    <Flex direction="row" gapX={4} my={4}>
      <FeeTierHeaderItem
        label="Your Tier"
        value={
          <Text.gradient color={"brand"} angle={270} size="base">
            2
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
};

export const FeeTierTable: FC<FeeTierTableProps> = (props) => {
  const { dataSource } = props;
  const columns = useFeeTierColumns();

  return (
    <DataGrid
      bordered
      className="oui-font-semibold"
      classNames={{
        header: "oui-text-base-contrast-36",
        body: "oui-text-base-contrast-80",
      }}
      onRow={(record, index) => {
        if (index == 1) {
          return {
            className:
              "oui-bg-[linear-gradient(270deg,#59B0FE_0%,#26FEFE_100%)] oui-rounded-md oui-text-[rgba(0,0,0,0.88)]",
          };
        }
        if (index === dataSource!.length - 1) {
          return { className: "!oui-border-b" };
        }
        return { className: "oui-h-12" };
      }}
      columns={columns}
      dataSource={dataSource}
    />
  );
};

/* Table / Row  */

// /* Auto layout */
// display: flex;
// flex-direction: column;
// justify-content: center;
// align-items: flex-start;
// padding: 0px 12px;

// width: 1652px;
// height: 48px;

// /* Gradients/🏈 WOOFi */
// background: linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%);
// border-radius: 4px;

// /* Inside auto layout */
// flex: none;
// order: 2;
// align-self: stretch;
// flex-grow: 0;
