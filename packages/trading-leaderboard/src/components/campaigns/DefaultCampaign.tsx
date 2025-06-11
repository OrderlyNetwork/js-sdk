import { FC } from "react";
import { cn } from "@orderly.network/ui";

export const DefaultCampaign: FC<{
  currentCampaignId: string;
  onCampaignChange: (campaignId: string) => void;
}> = ({ currentCampaignId, onCampaignChange }) => {
  return (
    <div
      className={cn([
        "oui-trading-leaderboard-title",
        "oui-flex oui-items-center oui-justify-center oui-cursor-pointer",
        "oui-bg-white/[0.04] oui-h-[78px] oui-rounded-lg oui-min-w-[322px] oui-border oui-border-solid",
        currentCampaignId === "general"
          ? "oui-border-[rgba(var(--oui-gradient-brand-start))]"
          : "oui-border-transparent",
      ])}
      onClick={() => onCampaignChange("general")}
    >
      General leaderboard
    </div>
  );
};
