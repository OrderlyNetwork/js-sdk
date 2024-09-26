import { FC } from "react";
import { Box, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { TopTabState, TopTabType } from "./topTab.script";
import { MWebLastTrades } from "../lastTrades/lastTrades.widget";
import { TradeDataWidget } from "../tradeData";

export const TopTab: FC<TopTabState & {
  className?: string;
}> = (props) => {
  return (
    <Tabs
      variant="contained"
      value={props.tab}
      onValueChange={(e) => props.setTab(e as any)}
      className={props.className}
      classNames={{
        tabsList: "oui-p-2",
        tabsContent: "oui-min-h-[176px] oui-max-h-[234px]",
      }}
    >
      <TabPanel title="Chart" value={TopTabType.chart}>
        <Text>Chart</Text>
      </TabPanel>
      <TabPanel title="Trades" value={TopTabType.trades}>
        <MWebLastTrades symbol={props.symbol} />
      </TabPanel>
      <TabPanel title="Data" value={TopTabType.data}>
        <Box px={3}>
          <TradeDataWidget symbol={props.symbol} />
        </Box>
      </TabPanel>
    </Tabs>
  );
};
