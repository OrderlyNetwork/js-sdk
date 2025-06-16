import { FC, useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Text, InfoCircleIcon, Button, Tooltip } from "@orderly.network/ui";
import { CampaignConfig, CampaignStatistics } from "./type";
import {
  formatCampaignDateRange,
  getTradingVolume,
  getTotalPrizePool,
  getTicketPrizePool,
  formatPrizeAmount,
} from "./utils";

export const CampaignsContentDesktopUI: FC<{
  campaign: CampaignConfig;
  statistics?: CampaignStatistics;
  onLearnMore: () => void;
  onTradeNow: () => void;
  backgroundSrc?: string;
  classNames?: {
    container?: string;
    title?: string;
    description?: string;
    time?: string;
    topContainer?: string;
    descriptionContainer?: string;
  };
  isMobile?: boolean;
}> = ({
  campaign,
  statistics,
  onLearnMore,
  onTradeNow,
  backgroundSrc,
  classNames,
  isMobile,
}) => {
  const { t } = useTranslation();
  const bgSrc = campaign?.image || backgroundSrc;
  const dateRange = formatCampaignDateRange(
    campaign?.start_time,
    campaign?.end_time,
  );
  // for mobile
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipProps = useMemo(() => {
    if (!isMobile) {
      return {};
    }
    return {
      open: tooltipOpen,
      onOpenChange: setTooltipOpen,
    };
  }, [tooltipOpen, isMobile, setTooltipOpen]);

  // Get campaign data using utility functions
  const tradingVolume = getTradingVolume(statistics);
  const totalPrizePool = getTotalPrizePool(campaign);
  const ticketPrizePool = getTicketPrizePool(campaign);

  const canTrade = useMemo(() => {
    return (
      campaign.start_time < new Date().toISOString() &&
      campaign.end_time > new Date().toISOString()
    );
  }, [campaign]);

  const isCampaignStarted = useMemo(() => {
    return campaign.start_time < new Date().toISOString();
  }, [campaign]);

  const tooltipContent = useMemo(() => {
    if (!campaign?.prize_pools) {
      return null;
    }

    return (
      <div className="oui-flex oui-flex-col oui-gap-1 oui-min-w-[240px]">
        {campaign?.prize_pools?.map((pool) => {
          return (
            <div
              key={pool.pool_id}
              className="oui-flex oui-items-center oui-justify-between oui-h-[18px]"
            >
              <Text
                size="2xs"
                weight="semibold"
                className="oui-text-base-contrast-54"
              >
                {pool.label}
              </Text>
              <div className="oui-flex oui-items-center oui-gap-1">
                <Text.numeral
                  dp={2}
                  size="2xs"
                  weight="semibold"
                  className="oui-text-base-contrast"
                >
                  {pool.total_prize}
                </Text.numeral>
                <Text
                  size="2xs"
                  weight="semibold"
                  className="oui-text-base-contrast"
                >
                  {pool.currency}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [campaign]);

  return (
    <div
      className={cn([
        "oui-w-full oui-h-[500px] oui-flex oui-flex-col oui-items-center oui-justify-center oui-gap-10",
        `oui-bg-cover oui-bg-center oui-bg-no-repeat`,
        classNames?.container,
      ])}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(var(--oui-color-base-10) / 1) 0%, rgba(var(--oui-color-base-10) / 0.95) 5%, rgba(var(--oui-color-base-10) / 0.2) 50%, rgba(var(--oui-color-base-10) / 0.95) 95%, rgba(var(--oui-color-base-10) / 1) 100%), url(${bgSrc})`,
      }}
    >
      <div
        className={cn([
          "oui-flex oui-flex-col oui-items-center oui-justify-center oui-gap-[10px]",
          classNames?.topContainer,
        ])}
      >
        <Text
          size="sm"
          weight="semibold"
          className={cn(["oui-text-base-contrast-54", classNames?.time])}
        >
          {dateRange}
        </Text>
        <Text
          className={cn([
            "oui-trading-leaderboard-title oui-text-[48px] oui-leading-[56px] oui-font-bold oui-text-base-contrast oui-text-center",
            classNames?.title,
          ])}
        >
          {campaign.title}
        </Text>
        <div
          className={cn([
            "oui-w-[342px] oui-text-center",
            classNames?.descriptionContainer,
          ])}
        >
          <Text
            size="sm"
            weight="semibold"
            className={cn([
              "oui-text-base-contrast-54",
              classNames?.description,
            ])}
          >
            {campaign.description}
          </Text>
        </div>
      </div>
      <div className="oui-border oui-border-solid oui-border-base-contrast/[0.08] oui-rounded-2xl oui-overflow-hidden">
        <div
          className={cn([
            "oui-flex oui-py-3 oui-px-4 oui-items-center oui-gap-4 oui-backdrop-blur-[10px]",
            isCampaignStarted ? "" : "oui-hidden",
          ])}
        >
          <div className="oui-flex oui-items-center oui-gap-1">
            <Text
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-36"
            >
              {t("tradingLeaderboard.participants")}
            </Text>
            <Text
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-54"
            >
              {statistics?.total_participants}
            </Text>
          </div>
          <div className="oui-flex oui-items-center oui-gap-1">
            <Text
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-36"
            >
              {t("tradingLeaderboard.tradingVolume")}
            </Text>
            <Text.numeral
              dp={2}
              currency="$"
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-54"
            >
              {tradingVolume}
            </Text.numeral>
          </div>
        </div>
        <div
          className={cn([
            "oui-border oui-border-solid oui-border-base-contrast/[0.08] oui-rounded-2xl oui-p-4 oui-bg-primary/[0.08] oui-backdrop-blur-[10px]",
            "oui-flex oui-flex-col oui-gap-4",
            isCampaignStarted ? "" : "oui-border-transparent",
          ])}
        >
          <div className="oui-flex oui-items-center oui-gap-6">
            <div className="oui-flex oui-flex-col">
              <div className="oui-flex oui-items-center oui-gap-1">
                <Text
                  size={isMobile ? "2xs" : "xs"}
                  weight="semibold"
                  className="oui-text-base-contrast-54"
                >
                  {t("tradingLeaderboard.prizePool")}
                </Text>
                <Tooltip
                  // @ts-ignore
                  content={tooltipContent}
                  {...tooltipProps}
                  className="oui-max-w-[260px] oui-bg-base-5 oui-py-1 oui-px-2"
                >
                  <div
                    className="oui-flex oui-items-center oui-justify-center oui-w-4 oui-h-4"
                    onClick={() => setTooltipOpen(true)}
                  >
                    <InfoCircleIcon className="oui-cursor-pointer" />
                  </div>
                </Tooltip>
              </div>
              <div>
                <Text.gradient
                  weight="bold"
                  color="brand"
                  className={cn([
                    "oui-trading-leaderboard-title",
                    isMobile
                      ? "oui-text-[20px] oui-leading-[24px]"
                      : "oui-text-[24px] oui-leading-[28px]",
                  ])}
                >
                  {totalPrizePool
                    ? formatPrizeAmount(
                        totalPrizePool.amount,
                        totalPrizePool.currency,
                      )
                    : "0 USDC"}
                </Text.gradient>
              </div>
            </div>
            {ticketPrizePool && (
              <div className="oui-flex oui-flex-col">
                <div className="oui-flex oui-items-center oui-gap-1">
                  <Text
                    size={isMobile ? "2xs" : "xs"}
                    weight="semibold"
                    className="oui-text-base-contrast-54"
                  >
                    {t("tradingLeaderboard.ticketPrizePool")}
                  </Text>
                </div>
                <div>
                  <Text.gradient
                    weight="bold"
                    color="brand"
                    className={cn([
                      "oui-trading-leaderboard-title",
                      isMobile
                        ? "oui-text-[20px] oui-leading-[24px]"
                        : "oui-text-[24px] oui-leading-[28px]",
                    ])}
                  >
                    {formatPrizeAmount(
                      ticketPrizePool.amount,
                      ticketPrizePool.currency,
                    )}
                  </Text.gradient>
                </div>
              </div>
            )}
          </div>
          {isMobile}
          <div className="oui-flex oui-gap-4">
            {!isMobile && (
              <Button
                size="md"
                variant="outlined"
                className="oui-flex-1 
              oui-border-[rgb(var(--oui-gradient-brand-start))] 
              oui-text-[rgb(var(--oui-gradient-brand-start))] 
              hover:oui-bg-[rgb(var(--oui-gradient-brand-start))]/[0.08]
              active:oui-bg-[rgb(var(--oui-gradient-brand-start))]/[0.08]
              "
                onClick={onLearnMore}
              >
                {t("tradingLeaderboard.viewRules")}
              </Button>
            )}
            {canTrade && (
              <Button
                size={isMobile ? "sm" : "md"}
                variant="gradient"
                color="primary"
                className="oui-flex-1"
                onClick={onTradeNow}
              >
                {t("tradingLeaderboard.tradeNow")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
