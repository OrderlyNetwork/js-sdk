import { FC } from "react";
import { InfoCircleIcon, Tooltip, Text, Button } from "@orderly.network/ui";
import { CampaignConfig, UserData } from "../campaigns/type";
import {
  calculateEstimatedRewards,
  calculateEstimatedTickets,
  formatRewardAmount,
  formatTicketCount,
} from "./utils";

interface RewardsDesktopUIProps {
  campaign?: CampaignConfig;
  userdata?: UserData;
}

// Mock data for testing rewards calculation
const mockUserData: UserData = {
  account_id: "mock_user_001",
  current_rank: 5,
  trading_volume: 75000, // $75k volume to test different reward tiers
  pnl: 2500, // $2.5k PnL
  total_participants: 1000,
};

export const RewardsDesktopUI: FC<RewardsDesktopUIProps> = ({
  campaign,
  userdata,
}) => {
  // Use mock data for userdata if not provided
  const currentUserData = userdata || mockUserData;

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

  return (
    <div className="oui-flex oui-flex-col oui-gap-6 oui-pb-10 oui-mb-10">
      <div className="oui-w-full oui-flex oui-items-center oui-gap-3">
        <RewardItem
          title="Estimated rewards"
          value={rewardText}
          showTooltip
          tooltip="Based on your current performance and rank estimation"
        />
        {/* {campaign?.ticket_rules && (
      <RewardItem 
        title="Estimated tickets earned" 
        value={ticketText} 
      />
    )} */}
        <RewardItem title="Estimated tickets earned" value={ticketText} />
      </div>
      <div className="oui-flex oui-items-center oui-justify-center">
        <Button size="sm" variant="gradient" color="primary">
          View rules
        </Button>
      </div>
    </div>
  );
};

const RewardItem: FC<{
  title: string;
  value: string;
  showTooltip?: boolean;
  tooltip?: string;
}> = (props) => {
  return (
    <div className="oui-flex-1 oui-px-5 oui-py-4 oui-flex oui-flex-col oui-items-center oui-bg-base-9 oui-rounded-2xl">
      <div className="oui-text-base-contrast-54 oui-text-sm oui-font-semibold">
        {props.title}
      </div>
      <div className="oui-flex oui-items-center oui-gap-2">
        <Text.gradient weight="bold" color="brand" className="oui-text-[32px]">
          {props.value}
        </Text.gradient>
        {props.showTooltip && (
          <Tooltip content={props.tooltip}>
            <InfoCircleIcon />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
