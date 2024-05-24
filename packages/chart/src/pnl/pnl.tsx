import { FC } from "react";
import { Bar } from "../bar/bar";
import { Legend } from "../common/legend";

export type PnLChartProps = {
  colors: {
    profit: string;
    loss: string;
  };
};

export const PnLChart: FC<PnLChartProps> = (props) => {
  return (
    <>
      <Bar
        color={(d) => (d.close > 0 ? props.colors.profit : props.colors.loss)}
      />
      <Legend>
        <circle cx={3} cy={-5} r="3" fill={props.colors.profit} />
        <text fontSize={12} x={10} fill={props.colors.profit}>
          Profits
        </text>
        <circle cx={63} cy={-5} r="3" fill={props.colors.loss} />
        <text x={70} fontSize={12} fill={props.colors.loss}>
          Losses
        </text>
      </Legend>
    </>
  );
};
