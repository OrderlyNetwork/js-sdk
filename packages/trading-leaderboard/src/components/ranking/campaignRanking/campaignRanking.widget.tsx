import { FC } from "react";
import { Ranking, RankingProps } from "../shared/ranking.ui";
import {
  CampaignRankingScriptOptions,
  useCampaignRankingScript,
} from "./campaignRanking.script";

export type CampaignRankingWidgetProps = Pick<
  RankingProps,
  "style" | "className"
> &
  CampaignRankingScriptOptions;

export const CampaignRankingWidget: FC<CampaignRankingWidgetProps> = (
  props,
) => {
  const { campaignId, ...rest } = props;
  const state = useCampaignRankingScript({
    campaignId,
  });

  // @ts-ignore
  return <Ranking {...state} {...rest} />;
};
