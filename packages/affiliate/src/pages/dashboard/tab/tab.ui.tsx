import { FC } from "react";
import {
  Button,
  cn,
  Flex,
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
import { useTranslation } from "@orderly.network/i18n";

export const Tab: FC<
  TabReturns & {
    classNames?: {
      loadding?: string;
      home?: string;
      dashboard?: string;
    };
  }
> = (props) => {
  const { t } = useTranslation();
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
          <Text>{t("affiliate.asTrader.title")}</Text>
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
          <Text>{t("affiliate.asAffiliate.title")}</Text>
        </Button>
      );
    }

    return undefined;
  };

  if (props.isLoading) {
    return (
      <div className={cn("oui-max-w-[960px]", props.classNames?.loadding)}>
        {props.splashPage?.() || <HomePage />}
      </div>
    );
  }

  if ((!props.isAffiliate && !props.isTrader) || props.showHome) {
    return (
      <div className={cn("oui-max-w-[960px]", props?.classNames?.home)}>
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
      className={cn("oui-w-full", props.classNames?.dashboard)}
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
            <Flex direction={"row"} gap={1} mb={2}>
              <AffiliateIcon
                fillOpacity={1}
                fill="currentColor"
                className={
                  props.tab === TabTypes.affiliate
                    ? "oui-fill-white/[.98]"
                    : "oui-fill-white/[.36]"
                }
              />
              <Text>{t("affiliate.title")}</Text>
            </Flex>
          </TabsTrigger>
        )}
        {props.isTrader && (
          <TabsTrigger
            id="oui-affiliate-dashboard-tab-trader"
            value={TabTypes.trader}
          >
            <Flex direction={"row"} gap={1} mb={2}>
              <TraderIcon
                fillOpacity={1}
                fill="currentColor"
                className={
                  props.tab === TabTypes.trader
                    ? "oui-fill-white/[.98]"
                    : "oui-fill-white/[.36]"
                }
              />
              <Text>{t("affiliate.trader")}</Text>
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
