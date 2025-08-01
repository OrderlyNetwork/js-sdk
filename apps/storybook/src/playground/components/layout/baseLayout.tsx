import { FC } from "react";
import { ScaffoldProps } from "@orderly.network/ui-scaffold";
import { BaseLayout as CommonBaseLayout } from "../../../components/layout";

export type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
};
export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  return <CommonBaseLayout {...props}>{props.children}</CommonBaseLayout>;
};
