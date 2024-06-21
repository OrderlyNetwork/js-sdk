import { FC, useMemo } from "react";
import { Bar } from "../bar/bar";
import { Legend } from "../common/legend";
import { getThemeColors } from "../utils/theme";
import { useColors } from "./useColors";

export type PnLChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
};

export const PnLBarChart: FC<PnLChartProps> = (props) => {
  const colors = useColors(props.colors);

  return (
    <>
      <Bar color={(d) => (d.pnl > 0 ? colors.profit : colors.loss)} />
      <Legend>
        <circle cx={3} cy={-5} r="3" fill={colors.profit} />
        <text fontSize={12} x={10} fill={colors.profit}>
          Profits
        </text>
        <circle cx={63} cy={-5} r="3" fill={colors.loss} />
        <text x={70} fontSize={12} fill={colors.loss}>
          Losses
        </text>
      </Legend>
    </>
  );
};
