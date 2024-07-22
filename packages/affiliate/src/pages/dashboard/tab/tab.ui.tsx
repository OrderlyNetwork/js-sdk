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

export const TabUI: FC<TabReturns> = (props) => {
  const extendNode = () => {
    if (props.isAffiliate && !props.isTrader) {
      return (
        <Button
          variant="contained"
          color="success"
          size="sm"
          className="oui-px-2 oui-flex oui-gap-1 oui-absolute oui-right-0 oui-top-2"
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
          className="oui-px-2 oui-flex oui-gap-1 oui-absolute oui-right-0 oui-top-2"
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


  console.log("props", props);
  

  if ((!props.isAffiliate && !props.isTrader) || props.isLoading || props.showHome) {
    return (
      <div className="oui-max-w-[960px]">
        <HomePage />
      </div>
    );
  }

  return (
    <TabsBase
      value={props.tab}
      onValueChange={(e) => {
        props.setTab(e as TabTypes);
      }}
      className="oui-w-full oui-mt-6"
    >
      <TabsList
        className={cn(
          "oui-mx-3 oui-flex oui-flex-row oui-justify-start oui-h-[44px] oui-relative",
          "oui-text-base md:oui-text-lg",
          "oui-rounded-xl oui-bg-base-9",
          props.isAffiliate && props.isTrader && "oui-justify-center"
        )}
      >
        {props.isAffiliate && (
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
        )}
        {props.isTrader && (
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
        )}
        {extendNode()}
      </TabsList>
      {props.isAffiliate && (
        <TabsContent value={TabTypes.affiliate} >
          <AffiliatePage />
        </TabsContent>
      )}
      {props.isTrader && (
        <TabsContent value={TabTypes.trader} >
          <TraderPage />
        </TabsContent>
      )}
    </TabsBase>
  );
};
