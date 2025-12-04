import { useMemo } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Text, Column, Box, useScreen } from "@veltodefi/ui";
import { getRowKey } from "./tradingList.script";

export const useTradingListColumns = (address?: string) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  return useMemo(() => {
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
        render: (value: string, record: any) => {
          const isYou = record.key === getRowKey(address!);
          if (isMobile && isYou) {
            return <Text>You</Text>;
          }

          return (
            <>
              <Text.formatted rule="address">{value}</Text.formatted>
              {isYou && <Text> (You)</Text>}
            </>
          );
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
        title: t("common.pnl"),
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
  }, [t, isMobile, address]);
};
