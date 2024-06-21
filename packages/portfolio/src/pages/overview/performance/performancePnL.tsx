import { Chart, PnLChart } from "@orderly.network/chart";

export const PerformancePnL = () => {
  return (
    <Chart>
      <PnLChart
        colors={{
          profit: "green",
          loss: "red",
        }}
      />
    </Chart>
  );
};
