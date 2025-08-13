import { FC, useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  cn,
  Text,
  InfoCircleIcon,
  Button,
  Tooltip,
  ChevronRightIcon,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
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
  isParticipated?: boolean;
  shouldShowJoinButton?: boolean;
  joinCampaign?: (data: { campaign_id: string | number }) => Promise<any>;
  isJoining?: boolean;
  joinError?: any;
  canTrade?: boolean;
}> = ({
  campaign,
  statistics,
  onLearnMore,
  onTradeNow,
  backgroundSrc,
  classNames,
  isMobile,
  shouldShowJoinButton,
  joinCampaign,
  isJoining,
  canTrade,
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

  const showTradeButton = useMemo(() => {
    return (
      !shouldShowJoinButton && new Date().toISOString() < campaign.end_time
    );
  }, [shouldShowJoinButton, campaign.end_time]);

  const isCampaignStarted = useMemo(() => {
    return campaign.start_time < new Date().toISOString();
  }, [campaign]);

  const highlightPool = useMemo(() => {
    if (!campaign?.highlight_pool_id) {
      return null;
    }
    return campaign?.prize_pools?.find(
      (pool) => pool.pool_id === campaign.highlight_pool_id,
    );
  }, [campaign]);

  const tooltipContent = useMemo(() => {
    if (!campaign?.prize_pools) {
      return null;
    }

    return (
      <div className="oui-flex oui-min-w-[240px] oui-flex-col oui-gap-1">
        {campaign?.prize_pools?.map((pool) => {
          return (
            <div
              key={pool.pool_id}
              className="oui-flex oui-h-[18px] oui-items-center oui-justify-between"
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
        "oui-flex oui-h-[500px] oui-w-full oui-flex-col oui-items-center oui-justify-center oui-gap-10",
        `oui-bg-cover oui-bg-center oui-bg-no-repeat`,
        classNames?.container,
      ])}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(var(--oui-color-base-10) / 1) 0%, rgba(var(--oui-color-base-10) / 0.8) 15%, rgba(var(--oui-color-base-10) / 0.4) 40%, rgba(var(--oui-color-base-10) / 0.4) 60%, rgba(var(--oui-color-base-10) / 0.8) 85%, rgba(var(--oui-color-base-10) / 1) 100%), url(${bgSrc})`,
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
            "oui-trading-leaderboard-title oui-text-center oui-text-[48px] oui-font-bold oui-leading-[56px] oui-text-base-contrast",
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
      <div className="oui-overflow-hidden oui-rounded-2xl oui-border oui-border-solid oui-border-base-contrast/[0.08]">
        <div
          className={cn([
            "oui-flex oui-items-center oui-gap-4 oui-px-4 oui-py-3 oui-backdrop-blur-[10px]",
            isCampaignStarted ? "" : "oui-hidden",
          ])}
        >
          <div className="oui-flex oui-items-center oui-gap-1">
            <Text
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-54"
            >
              {campaign?.user_account_label ||
                t("tradingLeaderboard.participants")}
            </Text>
            <Text
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-80"
            >
              {statistics?.total_participants}
            </Text>
          </div>
          <div className="oui-flex oui-items-center oui-gap-1">
            <Text
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-54"
            >
              {t("tradingLeaderboard.tradingVolume")}
            </Text>
            <Text.numeral
              dp={2}
              currency="$"
              size="2xs"
              weight="semibold"
              className="oui-text-base-contrast-80"
            >
              {tradingVolume}
            </Text.numeral>
          </div>
        </div>
        <div
          className={cn([
            "oui-rounded-2xl oui-border oui-border-solid oui-border-base-contrast/[0.08] oui-bg-primary/[0.08] oui-p-4 oui-backdrop-blur-[10px]",
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
                  {/* {t("tradingLeaderboard.prizePool")} */}
                  {"Total prize pool"}
                </Text>
                <Tooltip
                  // @ts-ignore
                  content={tooltipContent}
                  {...tooltipProps}
                  className="oui-max-w-[260px] oui-bg-base-5 oui-px-2 oui-py-1"
                >
                  <div
                    className="oui-flex oui-size-4 oui-items-center oui-justify-center"
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
            {(ticketPrizePool || highlightPool) && (
              <div className="oui-flex oui-flex-col">
                <div className="oui-flex oui-items-center oui-gap-1">
                  <Text
                    size={isMobile ? "2xs" : "xs"}
                    weight="semibold"
                    className="oui-text-base-contrast-54"
                  >
                    {/* {t("tradingLeaderboard.ticketPrizePool")} */}
                    {highlightPool?.label || "Raffle prize"}
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
                      ticketPrizePool?.amount ||
                        highlightPool?.total_prize ||
                        0,
                      ticketPrizePool?.currency ||
                        highlightPool?.currency ||
                        "USDC",
                    )}
                  </Text.gradient>
                </div>
              </div>
            )}
          </div>
          {isMobile && campaign?.rule_url && (
            <div
              className="-oui-mb-1 -oui-mt-2 oui-flex oui-items-center oui-gap-0.5 oui-text-2xs oui-leading-[15px] oui-text-base-contrast-36"
              onClick={onLearnMore}
            >
              {t("tradingLeaderboard.viewRules")}
              <ChevronRightIcon
                size={16}
                className="oui-text-base-contrast-36"
              />
            </div>
          )}
          <div
            className={cn([
              "oui-flex oui-gap-4",
              campaign?.rule_url || canTrade ? "" : "oui-hidden",
            ])}
          >
            {!isMobile && campaign?.rule_url && (
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
            <AuthGuard
              buttonProps={{
                size: isMobile ? "sm" : "md",
                className: "oui-px-5",
              }}
            >
              {shouldShowJoinButton && (
                <Button
                  size={isMobile ? "sm" : "md"}
                  variant="gradient"
                  color="primary"
                  className="oui-flex-1"
                  loading={isJoining}
                  disabled={isJoining}
                  onClick={async () => {
                    try {
                      await joinCampaign?.({
                        campaign_id: Number(campaign.campaign_id),
                      });
                    } catch (error) {
                      console.error("Failed to join campaign:", error);
                    }
                  }}
                >
                  {t("tradingLeaderboard.joinNow")}
                </Button>
              )}
              {showTradeButton && (
                <Button
                  size={isMobile ? "sm" : "md"}
                  variant="gradient"
                  color="primary"
                  className="oui-flex-1"
                  onClick={onTradeNow}
                >
                  {campaign?.trading_config?.format ||
                    t("tradingLeaderboard.tradeNow")}
                </Button>
              )}
            </AuthGuard>
          </div>
        </div>
      </div>
    </div>
  );
};
