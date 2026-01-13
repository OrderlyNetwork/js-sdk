import React from "react";
import { useHeroScript } from "./hero.script";
import { Hero, type HeroProps } from "./hero.ui";

export type HeroWidgetProps = Pick<HeroProps, "className" | "style"> & {
  onTradeClick?: () => void;
};

export const HeroWidget: React.FC<HeroWidgetProps> = (props) => {
  const { className, style, ...rest } = props;
  const state = useHeroScript(rest);
  return <Hero {...state} className={className} style={style} />;
};
