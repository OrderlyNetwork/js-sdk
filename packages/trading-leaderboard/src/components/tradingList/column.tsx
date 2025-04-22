import { Text, Column, Box, useScreen } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

export const useTradingListColumns = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  return [
    {
      title: t("tradingLeaderboard.rank"),
      dataIndex: "rank",
      width: 40,
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
      width: 90,
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
      width: 105,
    },
    {
      title: t("tpsl.pnl"),
      dataIndex: "realized_pnl",
      onSort: true,
      align: isMobile ? "right" : "left",
      render: (value: string) => {
        if (!value) {
          return "-";
        }
        return (
          <Text.numeral prefix="$" rule="price" dp={2} coloring>
            {value}
          </Text.numeral>
        );
      },
      width: 90,
    },
  ] as Column[];
};
