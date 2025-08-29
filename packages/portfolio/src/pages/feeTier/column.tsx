import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { type Column, Text } from "@orderly.network/ui";
import { numberToHumanStyle } from "@orderly.network/utils";

export const useFeeTierColumns = () => {
  const { t } = useTranslation();
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: t("portfolio.feeTier.column.tier"),
        dataIndex: "tier",
        align: "left",
        width: 100,
      },
      {
        title: `${t("portfolio.feeTier.column.30dVolume")} (USDC)`,
        dataIndex: "volume",
        align: "center",
        width: 170,
        render: (value, row) => {
          const { volume_min, volume_max, volume_node } = row;

          if (volume_node) return volume_node;
          if (!volume_min && !volume_max) {
            return <div style={{ fontVariantLigatures: "none" }}>--</div>;
          }

          if (volume_min && !volume_max) {
            return (
              <div>
                {t("portfolio.feeTier.column.30dVolume.above", {
                  volume: numberToHumanStyle(
                    volume_min,
                    volume_min === 2500000 ? 1 : 0,
                  ),
                })}
              </div>
            );
          }
          return (
            <div>
              {volume_min &&
                numberToHumanStyle(volume_min, volume_min === 2500000 ? 1 : 0)}
              {` - `}
              {volume_max &&
                numberToHumanStyle(volume_max, volume_max === 2500000 ? 1 : 0)}
            </div>
          );
        },
      },
      {
        title: t("portfolio.feeTier.column.maker"),
        dataIndex: "maker_fee",
        align: "right",
        width: 100,
        render: (value) => {
          return <Text>{value}</Text>;
        },
      },
      {
        title: t("portfolio.feeTier.column.taker"),
        dataIndex: "taker_fee",
        align: "right",
        width: 100,
        render: (value) => {
          return <Text>{value}</Text>;
        },
      },
    ];
  }, [t]);

  return columns;
};
