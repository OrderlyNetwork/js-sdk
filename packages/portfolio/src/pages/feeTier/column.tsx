import { useMemo } from "react";
import { type TableColumn, Text } from "@orderly.network/ui";
import { numberToHumanStyle } from "@orderly.network/utils";

export const useFeeTierColumns = () => {
  const columns = useMemo(() => {
    return [
      {
        title: "Tier",
        dataIndex: "tier",
        align: "left",
        width: 100,
      },
      {
        title: "30 Day Volume (USDC)",
        dataIndex: "volume",
        align: "center",
        width: 170,
        render: (value, row) => {
          const { volume_min, volume_max } = row;
          if (!volume_min && !volume_max) {
            return <div style={{ fontVariantLigatures: "none" }}>--</div>;
          }

          if (volume_min && !volume_max) {
            return (
              <div>
                {"Above "}
                {numberToHumanStyle(volume_min, volume_min === 2500000 ? 1 : 0)}
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
        title: "Maker",
        dataIndex: "maker_fee",
        align: "right",
        width: 100,
        render: (value) => {
          return <Text>{value}</Text>;
        },
      },
      {
        title: "Taker",
        dataIndex: "taker_fee",
        align: "right",
        width: 100,
        render: (value) => {
          return <Text>{value}</Text>;
        },
      },
    ] as TableColumn[];
  }, []);

  return columns;
};
