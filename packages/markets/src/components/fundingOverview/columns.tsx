import { Column, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ProcessedFundingData } from "./fundingOverview.script";

const createFundingRenderer =
  (dp: number = 5) =>
  (value: number) => {
    if (value === 0) {
      return <Text> - </Text>;
    }

    return (
      <Text.numeral
        rule="percentages"
        dp={dp}
        coloring
        rm={Decimal.ROUND_DOWN}
        showIdentifier
      >
        {value}
      </Text.numeral>
    );
  };

export const getFundingOverviewColumns = (
  selectedPeriod: string,
  setSelectedPeriod: (value: string) => void
): Column<ProcessedFundingData>[] => [
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
    render: createFundingRenderer(),
  },
  {
    title: "1d avg.",
    dataIndex: "funding1d",
    width: 90,
    onSort: true,
    render: createFundingRenderer(),
  },
  {
    title: "3d avg.",
    dataIndex: "funding3d",
    width: 90,
    onSort: true,
    render: createFundingRenderer(),
  },
  {
    title: "7d avg.",
    dataIndex: "funding7d",
    width: 90,
    onSort: true,
    render: createFundingRenderer(),
  },
  {
    title: "14d avg.",
    dataIndex: "funding14d",
    width: 90,
    onSort: true,
    render: createFundingRenderer(),
  },
  {
    title: "30d avg.",
    dataIndex: "funding30d",
    width: 90,
    onSort: true,
    render: createFundingRenderer(),
  },
  {
    title: "90d avg.",
    dataIndex: "funding90d",
    width: 90,
    onSort: true,
    render: createFundingRenderer(),
  },
  {
    title: (
      <div className="oui-flex oui-gap-1">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          onClick={(e) => e.stopPropagation()}
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
    dataIndex: selectedPeriod,
    width: 130,
    align: "right",
    onSort: true,
    render: createFundingRenderer(2),
  },
];
