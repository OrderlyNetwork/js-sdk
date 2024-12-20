// fundingOverview.ui.tsx
import { FC, useState } from "react";
import { DataTable, Text, Flex } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import {
  ProcessedFundingData,
  UseFundingOverviewReturn,
} from "./fundingOverview.script";
import { Decimal } from "@orderly.network/utils";

export type FundingOverviewProps = UseFundingOverviewReturn;

export const FundingOverview: FC<FundingOverviewProps> = (props) => {
  const { dataSource, isLoading, pagination, onSort } = props;

  const [selectedPeriod, setSelectedPeriod] = useState("1dPositive");
  const columns: Column<ProcessedFundingData>[] = [
    {
      title: "Market",
      dataIndex: "symbol",
      width: 120,
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
    {
      title: "Est. funding",
      dataIndex: "estFunding",
      width: 120,
      onSort: true,
      render: (value) => (
        <div>
          <Text.numeral
            rule="percentages"
            dp={5}
            coloring
            rm={Decimal.ROUND_DOWN}
            showIdentifier
          >
            {value}
          </Text.numeral>
          <span className="oui-text-base-contrast-54"> / 4h </span>
        </div>
      ),
    },
    {
      title: "Last funding",
      dataIndex: "lastFunding",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: "1d avg.",
      dataIndex: "funding1d",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: "3d avg.",
      dataIndex: "funding3d",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: "7d avg.",
      dataIndex: "funding7d",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: "14d avg.",
      dataIndex: "funding14d",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: "30d avg.",
      dataIndex: "funding30d",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: "90d avg.",
      dataIndex: "funding90d",
      width: 90,
      onSort: true,
      render: (value) => (
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
    },
    {
      title: (
        <div className="oui-flex oui-gap-1">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="oui-w-12 oui-rounded-md oui-border oui-border-line oui-bg-[var(--oui-table-background-color)]"
          >
            {[
              { label: "1d", value: "1dPositive" },
              { label: "3d", value: "3dPositive" },
              { label: "7d", value: "7dPositive" },
              { label: "14d", value: "14dPositive" },
              { label: "30d", value: "30dPositive" },
              { label: "90d", value: "90dPositive" },
            ].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>Positive rate</span>
        </div>
      ),
      dataIndex: "positiveRate",
      width: 130,
      align: "right",
      onSort: true,
      render: (value, record) => (
        <Text.numeral rule="percentages" dp={2} coloring showIdentifier>
          {record[selectedPeriod as keyof ProcessedFundingData] || "-"}
        </Text.numeral>
      ),
    },
  ];

  const emptyView = (
    <Flex justify="center">
      <Text size="xs" intensity={36}>
        No funding data available
      </Text>
    </Flex>
  );

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        bordered
        emptyView={emptyView}
        pagination={pagination}
        onSort={onSort}
        manualSorting
        generatedRowKey={(record) => record.symbol}
      />
    </div>
  );
};
