import { Text, Column, Box } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

export const useTradingListColumns = () => {
  const { t } = useTranslation();
  return [
    {
      title: t("tradingLeaderboard.rank"),
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
      title: t("common.address"),
      dataIndex: "address",
      render: (value: string) => {
        return <Text.formatted rule="address">{value}</Text.formatted>;
      },
      width: 100,
    },
    {
      title: t("tradingLeaderboard.tradingVolume"),
      dataIndex: "perp_volume",
      onSort: true,
      render: (value: string) => {
        if (!value) {
          return "-";
        }
        return (
          <Text.numeral prefix="$" rule="price" dp={2}>
            {value}
          </Text.numeral>
        );
      },
      width: 120,
    },
  ] as Column[];
};
