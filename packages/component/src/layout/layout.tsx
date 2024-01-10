import { FC, PropsWithChildren, memo, useContext, useEffect } from "react";
import { LayoutContext, LayoutProvider } from "./layoutContext";
import { cn } from "..";
import { LayoutBaseProps } from "./types";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";

interface LayoutProps extends LayoutBaseProps {}

const InnerLayout: FC<PropsWithChildren<LayoutProps>> = (props) => {
  const { siderWidth, headerHeight, footerHeight, isTopLevel } =
    useContext(LayoutContext);
  // console.log("Layout", headerHeight, footerHeight);
  const matches = useMediaQuery(MEDIA_TABLET);

  useEffect(() => {
    console.log(props.children);
  }, []);

  if (matches) {
    return <>{props.mobile}</>;
  }

  return (
    <div
      className={cn("orderly-flex orderly-flex-1", {
        "orderly-flex-col":
          siderWidth === 0 && (headerHeight > 0 || footerHeight > 0),
      })}
    >
      {props.children}
    </div>
  );
};

export const Layout = memo((props: LayoutProps) => {
  return (
    <LayoutProvider>
      <InnerLayout {...props} />
    </LayoutProvider>
  );
});

Layout.displayName = "Layout";
