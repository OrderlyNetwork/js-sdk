import { FC } from "react";
import { Ranking, RankingProps } from "../shared/ranking.ui";
import {
  GeneralRankingScriptOptions,
  useGeneralRankingScript,
} from "./generalRanking.script";

export type GeneralRankingWidgetProps = Pick<
  RankingProps,
  "style" | "className"
> &
  GeneralRankingScriptOptions;

export const GeneralRankingWidget: FC<GeneralRankingWidgetProps> = (props) => {
  const { dateRange, address, ...rest } = props;
  const state = useGeneralRankingScript({
    dateRange,
    address,
  });

  return <Ranking {...state} {...rest} />;
};
