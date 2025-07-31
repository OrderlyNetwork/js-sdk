import { FC } from "react";
import { ScaffoldProps } from "@orderly.network/ui-scaffold";
import { CommonBaseLayout } from "../../../components/layout";
import { useNav } from "../../hooks/useNav";

export type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
};
export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const { onRouteChange } = useNav();

  return (
    <CommonBaseLayout onRouteChange={onRouteChange} {...props}>
      {props.children}
    </CommonBaseLayout>
  );
};
