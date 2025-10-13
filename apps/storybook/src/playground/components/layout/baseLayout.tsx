import React from "react";
import type { ScaffoldProps } from "@kodiak-finance/orderly-ui-scaffold";
import { BaseLayout as CommonBaseLayout } from "../../../components/layout";

export type BaseLayoutProps = {
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
};

export const BaseLayout: React.FC<React.PropsWithChildren<BaseLayoutProps>> = (
  props,
) => {
  const { children, ...rest } = props;
  return <CommonBaseLayout {...rest}>{children}</CommonBaseLayout>;
};
