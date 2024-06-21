import { useMemo } from "react";
import { getThemeColors } from "../utils/theme";
import { useColors } from "./useColors";
import { Line } from "../line/line";

export type PnlLineChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
};

const PnlLineChart = (props: PnlLineChartProps) => {
  const colors = useColors(props.colors);

  const dataTransfer = (data: any[]) => {
    const series: any[] = [];

    data.reduce((acc, item) => {
      acc += item.pnl;
      series.push({ ...item, pnl: acc, _pnl: item.pnl });
      return acc;
    }, 0);

    return series;
  };

  return (
    <Line color={colors.primary} dataTransform={dataTransfer} dataKey="pnl" />
  );
};

export { PnlLineChart };
