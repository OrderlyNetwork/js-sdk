import { useMemo } from "react";
import { Text, type Column } from "@orderly.network/ui";
import { numberToHumanStyle } from "@orderly.network/utils";

export const useFeeTierColumns = () => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Tier",
        dataIndex: "tier",
        align: "left",
        width: 200,
      },
      {
        title: "30 Day Volume (USDC)",
        dataIndex: "volume",
        align: "center",
        width: 150,
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
        title: "or",
        dataIndex: "or",
        width: 120,
        align: "center",
      },
      {
        title: "Staking (WOO + XP)",
        dataIndex: "staking",
        align: "center",
        width: 150,
        render: (value, row) => {
          const { staking_min, staking_max } = row;
          if (!staking_min && !staking_max) {
            return <div style={{ fontVariantLigatures: "none" }}>--</div>;
          }

          if (staking_min && !staking_max) {
            return (
              <div>
                {"Above "}
                {numberToHumanStyle(staking_min, 0)}
              </div>
            );
          }

          return (
            <div>
              {staking_min && numberToHumanStyle(staking_min, 0)}
              {` - `}
              {staking_max && numberToHumanStyle(staking_max, 0)}
            </div>
          );
        },
      },
      {
        title: "Maker",
        dataIndex: "maker_fee",
        align: "right",
        width: 272,
        render: (value) => {
          return <Text>{value}</Text>;
        },
      },
      {
        title: "Taker",
        dataIndex: "taker_fee",
        align: "right",
        width: 272,
        render: (value) => {
          return <Text>{value}</Text>;
        },
      },
    ];
  }, []);

  return columns;
};
