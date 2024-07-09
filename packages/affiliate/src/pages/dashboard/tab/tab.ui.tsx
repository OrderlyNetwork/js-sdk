import { FC } from "react";
import {
  Box,
  Flex,
  Tabs,
  TabsBase,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@orderly.network/ui";
import { TabReturns, TabTypes } from "./tab.script";
import { AffiliateIcon } from "../../../components/affiliateIcon";
import { TraderIcon } from "../../../components/traderIcon";
import { AffiliatePage } from "../../affiliate";
import { TraderPage } from "../../trader";

export const TabUI: FC<TabReturns> = (props) => {
  return (
    <TabsBase
        value={props.tab}
        onValueChange={(e) => {
          props.setTab(e as TabTypes);
        }}
        className="oui-w-full oui-mt-6"
      >
        <TabsList className="oui-mx-3 oui-flex oui-flex-row oui-justify-center oui-h-[44px] oui-text-base md:oui-text-lg oui-rounded-xl oui-bg-base-9">
          <TabsTrigger value={TabTypes.affiliate} className=" ">
            <Flex direction={"row"} gap={1}>
              <AffiliateIcon
                fillOpacity={1}
                fill="currentColor"
                className={
                  props.tab === TabTypes.affiliate
                    ? "oui-fill-white/[.98]"
                    : "oui-fill-white/[.36]"
                }
              />
              <Text>Affiliate</Text>
            </Flex>
          </TabsTrigger>
          <TabsTrigger value={TabTypes.trader}>
            <Flex direction={"row"} gap={1}>
              <TraderIcon
                fillOpacity={1}
                fill="currentColor"
                className={
                  props.tab === TabTypes.trader
                    ? "oui-fill-white/[.98]"
                    : "oui-fill-white/[.36]"
                }
              />
              <Text>Trader</Text>
            </Flex>
          </TabsTrigger>
        </TabsList>
          <TabsContent value={TabTypes.affiliate} className="oui-w-full">
              <AffiliatePage />
            
          </TabsContent>
          <TabsContent value={TabTypes.trader}>
            <TraderPage />
          </TabsContent>
      </TabsBase>
  );
};

/*
<Tabs
        value={props.tab}
        onValueChange={(e) => props.setTab(e as TabTypes)}
        className="oui-bg-base-9"
      >
        <TabPanel
          value={TabTypes.affiliate}
          title="Affiliate"
          icon={
            <AffiliateIcon
              fillOpacity={1}
              className={
                props.tab === TabTypes.affiliate
                  ? "oui-fill-white"
                  : "oui-fill-white/[.36]"
              }
            />
          }
        >
          <AffiliatePage />
        </TabPanel>
        <TabPanel value={TabTypes.trader} title="Trade" icon={<TraderIcon />}>
          <TraderPage />
        </TabPanel>
      </Tabs>
*/
