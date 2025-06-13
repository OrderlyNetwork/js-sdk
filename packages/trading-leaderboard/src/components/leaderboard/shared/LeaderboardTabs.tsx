import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, TabPanel, Tabs } from "@orderly.network/ui";
import { LeaderboardTab } from "../../../type";
import { formatUpdateDate } from "../../../utils";
import { useTradingLeaderboardContext } from "../../provider";

type LeaderboardTabsProps = {
  isMobile?: boolean;
  className?: string;
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
};

export const LeaderboardTabs: FC<LeaderboardTabsProps> = (props) => {
  const { t } = useTranslation();
  const { updatedTime, currentCampaign } = useTradingLeaderboardContext();

  const updateTime = useMemo(() => {
    if (updatedTime) {
      return formatUpdateDate(updatedTime);
    }
    return "";
  }, [props.isMobile, updatedTime]);

  const { showVolume, showPnl } = useMemo(() => {
    const metrics = currentCampaign?.prize_pools?.map((item) => item.metric);
    const showVolume = metrics?.includes(LeaderboardTab.Volume);
    const showPnl = metrics?.includes(LeaderboardTab.Pnl);

    return {
      showVolume,
      showPnl,
    };
  }, [currentCampaign, props.activeTab]);

  const renderTabs = () => {
    if (showVolume && showPnl) {
      return (
        <Tabs
          value={props.activeTab}
          onValueChange={props.onTabChange as (tab: string) => void}
          variant="contained"
          size="lg"
          key={currentCampaign?.campaign_id}
        >
          <TabPanel
            title="Trading volume"
            value={LeaderboardTab.Volume}
          ></TabPanel>
          <TabPanel
            title={t("tradingLeaderboard.realizedPnl")}
            value={LeaderboardTab.Pnl}
          ></TabPanel>
        </Tabs>
      );
    }

    if (showVolume) {
      return (
        <Tabs
          value={props.activeTab}
          onValueChange={props.onTabChange as (tab: string) => void}
          variant="contained"
          size="lg"
          key={currentCampaign?.campaign_id}
        >
          <TabPanel
            title={t("tradingLeaderboard.tradingVolume")}
            value={LeaderboardTab.Volume}
          ></TabPanel>
        </Tabs>
      );
    }

    if (showPnl) {
      return (
        <Tabs
          value={props.activeTab}
          onValueChange={props.onTabChange as (tab: string) => void}
          variant="contained"
          size="lg"
          key={currentCampaign?.campaign_id}
        >
          <TabPanel
            title={t("tradingLeaderboard.realizedPnl")}
            value={LeaderboardTab.Pnl}
          ></TabPanel>
        </Tabs>
      );
    }
    return <div></div>;
  };

  return (
    <Flex
      width="100%"
      py={3}
      justify="between"
      className={cn(
        "oui-trading-leaderboard-ranking-tabs",
        "oui-border-b oui-border-line",
        props.className,
      )}
    >
      {renderTabs()}
      {/* <Tabs
        value={props.activeTab}
        onValueChange={props.onTabChange as (tab: string) => void}
        variant="contained"
        size="lg"
      >
        <TabPanel
          title="Trading volume"
          value={LeaderboardTab.Volume}
        ></TabPanel>
        <TabPanel title="Realized PnL" value={LeaderboardTab.Pnl}></TabPanel>
      </Tabs> */}
      {updateTime && (
        <Flex
          itemAlign="start"
          direction={props.isMobile ? "column" : "row"}
          gap={1}
          className={cn(
            props.isMobile ? "oui-text-3xs" : "oui-text-sm",
            "oui-text-base-contrast-36",
          )}
        >
          <span>{t("tradingLeaderboard.lastUpdate")}:</span>
          <span>{updateTime}</span>
        </Flex>
      )}
    </Flex>
  );
};
