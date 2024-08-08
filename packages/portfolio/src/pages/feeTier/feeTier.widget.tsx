import { FC } from "react";
import { useFeeTierScript, UseFeeTierScriptOptions } from "./feeTier.script";
import { FeeTier } from "./feeTier.ui";

export type FeeTierWidgetProps = UseFeeTierScriptOptions;

export const FeeTierWidget: FC<FeeTierWidgetProps> = (props) => {
  const state = useFeeTierScript(props);
  return <FeeTier {...state} />;
};
