import {
  FC,
  HTMLAttributes,
  PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import { BaseLayout } from "./baseLayout";
import { LayoutContext } from "./layoutContext";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const PageHeader: FC<PropsWithChildren<PageHeaderProps>> = (props) => {
  const { setPageHeaderHeight } = useContext(LayoutContext);

  const onMeasure = useCallback((height: number, width: number) => {
    setPageHeaderHeight(height);
  }, []);

  return <BaseLayout {...props} onMeasure={onMeasure} />;
};
