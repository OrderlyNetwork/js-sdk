import { FC } from "react";
import { useGeneralLeaderboardScript } from "./generalLeaderboard.script";
import {
  GeneralLeaderboard,
  GeneralLeaderboardProps,
} from "./generalLeaderboard.ui";

export type GeneralLeaderboardWidgetProps = Pick<
  GeneralLeaderboardProps,
  "style" | "className"
>;

export const GeneralLeaderboardWidget: FC<GeneralLeaderboardWidgetProps> = (
  props,
) => {
  const state = useGeneralLeaderboardScript();

  return (
    <GeneralLeaderboard
      {...state}
      className={props.className}
      style={props.style}
    />
  );
};
