import React from "react";
import {
  PredictionWidget,
  type PredictionWidgetProps,
} from "./prediction.widget";

export const PredictionPage: React.FC<PredictionWidgetProps> = (props) => {
  return <PredictionWidget {...props} />;
};
