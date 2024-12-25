import { FC } from "react";
import { cn, Column } from "@orderly.network/ui";
import { Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { DataTable } from "@orderly.network/ui";
import { exchanges } from "./fundingComparison.script";

export const columns: Column[] = [
  {
    title: "Market",
    dataIndex: "symbol",
    width: 150,
    onSort: true,
    render: (value) => (
      <Text.formatted
        rule="symbol"
        formatString="base-type"
        size="xs"
        weight="semibold"
        showIcon
      >
        {value}
      </Text.formatted>
    ),
  },
  ...exchanges.map((exchange, index) => ({
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <img
          src={`https://oss.orderly.network/static/exchange_logo/${exchange
            .toLowerCase()
            .replace(" ", "_")}.png`}
          style={{
            width: "24px",
            height: "24px",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
        <span>{exchange}</span>
      </div>
    ),
    dataIndex: `exchange_${index}`,
    width: 100,
    onSort: true,
    render: (value: number | null) =>
      value === null ? (
        "-"
      ) : (
        <Text.numeral
          rule="percentages"
          dp={5}
          coloring
          rm={Decimal.ROUND_DOWN}
          showIdentifier
        >
          {value}
        </Text.numeral>
      ),
  })),
];

interface FundingComparisonProps {
  data: Array<{
    symbol: string;
    funding: (number | null)[];
  }>;
  isLoading: boolean;
  pagination: any;
}

export const FundingComparison: FC<FundingComparisonProps> = ({
  data,
  isLoading,
  pagination,
}) => {
  return (
    <DataTable
      columns={columns}
      dataSource={data}
      loading={isLoading}
      onRow={() => {
        return {
          className: cn("oui-h-[48px] oui-cursor-pointer"),
        };
      }}
      classNames={{
        header: "oui-h-12",
      }}
      bordered
      pagination={pagination}
    />
  );
};
