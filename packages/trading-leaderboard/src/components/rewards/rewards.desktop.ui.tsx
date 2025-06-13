import { FC, useMemo } from "react";
import { InfoCircleIcon, Tooltip, Text, Button, cn } from "@orderly.network/ui";
import { CampaignConfig, UserData } from "../campaigns/type";
import {
  calculateEstimatedRewards,
  calculateEstimatedTickets,
  calculateUserPoolReward,
  formatRewardAmount,
  formatTicketCount,
  calculateTicketProgress,
} from "./utils";

interface RewardsDesktopUIProps {
  campaign?: CampaignConfig;
  userdata?: UserData;
  onLearnMore: () => void;
  onTradeNow: () => void;
}

export const RewardsDesktopUI: FC<RewardsDesktopUIProps> = ({
  campaign,
  userdata,
  onLearnMore,
  onTradeNow,
}) => {
  // Use mock data for userdata if not provided
  const currentUserData = userdata;

  // Calculate estimated rewards
  const estimatedRewards =
    campaign && currentUserData
      ? calculateEstimatedRewards(currentUserData, campaign)
      : null;

  // Calculate estimated tickets
  const estimatedTickets =
    campaign?.ticket_rules && currentUserData
      ? calculateEstimatedTickets(currentUserData, campaign.ticket_rules)
      : 0;

  const rewardText = estimatedRewards
    ? formatRewardAmount(estimatedRewards.amount, estimatedRewards.currency)
    : "0 USDC";

  const ticketText = formatTicketCount(estimatedTickets);

  const canTrade = useMemo(() => {
    return (
      campaign?.start_time &&
      campaign?.end_time &&
      campaign.start_time < new Date().toISOString() &&
      campaign.end_time > new Date().toISOString()
    );
  }, [campaign]);

  const tooltipContent = useMemo(() => {
    if (!campaign?.prize_pools || !currentUserData) {
      return null;
    }

    return (
      <div className="oui-flex oui-flex-col oui-gap-1 oui-min-w-[240px]">
        {campaign?.prize_pools?.map((pool) => {
          const userPoolReward = calculateUserPoolReward(currentUserData, pool);

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
                  {userPoolReward}
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
  }, [campaign, currentUserData]);

  const ticketTooltipContent = useMemo(() => {
    const ticketRules = campaign?.ticket_rules;

    if (!ticketRules) {
      return null;
    }

    if (ticketRules.mode === "linear") {
      return (
        <div>
          {`Earn ${ticketRules?.linear?.tickets} ticket every $${ticketRules?.linear?.every} trading volume.`}
        </div>
      );
    }

    return (
      <div className="oui-flex oui-flex-col oui-gap-1 oui-min-w-[240px]">
        {ticketRules?.tiers?.map((tier) => {
          return (
            <div
              key={tier.value}
              className="oui-flex oui-items-center oui-justify-between h-[18px] oui-text-2xs oui-font-semibold"
            >
              <div className="oui-text-base-contrast-54">{`$${tier.value} volume`}</div>
              <div className="oui-text-base-contrast">
                {tier.tickets} tickets
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [campaign]);

  const extraProps = useMemo(() => {
    // return {
    //   showExtraInfo: true,
    //   extraInfo: {
    //     percent: 30,
    //     value: 999,
    //   },
    // }

    if (!userdata || !campaign?.ticket_rules) {
      return {
        showExtraInfo: false,
        extraInfo: null,
      };
    }

    const progress = calculateTicketProgress(userdata, campaign.ticket_rules);

    if (!progress) {
      return {
        showExtraInfo: false,
        extraInfo: null,
      };
    }

    return {
      showExtraInfo: true,
      extraInfo: progress,
    };
  }, [campaign, userdata]);

  console.log(userdata, campaign);

  return (
    <div className="oui-flex oui-flex-col oui-gap-6 oui-pb-10 oui-mb-10 oui-max-w-[992px] oui-mx-auto">
      <div className="oui-w-full oui-flex oui-items-stretch oui-gap-3">
        <RewardItem
          title="Estimated rewards"
          value={rewardText}
          showTooltip
          tooltip={tooltipContent}
        />
        <RewardItem
          showTooltip={!!campaign?.ticket_rules}
          title="Estimated tickets earned"
          value={ticketText}
          tooltip={ticketTooltipContent}
          {...extraProps}
        />
      </div>
      <div className="oui-flex oui-gap-3 oui-justify-center">
        <Button
          size="lg"
          variant="outlined"
          className=" oui-w-[140px]
              oui-border-[rgb(var(--oui-gradient-brand-start))] 
              oui-text-[rgb(var(--oui-gradient-brand-start))] 
              hover:oui-bg-[rgb(var(--oui-gradient-brand-start))]/[0.08]
              active:oui-bg-[rgb(var(--oui-gradient-brand-start))]/[0.08]
              "
          onClick={onLearnMore}
        >
          View rules
        </Button>
        {canTrade && (
          <Button
            size="lg"
            variant="gradient"
            color="primary"
            className=" oui-w-[140px]"
            onClick={onTradeNow}
          >
            Trade now
          </Button>
        )}
      </div>
    </div>
  );
};

const RewardItem: FC<{
  title: string;
  value: string;
  showTooltip?: boolean;
  tooltip?: any;
  showExtraInfo?: boolean;
  extraInfo?: {
    percent: number;
    value: number;
  } | null;
}> = (props) => {
  return (
    <div className="oui-flex-1 oui-px-5 oui-py-4 oui-flex oui-flex-col oui-items-center oui-bg-base-9 oui-rounded-2xl oui-justify-center">
      <div className="oui-text-base-contrast-54 oui-text-sm oui-font-semibold">
        {props.title}
      </div>
      <div className="oui-flex oui-items-center oui-gap-2">
        <Text.gradient
          weight="bold"
          color="brand"
          className="oui-trading-leaderboard-title oui-text-[32px] oui-h-10 oui-leading-10"
        >
          {props.value}
        </Text.gradient>
        {props.showTooltip && (
          <Tooltip content={props.tooltip}>
            <div className="oui-flex oui-items-center oui-justify-center oui-w-4 oui-h-4">
              <InfoCircleIcon className="oui-cursor-pointer" />
            </div>
          </Tooltip>
        )}
      </div>
      {props.showExtraInfo && (
        <div className="oui-flex oui-flex-col oui-items-center oui-justify-end">
          <div className="oui-text-base-contrast-36 oui-text-2xs oui-font-semibold oui-flex oui-flex-col oui-items-center oui-gap-1">
            <div className="oui-w-[225px] oui-h-[18px] oui-p-[2px] oui-bg-base-5 oui-rounded-[100px] oui-flex oui-items-center">
              <div
                className={cn([
                  "oui-h-[14px] oui-rounded-[100px]",
                  "oui-bg-[linear-gradient(270deg,rgb(var(--oui-gradient-brand-start))_0%,rgb(var(--oui-gradient-brand-end))_100%)]",
                ])}
                style={{ width: `${props?.extraInfo?.percent}%` }}
              />
            </div>
            <div>
              Trade{" "}
              <span className="oui-text-base-contrast">
                ${props?.extraInfo?.value}
              </span>{" "}
              more to get next tickets
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
