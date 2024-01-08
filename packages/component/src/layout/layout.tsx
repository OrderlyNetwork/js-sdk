import { FC, PropsWithChildren } from "react";

export const Layout: FC<PropsWithChildren> = (props) => {
  return <div>{props.children}</div>;
};
