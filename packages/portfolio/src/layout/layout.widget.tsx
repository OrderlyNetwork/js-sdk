import { FC, PropsWithChildren } from "react";
import { PortfolioLayout, PortfolioLayoutProps } from "./layout.ui";
import { usePortfolioLayoutScript } from "./layout.script";

export type PortfolioLayoutWidgetProps = PortfolioLayoutProps;

export const PortfolioLayoutWidget: FC<
  PropsWithChildren<PortfolioLayoutWidgetProps>
> = (props) => {
  const state = usePortfolioLayoutScript({
    current: props.leftSideProps?.current,
  });
  return (
    <PortfolioLayout {...state} {...props}>
      {props.children}
    </PortfolioLayout>
  );
};
