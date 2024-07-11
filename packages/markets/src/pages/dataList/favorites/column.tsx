import { useMemo } from "react";
import { type Column, Flex, TokenIcon, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export const useFavoritesColumns = () => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Market",
        dataIndex: "symbol",
        width: 80,
        render: (value) => {
          return (
            <Flex gapX={1}>
              <TokenIcon symbol={value} size="xs" />
              <Text.formatted
                rule="symbol"
                formatString="base-type"
                size="xs"
                weight="semibold"
              >
                {value}
              </Text.formatted>
            </Flex>
          );
        },
      },
      {
        title: "Price",
        dataIndex: "24h_close",
        width: 100,
        align: "right",
        // onSort: true,
        render: (value, record) => {
          return <Text.numeral dp={record.quote_dp || 2}>{value}</Text.numeral>;
        },
      },
      {
        title: "24h change",
        dataIndex: "change",
        width: 100,
        align: "right",
        render: (value) => {
          return (
            <Text.numeral
              rule="percentages"
              coloring
              cureency={value > 0 ? "+" : "-"}
              rm={Decimal.ROUND_DOWN}
            >
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "24h volume",
        dataIndex: "24h_amount",
        width: 100,
        align: "right",
        render: (value) => {
          return (
            <Text.numeral dp={0} rm={Decimal.ROUND_DOWN}>
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "Open interest",
        dataIndex: "",
        width: 100,
        align: "right",
        render: (value, record) => {
          const { open_interest = 0, index_price = 0 } = record;
          const num = new Decimal(open_interest).mul(index_price).toNumber();

          return (
            <Text.numeral dp={0} rm={Decimal.ROUND_DOWN}>
              {num}
            </Text.numeral>
          );
        },
      },
      {
        title: "8h funding",
        dataIndex: "8h_funding",
        width: 100,
        align: "right",
        render: (value, record) => {
          return (
            <Text.numeral
              rule="percentages"
              coloring
              cureency={value > 0 ? "+" : "-"}
              dp={4}
              rm={Decimal.ROUND_DOWN}
            >
              {value}
            </Text.numeral>
          );
        },
      },
    ];
  }, []);

  return columns;
};
