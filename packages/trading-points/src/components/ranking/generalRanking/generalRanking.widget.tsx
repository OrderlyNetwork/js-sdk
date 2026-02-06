import { FC } from "react";
import { Ranking, RankingProps } from "../shared/ranking.ui";
import {
  GeneralRankingScriptOptions,
  useGeneralRankingScript,
} from "./generalRanking.script";

export type GeneralRankingWidgetProps = Pick<
  RankingProps,
  "style" | "className" | "fields"
> &
  GeneralRankingScriptOptions;

export const GeneralRankingWidget: FC<GeneralRankingWidgetProps> = (props) => {
  const { address, fields, ...rest } = props;
  const state = useGeneralRankingScript({ address });
  return <Ranking {...state} {...rest} fields={fields} type="general" />;
};
