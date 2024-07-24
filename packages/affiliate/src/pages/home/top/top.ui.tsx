import { FC } from "react";
import { TopReturns } from "./top.script";
import { TitleWidget } from "../title";
import { SubtitleWidget } from "../subtitle";

export const Top: FC<TopReturns> = (props) => {
  if (props.overwriteTop !== undefined) {
    return props.overwriteTop?.(props.state);
  }
  return (
    <div id="oui-affiliate-home-top">
      <TitleWidget />
      <SubtitleWidget />
    </div>
  );
};
