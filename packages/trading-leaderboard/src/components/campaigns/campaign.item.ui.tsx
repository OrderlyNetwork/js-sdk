import { FC } from "react";
import { cn, Text, useScreen } from "@orderly.network/ui";
import { CampaignConfig, CampaignTagEnum } from "./type";

interface CampaignItemUIProps {
  className?: string;
  active?: boolean;
  tag: CampaignTagEnum;
  onCampaignChange: (campaignId: string) => void;
  campaign: CampaignConfig;
  backgroundSrc?: string;
  classNames?: {
    container?: string;
    content?: string;
    tag?: {
      container?: string;
      text?: string;
    };
    title?: string;
  };
}

export const CampaignItemUI: FC<CampaignItemUIProps> = ({
  active,
  tag,
  onCampaignChange,
  campaign,
  backgroundSrc,
  classNames,
}) => {
  return (
    <div
      className={cn([
        "oui-w-full",
        "oui-bg-white/[0.04] oui-h-[78px] oui-rounded-lg oui-overflow-hidden oui-relative oui-cursor-pointer",
        "oui-group oui-border oui-border-solid oui-backdrop-blur-[200px]",
        active
          ? "oui-border-[rgba(var(--oui-gradient-brand-start))]"
          : "oui-border-transparent",
        "hover:oui-border-base-contrast",
        classNames?.container,
      ])}
      onClick={() => onCampaignChange(campaign.campaign_id.toString())}
    >
      <CampaignTag tag={tag} active={active} classNames={classNames?.tag} />
      <div
        className={cn([
          "oui-absolute oui-top-0 oui-left-0 oui-w-full oui-h-full",
          "oui-bg-cover oui-bg-center oui-bg-no-repeat oui-bg-blend-luminosity",
          active ? "oui-bg-transparent" : "oui-bg-[lightgray] oui-opacity-40",
          "group-hover:oui-bg-transparent group-hover:oui-opacity-100",
        ])}
        style={{
          backgroundImage: `url(${campaign?.image || backgroundSrc})`,
        }}
      />
      <div
        className={cn([
          "oui-flex oui-flex-col oui-items-center oui-justify-center oui-gap-1 oui-h-full oui-w-full",
          "oui-absolute oui-z-10 oui-top-0 oui-left-0",
          // "oui-bg-cover oui-bg-center oui-bg-no-repeat oui-bg-blend-luminosity",
          // active ? "oui-bg-transparent" : "oui-bg-[lightgray]",
          // "group-hover:oui-bg-transparent",
          classNames?.content,
        ])}
        // style={{
        //   backgroundImage: `url(${campaign?.image || backgroundSrc})`,
        // }}
      >
        <Text
          weight="semibold"
          className={cn([
            active ? "oui-text-base-contrast" : "oui-text-base-contrast-54",
            "group-hover:oui-text-base-contrast",
            "oui-trading-leaderboard-title",
            "oui-text-center oui-text-sm oui-w-[60%]",
            classNames?.title,
          ])}
        >
          {campaign.title}
        </Text>
        {campaign.referral_codes && (
          <Text
            className={cn([
              "oui-text-base-contrast-54",
              "oui-text-center oui-text-[10px]",
            ])}
          >
            {Array.isArray(campaign.referral_codes)
              ? campaign.referral_codes.join(",")
              : campaign.referral_codes}
          </Text>
        )}
      </div>
    </div>
  );
};

const CampaignTag: FC<{
  tag: CampaignTagEnum;
  active?: boolean;
  classNames?: {
    container?: string;
    text?: string;
  };
}> = ({ tag, active, classNames }) => {
  const tagText = tag.slice(0, 1).toUpperCase() + tag.slice(1);
  return (
    <div
      className={cn([
        "oui-rounded-br-lg oui-w-fit",
        "oui-flex oui-items-center oui-absolute oui-top-0 oui-left-0 oui-z-10",
        active && tag !== CampaignTagEnum.COMING
          ? "oui-bg-[rgba(var(--oui-gradient-brand-start))]"
          : "oui-bg-base-4",
        active && tag !== CampaignTagEnum.ENDED && "group-hover:oui-bg-base-4",
        tag === CampaignTagEnum.ENDED &&
          "oui-bg-base-6 group-hover:oui-bg-base-6",
        classNames?.container,
      ])}
    >
      {tag === CampaignTagEnum.ENDED ? (
        <Text
          size="2xs"
          weight="semibold"
          className={cn(["oui-text-base-contrast-54", classNames?.text])}
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
            classNames?.text,
          ])}
        >
          {tagText}
        </Text.gradient>
      )}
    </div>
  );
};
