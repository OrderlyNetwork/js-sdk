import { FC } from "react";
import { FeeTierWidget, FeeTierWidgetProps } from "./feeTier.widget";

export type FeeTierPageProps = FeeTierWidgetProps;

export const FeeTierPage: FC<FeeTierPageProps> = (props) => {
  return <FeeTierWidget {...props} />;
};
