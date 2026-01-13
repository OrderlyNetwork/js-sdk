import React from "react";
import { useProgressSectionScript } from "./progressSection.script";
import {
  ProgressSection,
  type ProgressSectionProps,
} from "./progressSection.ui";

export type ProgressSectionWidgetProps = Pick<
  ProgressSectionProps,
  "className" | "style"
> & {
  currentVolume?: number;
  targetVolume?: number;
  onButtonClick?: () => void;
};

export const ProgressSectionWidget: React.FC<ProgressSectionWidgetProps> = (
  props,
) => {
  const { className, style, ...rest } = props;
  const state = useProgressSectionScript(rest);
  return <ProgressSection {...state} className={className} style={style} />;
};
