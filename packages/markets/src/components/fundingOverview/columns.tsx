import { useTranslation } from "@orderly.network/i18n";
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

export const useFundingOverviewColumns = (
  selectedPeriod: string,
  setSelectedPeriod: (value: string) => void,
): Column<ProcessedFundingData>[] => {
  const { t } = useTranslation();
  return [
    {
      title: t("markets.column.market"),
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
      title: t("markets.funding.column.estFunding"),
      dataIndex: "estFunding",
      width: 120,
      onSort: true,
      render: (value, record) => (
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
          <span className="oui-text-base-contrast-54">
            {`/ ${record.fundingInterval}h`}
          </span>
        </div>
      ),
    },
    {
      title: t("markets.funding.column.lastFunding"),
      dataIndex: "lastFunding",
      width: 90,
      onSort: true,
      render: createFundingRenderer(),
    },
    {
      title: t("markets.funding.column.1dAvg"),
      dataIndex: "funding1d",
      width: 90,
      onSort: true,
      render: createFundingRenderer(),
    },
    {
      title: t("markets.funding.column.3dAvg"),
      dataIndex: "funding3d",
      width: 90,
      onSort: true,
      render: createFundingRenderer(),
    },
    {
      title: t("markets.funding.column.7dAvg"),
      dataIndex: "funding7d",
      width: 90,
      onSort: true,
      render: createFundingRenderer(),
    },
    {
      title: t("markets.funding.column.14dAvg"),
      dataIndex: "funding14d",
      width: 90,
      onSort: true,
      render: createFundingRenderer(),
    },
    {
      title: t("markets.funding.column.30dAvg"),
      dataIndex: "funding30d",
      width: 90,
      onSort: true,
      render: createFundingRenderer(),
    },
    {
      title: t("markets.funding.column.90dAvg"),
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
              {
                label: t("common.select.1d"),
                value: "1dPositive",
              },
              {
                label: t("common.select.3d"),
                value: "3dPositive",
              },
              {
                label: t("common.select.7d"),
                value: "7dPositive",
              },
              {
                label: t("common.select.14d"),
                value: "14dPositive",
              },
              {
                label: t("common.select.30d"),
                value: "30dPositive",
              },
              {
                label: t("common.select.90d"),
                value: "90dPositive",
              },
            ].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>{t("markets.funding.column.positiveRate")}</span>
        </div>
      ),
      dataIndex: selectedPeriod,
      width: 130,
      align: "right",
      onSort: true,
      render: createFundingRenderer(2),
    },
  ];
};
