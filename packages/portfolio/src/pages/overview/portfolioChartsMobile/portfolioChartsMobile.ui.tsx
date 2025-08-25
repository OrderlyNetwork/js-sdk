import React from "react";
import { AssetLineChart } from "@orderly.network/chart";
import { cn, Flex } from "@orderly.network/ui";
import type { useAssetsChartScriptReturn } from "../assetChart/assetsChart.script";

export const PortfolioChartsMobileUI: React.FC<useAssetsChartScriptReturn> = (
  props,
) => {
  return (
    <Flex
      p={4}
      width={"100%"}
      className={cn(
        "oui-relative oui-items-start oui-overflow-hidden oui-rounded-2xl oui-bg-base-9",
      )}
    >
      <Flex itemAlign={"start"} direction={"column"}>
        <div>Unreal. Pnl</div>
        <div>1234.00(45.7%)</div>
        <div>Performance</div>
      </Flex>
      <Flex direction={"column"}>
        <AssetLineChart data={props.data as any} invisible={props.invisible} />
      </Flex>
    </Flex>
  );
};
