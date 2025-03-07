import { Column } from "@orderly.network/ui";
import { Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { exchanges } from "./fundingComparison.script";
import { useTranslation } from "@orderly.network/i18n";

export const useFundingColumns = (): Column[] => {
  const { t } = useTranslation();
  return [
    {
      title: t("markets.funding.column.market"),
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
};
