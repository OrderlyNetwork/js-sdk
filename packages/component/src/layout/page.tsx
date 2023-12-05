import {
  FC,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useMemo,
} from "react";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  // systemState: SystemStateEnum;
  xs?: ReactNode;
  md?: ReactNode;
}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  return <>{props.children}</>;
};
