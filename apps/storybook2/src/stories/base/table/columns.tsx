import { Column, Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export const Columns: Column[] = [
  {
    title: "Instrument",
    dataIndex: "symbol",
    width: 150,
    rule: "symbol",
    textProps: {
      showIcon: true,
    },
    // render: (value) => {
    //   return (
    //     <Text.formatted
    //       rule="symbol"
    //       formatString="base-type"
    //       size="xs"
    //       weight="semibold"
    //       showIcon
    //       className="oui-whitespace-nowrap"
    //     >
    //       {value}
    //     </Text.formatted>
    //   );
    // },
    // fixed: "left",
  },
  {
    title: "Price",
    dataIndex: "24h_close",
    width: 100,
    align: "right",
    onSort: true,
    render: (value, record) => {
      return (
        <Text.numeral dp={record.quote_dp || 2} currency="$">
          {value}
        </Text.numeral>
      );
    },
  },
  {
    title: "24h change",
    dataIndex: "change",
    width: 100,
    align: "right",
    onSort: true,
    // render: (value) => {
    //   return (
    //     <Text.numeral
    //       rule="percentages"
    //       coloring
    //       rm={Decimal.ROUND_DOWN}
    //       showIdentifier
    //     >
    //       {value}
    //     </Text.numeral>
    //   );
    // },
    rule: "percentages",
    numeralProps: {
      coloring: true,
      showIdentifier: true,
      // ignoreDP: true,
      rm: Decimal.ROUND_DOWN,
    },
  },
  {
    title: <Flex gapX={1}>24h volume</Flex>,
    dataIndex: "24h_amount",
    width: 100,
    align: "right",
    onSort: true,
    render: (value) => {
      return (
        <Text.numeral currency="$" dp={0} rm={Decimal.ROUND_DOWN}>
          {value}
        </Text.numeral>
      );
    },
  },
  {
    title: "Open interest",
    dataIndex: "openInterest",
    width: 100,
    align: "right",
    onSort: true,
    render: (value) => {
      return (
        <Text.numeral currency="$" dp={0} rm={Decimal.ROUND_DOWN}>
          {value}
        </Text.numeral>
      );
    },
  },
  {
    title: "8h funding",
    dataIndex: "8h_funding",
    width: 100,
    align: "right",
    onSort: true,
    render: (value) => {
      if (value === null) {
        return "--";
      }
      return (
        <Text.numeral
          rule="percentages"
          coloring
          dp={4}
          rm={Decimal.ROUND_DOWN}
          showIdentifier
        >
          {value}
        </Text.numeral>
      );
    },
    // fixed: "right",
  },
  {
    title: "Time",
    dataIndex: "created_time",
    width: 180,
    rule: "date",
    render: (value) => {
      return (
        <Text.formatted rule="date" className="oui-whitespace-nowrap">
          {value}
        </Text.formatted>
      );
    },
    fixed: "right",
  },
];
