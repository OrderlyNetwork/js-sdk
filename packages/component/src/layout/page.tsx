import { FC, HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  // systemState: SystemStateEnum;
  xs?: ReactNode;
  md?: ReactNode;
}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  //measure layout
  // useLayoutEffect(() => {}, []);
  const matches = useMediaQuery(MEDIA_TABLET);

  if (matches) {
    return <>{props.md}</>;
  }

  return <>{props.children}</>;
};
