import { useTranslation } from "@orderly.network/i18n";
import { Flex } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import { Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { exchanges } from "./fundingComparison.script";

const CDN_PREFIX = "https://oss.orderly.network/static/exchange_logo";

export const useFundingColumns = (): Column[] => {
  const { t } = useTranslation();
  return [
    {
      title: t("markets.column.market"),
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
    ...exchanges.map<Column>((item) => ({
      title: (
        <Flex justify="start" itemAlign="center" gap={1}>
          {!item.startsWith("WOOFi Pro -") && (
            <img
              src={`${CDN_PREFIX}/${item.toLowerCase().replace(" ", "_")}.png`}
              className="oui-size-6 oui-rounded-full oui-object-cover"
            />
          )}
          {item}
        </Flex>
      ),
      dataIndex: item,
      onSort: true,
      width: item.startsWith("WOOFi Pro -") ? 180 : 130,
      render(value: number | null) {
        if (value === null) {
          return "-";
        }
        return (
          <Text.numeral
            rule="percentages"
            dp={5}
            coloring
            rm={Decimal.ROUND_DOWN}
            showIdentifier
          >
            {value}
          </Text.numeral>
        );
      },
    })),
  ];
};
