import {
  FC,
  PropsWithChildren,
  memo,
  useContext,
  useEffect,
  Children,
  ReactElement,
  useState,
} from "react";
import { LayoutContext, LayoutProvider } from "./layoutContext";
import { cn } from "..";
import { LayoutBaseProps } from "./types";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";

interface LayoutProps extends LayoutBaseProps {}

const InnerLayout: FC<PropsWithChildren<LayoutProps>> = (props) => {
  const [elements, setElements] = useState<string[]>([]);
  // console.log("Layout", headerHeight, footerHeight);
  const matches = useMediaQuery(MEDIA_TABLET);

  useEffect(() => {
    const elements: string[] = [];
    Children.forEach(props.children, (child) => {
      // console.log(child);
      const displayName = ((child as ReactElement)?.type as any)?.displayName;
      elements.push(displayName);
    });

    setElements(elements);
  }, []);

  if (matches) {
    return <>{props.mobile}</>;
  }

  return (
    <div
      {...props}
      className={cn("orderly-flex orderly-flex-1", {
        "orderly-flex-col": elements.includes("Header"),
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
