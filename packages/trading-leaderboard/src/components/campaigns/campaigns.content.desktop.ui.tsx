import { FC } from "react";
import { cn, Text, InfoCircleIcon, Button } from "@orderly.network/ui";
import { CampaignConfig, CampaignStatistics } from "./type";
import {
  formatCampaignDateRange,
  getParticipantsCount,
  getTradingVolume,
  getTotalPrizePool,
  getTicketPrizePool,
  formatPrizeAmount,
  formatParticipantsCount,
} from "./utils";

export const CampaignsContentDesktopUI: FC<{
  campaign?: CampaignConfig;
  statistics?: CampaignStatistics;
}> = ({ campaign, statistics }) => {
  if (!campaign) {
    return null;
  }

  const bgSrc = campaign?.image;
  const dateRange = formatCampaignDateRange(
    campaign.start_time,
    campaign.end_time,
  );

  // Get campaign data using utility functions
  const participantsCount = getParticipantsCount(statistics);
  const tradingVolume = getTradingVolume(statistics);
  const totalPrizePool = getTotalPrizePool(campaign);
  const ticketPrizePool = getTicketPrizePool(campaign);

  return (
    <div className="oui-w-full oui-flex oui-flex-col">
      <div
        className={cn([
          "oui-w-full oui-h-[500px] oui-flex oui-flex-col oui-items-center oui-justify-center oui-gap-10",
          `oui-bg-cover oui-bg-center oui-bg-no-repeat`,
        ])}
        style={{ backgroundImage: `url(${bgSrc})` }}
      >
        <div className="oui-flex oui-flex-col oui-items-center oui-justify-center oui-gap-[10px]">
          <Text
            size="sm"
            weight="semibold"
            className="oui-text-base-contrast-54"
          >
            {dateRange}
          </Text>
          <Text className="oui-text-[48px] oui-leading-[56px] oui-font-bold oui-text-base-contrast oui-text-center">
            {campaign.title}
          </Text>
          <div className="oui-w-[342px] oui-h-[40px] oui-text-center">
            <Text
              size="sm"
              weight="semibold"
              className="oui-text-base-contrast-54"
            >
              {campaign.description}
            </Text>
          </div>
        </div>
        <div className="oui-border oui-border-solid oui-border-base-contrast/[0.08] oui-rounded-2xl oui-overflow-hidden">
          <div className="oui-flex oui-py-3 oui-px-4 oui-items-center oui-gap-4 oui-backdrop-blur-[10px]">
            <div className="oui-flex oui-items-center oui-gap-1">
              <Text
                size="2xs"
                weight="semibold"
                className="oui-text-base-contrast-36"
              >
                Participants
              </Text>
              <Text
                size="2xs"
                weight="semibold"
                className="oui-text-base-contrast-54"
              >
                {formatParticipantsCount(participantsCount)}
              </Text>
            </div>
            <div className="oui-flex oui-items-center oui-gap-1">
              <Text
                size="2xs"
                weight="semibold"
                className="oui-text-base-contrast-36"
              >
                Trading volume
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
            ])}
          >
            <div className="oui-flex oui-items-center oui-gap-6">
              <div className="oui-flex oui-flex-col">
                <div className="oui-flex oui-items-center oui-gap-1">
                  <Text
                    size="xs"
                    weight="semibold"
                    className="oui-text-base-contrast-54"
                  >
                    Prize pool
                  </Text>
                  <InfoCircleIcon />
                </div>
                <div>
                  <Text.gradient size="2xl" weight="bold" color="brand">
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
                      size="xs"
                      weight="semibold"
                      className="oui-text-base-contrast-54"
                    >
                      Ticket prize pool
                    </Text>
                  </div>
                  <div>
                    <Text.gradient size="2xl" weight="bold" color="brand">
                      {formatPrizeAmount(
                        ticketPrizePool.amount,
                        ticketPrizePool.currency,
                      )}
                    </Text.gradient>
                  </div>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="gradient"
              color="primary"
              className="oui-w-full"
            >
              View rules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
