import { FC } from "react";
import {
  Box,
  Button,
  cn,
  Flex,
  Spinner,
  TabsBase,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@orderly.network/ui";
import { TabReturns } from "./tab.script";
import { AffiliateIcon } from "../../../components/affiliateIcon";
import { TraderIcon } from "../../../components/traderIcon";
import { AffiliatePage } from "../../affiliate";
import { TraderPage } from "../../trader";
import { HomePage } from "../../home";
import { TabTypes } from "../../../hooks";

export const Tab: FC<TabReturns> = (props) => {
  const extendNode = () => {
    if (props.isAffiliate && !props.isTrader) {
      return (
        <Button
          variant="contained"
          color="success"
          size="sm"
          className="oui-px-2 oui-flex oui-gap-1"
          style={{
            position: "absolute",
            top: "50%",
            right: "24px",
            transform: "translateY(-50%)",
          }}
          onClick={(e) => {
            props.anATrader();
          }}
        >
          <TraderIcon />
          <Text>As a trader</Text>
        </Button>
      );
    }
    if (!props.isAffiliate && props.isTrader) {
      return (
        <Button
          variant="contained"
          color="primary"
          size="sm"
          className="oui-px-2 oui-flex oui-gap-1"
          style={{
            position: "absolute",
            top: "50%",
            right: "24px",
            transform: "translateY(-50%)",
          }}
          onClick={(e) => {
            props.anAnAffiliate();
          }}
        >
          <AffiliateIcon />
          <Text>As an affiliate</Text>
        </Button>
      );
    }

    return undefined;
  };

  if (
    (!props.isAffiliate && !props.isTrader) ||
    props.isLoading ||
    props.showHome
  ) {
    return (
      <div className="oui-max-w-[960px] oui-py-0 lg:oui-py-4">
        <HomePage />
      </div>
    );
  }

  return (
    <TabsBase
      id="oui-affiliate-dashboard-tab"
      value={props.tab}
      onValueChange={(e) => {
        props.setTab(e as TabTypes);
      }}
      className="oui-w-full"
    >
      <TabsList
        className={cn(
          "oui-px-6 oui-flex oui-flex-row oui-justify-start oui-h-[44px] oui-relative oui-items-end",
          "oui-text-base md:oui-text-lg",
          "oui-rounded-xl oui-bg-base-9",
          "oui-border oui-border-line-6",
          props.isAffiliate && props.isTrader && "oui-justify-center"
        )}
      >
        {props.isAffiliate && (
          <TabsTrigger
            id="oui-affiliate-dashboard-tab-affiliate"
            value={TabTypes.affiliate}
          >
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
        )}
        {props.isTrader && (
          <TabsTrigger
            id="oui-affiliate-dashboard-tab-trader"
            value={TabTypes.trader}
          >
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
        )}
        {extendNode()}
      </TabsList>
      {props.isAffiliate && (
        <TabsContent value={TabTypes.affiliate} className="oui-mt-4">
          <AffiliatePage />
        </TabsContent>
      )}
      {props.isTrader && (
        <TabsContent value={TabTypes.trader} className="oui-mt-4">
          <TraderPage />
        </TabsContent>
      )}
    </TabsBase>
  );
};
