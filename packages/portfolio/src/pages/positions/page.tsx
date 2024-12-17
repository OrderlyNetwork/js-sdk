import {
  LiquidationWidget,
  PositionHistoryWidget,
  PositionsProps,
  PositionsWidget,
} from "@orderly.network/ui-positions";
import { Flex, Text, Divider, Box, Tabs, TabPanel } from "@orderly.network/ui";
import { useState } from "react";

enum TabsType {
  positions = "Positions",
  positionHistory = "Position history",
  liquidation = "Liquidation",
}

export const PositionsPage = (props: PositionsProps) => {
  const [tab, setTab] = useState(TabsType.positions);
  return (
    <Flex
      // p={6}
      direction={"column"}
      itemAlign={"start"}
      gap={4}
      width="100%"
      height="100%"
    >
      <Flex>
        <Text size="lg">Positions</Text>
      </Flex>
      <Divider className="oui-w-full" />
      {/* 26(title height) + 1(divider) + 32 (padding) */}
      <Box width="100%" className="oui-h-[calc(100%_-_59px)]">
        <PositionsWidget {...props} />
        {/* <Tabs value={tab} onValueChange={(e) => setTab(e as any)} classNames={{
          tabsList: "!oui-border-none oui-pb-1"
        }}>
          <TabPanel value={TabsType.positions} title={TabsType.positions}>
            <PositionsWidget {...props} />
          </TabPanel>
          <TabPanel value={TabsType.positionHistory} title={TabsType.positionHistory}>
            <PositionHistoryWidget {...props} />
          </TabPanel>
          <TabPanel value={TabsType.liquidation} title={TabsType.liquidation}>
            <LiquidationWidget />
          </TabPanel>
        </Tabs> */}
      </Box>
    </Flex>
  );
};
