import { Button, Column, Flex, Text } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";

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
    fixed: "left",
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
    title: "Mark Price",
    dataIndex: "mark_price",
    width: 100,
    align: "right",
    render: (value, record) => {
      return (
        <Text.numeral dp={record.quote_dp || 2} currency="$">
          {value}
        </Text.numeral>
      );
    },
  },
  {
    title: "Index Price",
    dataIndex: "index_price",
    width: 100,
    align: "right",
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
    width: 150,
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
    title: "Time",
    dataIndex: "created_time",
    width: 180,
    rule: "date",
    // render: (value) => {
    //   return (
    //     <Text.formatted rule="date" className="oui-whitespace-nowrap">
    //       {value}
    //     </Text.formatted>
    //   );
    // },
  },
  {
    title: "Action",
    dataIndex: "action",
    width: 100,
    align: "right",
    render: (value, record, index, context) => {
      return (
        <Button
          variant="outlined"
          color="gray"
          size="sm"
          onClick={context.row.getToggleExpandedHandler()}
        >
          Action
        </Button>
      );
    },
    fixed: "right",
  },
];
