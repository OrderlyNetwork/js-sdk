import { FC, PropsWithChildren, memo, useContext } from "react";
import { LayoutContext, LayoutProvider } from "./layoutContext";
import { cn } from "..";

const InnerLayout: FC<PropsWithChildren> = (props) => {
  const { siderWidth, headerHeight, footerHeight } = useContext(LayoutContext);
  console.log("Layout", headerHeight, footerHeight);
  return (
    <div
      className={cn("orderly-flex orderly-flex-1", {
        "orderly-flex-col": headerHeight > 0 || footerHeight > 0,
      })}
    >
      {props.children}
    </div>
  );
};

export const Layout = memo((props) => {
  return (
    <LayoutProvider>
      <InnerLayout {...props} />
    </LayoutProvider>
  );
});
