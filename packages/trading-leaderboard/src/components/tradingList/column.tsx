import { Text, Column, Box } from "@orderly.network/ui";

export const useTradingListColumns = () => {
  return [
    {
      title: "Rank",
      dataIndex: "rank",
      width: 50,
      render: (value: number) => {
        return (
          <Box width={20} className="oui-text-center">
            {value}
          </Box>
        );
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (value: string) => {
        return <Text.formatted rule="address">{value}</Text.formatted>;
      },
      width: 100,
    },
    {
      title: "Trading volume",
      dataIndex: "perp_volume",
      onSort: true,
      render: (value: number) => {
        return (
          <Text.numeral prefix="$" rule="price" dp={2}>
            {value}
          </Text.numeral>
        );
      },
      width: 100,
    },
  ] as Column[];
};
