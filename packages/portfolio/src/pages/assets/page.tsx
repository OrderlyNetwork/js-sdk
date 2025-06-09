import React from "react";
import { AssetsWidget, AssetsWidgetProps } from "./assets.widget";

export type AssetsPageProps = AssetsWidgetProps;

export const AssetsPage: React.FC = () => {
  return <AssetsWidget />;
};
