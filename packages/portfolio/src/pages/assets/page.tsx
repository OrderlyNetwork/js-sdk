import React from "react";
import { AssetsWidget } from "./assets.widget";
import type { AssetsWidgetProps } from "./assets.widget";

export type AssetsPageProps = AssetsWidgetProps;

export const AssetsPage: React.FC = () => {
  return <AssetsWidget />;
};
