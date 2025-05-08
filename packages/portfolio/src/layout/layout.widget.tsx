import { FC, PropsWithChildren } from "react";
import { PortfolioLayout, PortfolioLayoutProps } from "./layout.ui";
import { usePortfolioLayoutScript } from "./layout.script";
import { useScreen } from "@orderly.network/ui";
import { PortfolioLayoutMobile } from "./layout.ui.mobile";
export type PortfolioLayoutWidgetProps = PortfolioLayoutProps;

export const PortfolioLayoutWidget: FC<
  PropsWithChildren<PortfolioLayoutWidgetProps>
> = (props) => {
  const state = usePortfolioLayoutScript({
    current: props.leftSideProps?.current,
  });
  const { isMobile } = useScreen();

  return (
    <>
      {isMobile ? (
        <PortfolioLayoutMobile {...state} {...props} />
      ) : (
        <PortfolioLayout {...state} {...props} />
      )}
    </>
  );
};
