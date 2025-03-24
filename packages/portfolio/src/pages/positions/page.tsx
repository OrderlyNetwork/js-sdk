import { useState } from "react";
import {
  LiquidationWidget,
  PositionHistoryWidget,
  PositionsProps,
  PositionsWidget,
} from "@orderly.network/ui-positions";
import { Flex, Text, Divider, Box, Tabs, TabPanel } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

enum TabsType {
  positions = "Positions",
  positionHistory = "Position history",
  liquidation = "Liquidation",
}

export const PositionsPage = (props: PositionsProps) => {
  const [tab, setTab] = useState(TabsType.positions);
  const { t } = useTranslation();

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
        <Text size="lg">{t("positions.title")}</Text>
      </Flex>
      <Divider className="oui-w-full" />
      {/* 26(title height) + 1(divider) + 32 (padding) */}
      <Box width="100%" className="oui-h-[calc(100%_-_59px)]">
        <Tabs
          value={tab}
          onValueChange={(e) => setTab(e as any)}
          classNames={{
            tabsList: "!oui-border-none oui-pb-1",
            tabsContent: "oui-h-[calc(100%_-_28px)]",
          }}
          className="oui-h-full"
        >
          <TabPanel value={TabsType.positions} title={t("positions.title")}>
            <PositionsWidget {...props} />
          </TabPanel>
          <TabPanel
            value={TabsType.positionHistory}
            title={t("positions.positionHistory")}
          >
            <PositionHistoryWidget {...props} />
          </TabPanel>
          <TabPanel
            value={TabsType.liquidation}
            title={t("positions.liquidation")}
          >
            <LiquidationWidget />
          </TabPanel>
        </Tabs>
      </Box>
    </Flex>
  );
};
