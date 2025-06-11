import { FC } from "react";
import { cn, Text } from "@orderly.network/ui";
import { CampaignConfig, CampaignTagEnum } from "./type";

interface CampaignItemUIProps {
  className?: string;
  active?: boolean;
  tag: CampaignTagEnum;
  onCampaignChange: (campaignId: string) => void;
  campaign: CampaignConfig;
  backgroundSrc?: string;
}

export const CampaignItemUI: FC<CampaignItemUIProps> = ({
  active,
  tag,
  onCampaignChange,
  campaign,
  backgroundSrc,
}) => {
  return (
    <div
      className={cn([
        "oui-w-full",
        "oui-bg-white/[0.04] oui-h-[78px] oui-rounded-lg oui-overflow-hidden oui-relative oui-cursor-pointer",
        "oui-group oui-border oui-border-solid",
        active
          ? "oui-border-[rgba(var(--oui-gradient-brand-start))]"
          : "oui-border-transparent",
        "hover:oui-border-base-contrast",
      ])}
      onClick={() => onCampaignChange(campaign.campaign_id.toString())}
    >
      <CampaignTag tag={tag} active={active} />
      <div
        className={cn([
          "oui-flex oui-items-center oui-justify-center oui-h-full oui-w-full",
          "oui-bg-cover oui-bg-center oui-bg-no-repeat",
          active ? "oui-grayscale-0" : "oui-grayscale",
          "group-hover:oui-grayscale-0",
        ])}
        style={{ backgroundImage: `url(${campaign?.image || backgroundSrc})` }}
      >
        <Text
          size="base"
          weight="semibold"
          className={cn([
            active ? "oui-text-base-contrast" : "oui-text-base-contrast-54",
            "group-hover:oui-text-base-contrast",
            "oui-trading-leaderboard-title",
            "oui-text-center",
          ])}
        >
          {campaign.title}
        </Text>
      </div>
    </div>
  );
};

const CampaignTag: FC<{ tag: CampaignTagEnum; active?: boolean }> = ({
  tag,
  active,
}) => {
  const tagText = tag.slice(0, 1).toUpperCase() + tag.slice(1);
  return (
    <div
      className={cn([
        "oui-h-[23px] oui-py-1 oui-px-2 oui-rounded-br-lg oui-w-fit",
        "oui-flex oui-items-center oui-absolute oui-top-0 oui-left-0 oui-z-10",
        active && tag !== CampaignTagEnum.COMING
          ? "oui-bg-[rgba(var(--oui-gradient-brand-start))]"
          : "oui-bg-base-4",
        active && tag !== CampaignTagEnum.ENDED && "group-hover:oui-bg-base-4",
        tag === CampaignTagEnum.ENDED &&
          "oui-bg-base-6 group-hover:oui-bg-base-6",
      ])}
    >
      {tag === CampaignTagEnum.ENDED ? (
        <Text
          size="2xs"
          weight="semibold"
          className={cn(["oui-text-base-contrast-54"])}
        >
          {tagText}
        </Text>
      ) : (
        <Text.gradient
          size="2xs"
          weight="semibold"
          color="brand"
          className={cn([
            active &&
              tag !== CampaignTagEnum.COMING &&
              "oui-text-black/[0.88] group-hover:oui-text-transparent",
          ])}
        >
          {tagText}
        </Text.gradient>
      )}
    </div>
  );
};
