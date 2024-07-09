import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { TopReturns } from "./top.script";
import { TitleWidget } from "../title";
import { SubtitleWidget } from "../subtitle";

export const TopUI: FC<TopReturns> = (props) => {
  if (props.overwriteTop !== undefined) {
    return props.overwriteTop?.(props.state);
  }
  return (
    <>
      <TitleWidget />
      <SubtitleWidget />
    </>
  );
};
