import { FC, PropsWithChildren } from "react";
import { usePortfolioLayoutScript } from "./layout.script";
import { PortfolioLayout, PortfolioLayoutProps } from "./layout.ui";

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
